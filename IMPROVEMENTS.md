# FormaKit — Weak Spots & How to Fix Them

An audit of the monorepo as of the current `main` (commit `af6c1ed`). Findings are ordered by
severity within each section, and every item points at the file/line where the problem lives.

**Scope reviewed:** `packages/formakit` (core), `packages/formakit-ant-adaptor`,
`packages/formakit-panel`, `apps/web`.

**Overall:** the architecture is sound — a config-driven renderer with a pluggable adaptor layer
and a JSON schema that round-trips through an editor panel is the right shape for this problem.
The weaknesses are almost entirely in the *runtime layer*: state correctness, validation
completeness, accessibility, and the total absence of tests. None of these are structural; all are
fixable without redesign.

---

## 1. Correctness bugs (fix these first)

### 1.1 Side effects run inside a state updater — callbacks fire twice

`packages/formakit/src/hooks/useFormState.ts:45-64`

```ts
setValues((current) => {
    const next = { ...current, [name]: value } as TValues;
    config.callbacks?.onFieldChange?.({ name, value, values: next });   // ❌ side effect
    config.callbacks?.onValuesChange?.({ values: next, changedField: name });
    if (submitCount > 0 && ...) void validateField(name, next);          // ❌ async side effect
    return next;
});
```

React treats updater functions as pure and may invoke them more than once — guaranteed in
StrictMode (which Next.js dev enables), and permitted at any time under concurrent rendering.
Every consumer `onFieldChange` / `onValuesChange` handler therefore fires twice per keystroke in
dev, and `validateField` can be dispatched twice. If a consumer does anything non-idempotent in
those callbacks (analytics, a network sync, an append to a log), it double-fires in production too.

**Fix** — keep the updater pure and move effects out:

```ts
const setValue = useCallback((name, value) => {
    const next = { ...valuesRef.current, [name]: value } as TValues;
    valuesRef.current = next;
    setValues(next);
    setDirtyFields((current) => ({ ...current, [name]: true }));

    config.callbacks?.onFieldChange?.({ name, value, values: next });
    config.callbacks?.onValuesChange?.({ values: next, changedField: name });
    if (submitCountRef.current > 0 && includesRevalidationTrigger(config.mode?.revalidateAfterSubmit, "change")) {
        void validateField(name, next);
    }
}, [config.callbacks, config.mode?.revalidateAfterSubmit, validateField]);
```

Hold `values` in a ref alongside state (or move the whole form to a `useReducer` + external store,
see §2.1) so you can compute `next` without needing the updater's `current`.

### 1.2 The config is rebuilt on every render, so nothing is memoized

`packages/formakit/src/hooks/useFormBuilder.ts:5-10`

```ts
export function useFormBuilder(config) {
    const normalizedConfig = normalizeConfig(config);   // ❌ new object every render
    const form = useFormState(normalizedConfig);
    ...
}
```

`normalizeConfig` allocates a fresh object (and `createDesignSystemComponents` allocates a fresh
component registry with *new component identities*) on every render. That object is the dependency
of nearly every `useCallback`/`useMemo` in `useFormState` (`validateField`, `validateForm`, `reset`,
`submit`), so none of them are ever stable. `FormBuilder.tsx:14` carefully memoizes
`mergedConfig` — and that work is thrown away one line later.

The worst consequence is in `createDesignSystemComponents`: because each render produces new
`DesignFieldComponent` function identities, React unmounts and remounts every field's component
subtree on every render. With Ant Design inputs that means losing focus/IME state mid-typing.

**Fix:**

```ts
export function useFormBuilder(config) {
    const normalizedConfig = useMemo(() => normalizeConfig(config), [config]);
    const form = useFormState(normalizedConfig);
    return { config: normalizedConfig, ...form };
}
```

and memoize the registry inside `normalizeConfig` by caching on the `designSystem` object identity
(a `WeakMap<DesignSystemConfig, FieldComponentRegistry>` works well). Note this makes the *caller's*
`config` identity load-bearing — document that `config` must be stable (`useMemo`'d or module-level),
and consider warning in dev when it changes identity without changing content.

### 1.3 Validation rules silently pass on the wrong type

`packages/formakit/src/utils/runFieldValidation.ts:7-36`

Every rule is guarded by a `typeof` check that returns `null` (valid) when the type doesn't match:

```ts
case "minLength":
    return typeof value === "string" && value.length < rule.value ? msg : null;
case "min":
    return typeof value === "number" && value < rule.value ? msg : null;
```

Concrete failures:

| Case | Expected | Actual |
| --- | --- | --- |
| `required` on an unchecked checkbox (`value === false`) | error | **passes** — `isEmpty` only covers `undefined/null/""` |
| `required` on an empty multi-select (`value === []`) | error | **passes** |
| `min: 18` where the input yields the string `"5"` | error | **passes** — not a `number` |
| `minLength: 3` on an array/number value | error | **passes** |
| `pattern` on a non-string | error | **passes** |

The `required`-on-checkbox case is the one users will hit immediately: a "I accept the terms"
checkbox marked required can never fail validation.

**Fix** — make emptiness type-aware and coerce numerics rather than bailing:

```ts
function isEmpty(value: unknown): boolean {
    if (value === undefined || value === null || value === "") return true;
    if (value === false) return true;                       // unchecked checkbox/switch
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Date) return Number.isNaN(value.getTime());
    return false;
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number") return Number.isNaN(value) ? null : value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
}

function lengthOf(value: unknown): number | null {
    if (typeof value === "string" || Array.isArray(value)) return value.length;
    return null;
}
```

Then each rule should skip only when the value is *empty* (that's `required`'s job) and otherwise
report a type mismatch as an error rather than as a pass.

### 1.4 Async validators have no race protection

`packages/formakit/src/hooks/useFormState.ts:33-43`

`validateField` awaits a user-supplied async validator and then unconditionally writes the result:

```ts
const error = await runFieldValidation({ field, values: nextValues, context: config.context });
setErrors((current) => setFieldError(current, name, error));
```

With a debounced remote check ("is this username taken?"), keystrokes A→B→C can resolve C→A, and
the stale answer for A overwrites the fresh answer for C. The field then shows an error for a value
the user no longer has.

**Fix** — sequence per field and drop stale results:

```ts
const validationSeq = useRef<Record<string, number>>({});

const validateField = useCallback(async (name, nextValues) => {
    const field = findField(config, name);
    if (!field) return null;
    const seq = (validationSeq.current[name] ?? 0) + 1;
    validationSeq.current[name] = seq;

    const error = await runFieldValidation({ field, values: nextValues, context: config.context });
    if (validationSeq.current[name] !== seq) return null;   // superseded
    setErrors((current) => setFieldError(current, name, error));
    return error;
}, [config]);
```

Apply the same guard to `validateForm` (`useFormState.ts:81-94`), which has the same problem across
a double-submit.

### 1.5 `initialValues` is captured once and never re-syncs

`packages/formakit/src/hooks/useFormState.ts:21`

```ts
const [values, setValues] = useState<TValues>(() => createInitialValues(config));
```

The lazy initializer runs exactly once. This is a deliberate and defensible choice for a static
config — but `apps/web` and `formakit-panel` both *fetch* form definitions
(`packages/formakit-panel/src/storage/createStorage.ts:53-88`), so the first render happens with an
empty/placeholder config and the real `initialValues` never land. Consumers have no documented
escape hatch other than remounting via `key`.

**Fix** — pick one and document it:

- Add an explicit `resetOnConfigChange?: boolean` / `values` controlled prop, or
- Track the identity of `config.initialValues` in a ref and call `reset()` when it changes, or
- At minimum, document "`initialValues` is read once; change the `key` on `<FormBuilder>` to
  re-seed" in the README.

Silently ignoring the prop is the one option that shouldn't stay.

### 1.6 Hidden fields keep stale errors

`packages/formakit/src/utils/runFormValidation.ts:14-16` correctly skips hidden and disabled fields,
but per-field validation (`useFormState.ts:33`) does not, and nothing clears an existing error when a
field *becomes* hidden. Sequence: field B fails validation → the user changes field A, which flips
B's `hidden` condition to true → B's error stays in `errors` → `state.isValid` is `false` with no
visible error anywhere on the form. The user is blocked by an invisible field.

**Fix** — prune errors for fields that are no longer visible whenever values change:

```ts
useEffect(() => {
    setErrors((current) => {
        let changed = false;
        const next = { ...current };
        for (const field of collectFields(config)) {
            const gone = resolveCondition(field.hidden, values, config.context)
                      || resolveCondition(field.disabled, values, config.context);
            if (gone && next[field.name]) { delete next[field.name]; changed = true; }
        }
        return changed ? next : current;
    });
}, [values, config]);
```

### 1.7 `submit()` silently does nothing when `config.submit` is absent

`packages/formakit/src/hooks/useFormState.ts:114-136`

```ts
if (!isValid) { config.submit?.onSubmitFailed?.(...); return; }
if (!config.submit) return;   // ❌ valid form, no feedback, no callback, no error
```

A config with no `submit` block still renders a `<form>` whose `onSubmit` calls `submit()`
(`FormBuilder.tsx:24-27`). Pressing enter runs a full validation pass, increments `submitCount`,
and then returns silently. `submit()` also has no return value, so a caller using the
`useFormBuilder` hook directly can't tell success from failure.

**Fix** — return a result and warn in dev:

```ts
const submit = useCallback(async (): Promise<{ ok: boolean; errors: FormErrors<TValues> }> => {
    ...
    if (!config.submit) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[formakit] submit() called but config.submit is not defined.");
        }
        return { ok: true, errors: {} };
    }
    ...
}, [...]);
```

### 1.8 `props.props` is spread last and can clobber the controlled contract

`packages/formakit/src/components/fields/TextField.tsx:16` (and every other field component)

```tsx
<input value={...} onChange={...} {...(props.props as React.InputHTMLAttributes<HTMLInputElement>)} />
```

Any consumer passing `props: { value: "x" }` or `props: { onChange: fn }` breaks the controlled
binding — the field stops updating and React logs no warning because `value` is still present. The
cast to `InputHTMLAttributes` also erases type safety entirely.

**Fix** — spread escape-hatch props *first*, and strip the reserved keys:

```tsx
const { value: _v, onChange: _c, checked: _ch, ...safeProps } = (props.props ?? {}) as Record<string, unknown>;
return <input {...safeProps} value={...} onChange={...} />;
```

### 1.9 `readOnly` on `select` and `radio` is not enforced

`packages/formakit/src/components/fields/SelectField.tsx:13` sets `aria-readonly={readOnly}` but
nothing stops the user changing the value — `aria-readonly` is advisory only, and native `<select>`
has no `readOnly`. `RadioField.tsx:16` conflates it with `disabled`, which is a different semantic
(disabled values are excluded from submission; read-only values are not).

**Fix** — for `select`, guard in the handler and mark it visually:
`onChange={(e) => { if (!readOnly) onChange(e.target.value); }}` plus `aria-readonly`, or render a
disabled select with a hidden input carrying the value so it still submits.

---

## 2. Architecture & performance

### 2.1 Every keystroke re-renders every field

The entire form state lives in one `useState` cluster in `useFormState`, is bundled into a single
`state` object (`useFormState.ts:138`), and is threaded prop-by-prop down
`FormRenderer → FormRow → FormColumn → FieldItemRenderer`. There is no memoization boundary
anywhere on that path. Typing one character in field 1 of a 40-field form re-renders all 40 fields,
re-runs every `options` resolver function (`useFieldController.ts:22-25`) and every `hidden`/
`disabled` condition.

For the "50-field admin form" this library is aimed at, that's the difference between snappy and
visibly laggy — especially with Ant Design components, which are not cheap to render.

**Fix, in increasing order of effort:**

1. `React.memo` on `FieldItemRenderer` with a comparator that only checks that field's slice
   (`values[name]`, `errors[name]`, `touched[name]`) — cheapest, big win.
2. Split the single context into `FormValuesContext` / `FormApiContext` so that consumers of the
   API (buttons, custom items) don't re-render on value changes.
3. The real fix: move form state into an external store with per-field subscriptions
   (`useSyncExternalStore`, or `zustand`/`valtio`). Each field subscribes to `values[name]` and
   `errors[name]` only. This is how React Hook Form and Formik v3 got fast, and it composes
   naturally with the existing `FormRenderApi` shape.

### 2.2 A `<style>` tag is injected once per row

`packages/formakit/src/components/FormRow.tsx:89-91, 107`

```tsx
function FormKitResponsiveGridStyles() { return <style>{responsiveGridStyles}</style>; }
// ...rendered inside every <FormRow>
```

A 10-row form emits ten identical ~4 KB `<style>` blocks into the DOM, on every render pass. It
also makes the CSS impossible for a consumer to override predictably (specificity ties resolve by
document order, which now depends on row count) and is a problem under a strict CSP without
`style-src 'unsafe-inline'`.

**Fix** — ship the grid CSS as a real stylesheet (`formakit/styles.css`, exported via the `exports`
map exactly as `formakit-panel` already does) and have consumers import it once. If runtime
injection must stay, hoist it to a module-level singleton that inserts into `document.head` once:

```ts
let injected = false;
function useGridStyles() {
    useEffect(() => {
        if (injected || typeof document === "undefined") return;
        injected = true;
        const el = document.createElement("style");
        el.dataset.formakit = "grid";
        el.textContent = responsiveGridStyles;
        document.head.appendChild(el);
    }, []);
}
```

The generated CSS itself is also worth simplifying — the five-level nested `var()` fallback chains
(`FormRow.tsx:40-86`) are correct but nearly unreadable; a build step or a flat
`--formakit-column-span` recomputation per breakpoint would be easier to maintain.

### 2.3 `findField` is a linear scan on every keystroke

`packages/formakit/src/hooks/useFormState.ts:8-18` walks rows → columns → items to find one field,
and `collectFields` (`utils/createInitialValues.ts:3-9`) rebuilds the same list on every full
validation. Both should be a single memoized `Map<string, FieldConfig>` built once per config:

```ts
const fieldIndex = useMemo(() => {
    const map = new Map<string, FieldConfig<TValues>>();
    for (const field of collectFields(config)) map.set(field.name, field);
    return map;
}, [config]);
```

This also gives you a natural place to **detect duplicate field names**, which currently fail
silently — two fields sharing a `name` will share a value and only the first will validate.

### 2.4 Configured validation modes are never honored

`packages/formakit/src/constants/defaults.ts` defines `defaultTrigger`, `touchStrategy`, and
`validateOnMount`; `packages/formakit/src/utils/eventTriggers.ts:3` exports `includesTrigger` to
read them. **Nothing imports `includesTrigger`, and none of those three options affect runtime
behavior.** Validation only ever runs on submit, plus post-submit revalidation.

This is worse than a missing feature, because the panel *surfaces these as editable settings*
(`packages/formakit-panel/src/editor/FormMetaEditor.tsx:61-74`,
`packages/formakit-panel/src/schema/defaults.ts:18-19` defaults `defaultTrigger` to
`["blur","submit"]`) and the zod schema validates them (`schema/validate.ts:85-93`). A user sets
"validate on blur" in the editor, saves, and nothing changes. Silent no-op config is the most
expensive kind of bug to diagnose.

**Fix** — implement the three modes in `useFormState`:

```ts
// in setValue
if (includesTrigger(field.validation?.trigger ?? config.mode?.defaultTrigger, "change")) {
    void validateField(name, next);
}
// in setTouched
if (touchedValue && includesTrigger(field.validation?.trigger ?? config.mode?.defaultTrigger, "blur")) {
    void validateField(name, values);
}
// mount
useEffect(() => { if (config.mode?.validateOnMount) void validateForm(); }, []);
```

…and keep the existing post-submit revalidation as the override it's meant to be. If you'd rather
not implement them now, **remove them from the public types and the panel UI** until you do.

### 2.5 Dead code and unused dependencies

- `packages/formakit/package.json` declares `react-grid-layout: ^2.2.2` as a **runtime dependency**.
  It is imported nowhere in the repo. Every consumer of `formakit` currently installs it for
  nothing. Remove it.
- `packages/formakit/src/components/ResponsiveLayout.tsx` and `StaticLayout.tsx` are one-line
  re-exports of `FormRenderer` — leftovers from the rename in `0819759`. Delete them.
- `FormBuilderGlobalProvider` (`context/FormBuilderContext.tsx:38-43`) is an exact alias of
  `FormBuilderAdaptorProvider`. Pick one name, deprecate the other with a JSDoc `@deprecated`.
- `FieldValidationModeOverride` (`types/validation.ts:13-18`) is defined but referenced nowhere.

---

## 3. Accessibility

This is the weakest area of the codebase and the one most likely to block adoption by any team with
an accessibility requirement.

### 3.1 Labels are not associated with their inputs

`packages/formakit/src/components/FieldShell.tsx:15`

```tsx
<label id={`${field.name}-label`} htmlFor={field.name}>
```

`htmlFor` points at `field.name`, but **no field component ever renders an `id`** — they only render
`name` (`TextField.tsx:9`, `SelectField.tsx:8`, `CheckboxField.tsx:9`, …). The association is dead
for every field type except radio groups, which happen to work via `aria-labelledby`
(`RadioField.tsx:14`). Screen readers announce every input as unlabeled, and clicking the label
doesn't focus the input.

**Fix** — generate a stable id and thread it through `FieldComponentProps`:

```tsx
// FieldShell
const inputId = `${formId}-${field.name}`;
<label htmlFor={inputId} id={`${inputId}-label`}>…</label>

// every field component
<input id={props.id} name={props.name} … />
```

Use React 18's `useId()` for the form-level prefix so multiple instances of the same form on one
page don't collide — which they currently do, since `field.name` is the only namespace.

### 3.2 Errors are not announced and not linked to inputs

`FieldShell.tsx:26` renders the error as a plain `<div>`. There is no `aria-describedby` from the
input, no `aria-invalid`, and no live region. A screen reader user who submits an invalid form gets
no feedback at all — the errors appear visually and nowhere else.

**Fix:**

```tsx
<input
    id={inputId}
    aria-invalid={error ? true : undefined}
    aria-describedby={[
        field.description ? `${inputId}-description` : null,
        error ? `${inputId}-error` : null,
    ].filter(Boolean).join(" ") || undefined}
/>
<div id={`${inputId}-description`}>{field.description}</div>
<div id={`${inputId}-error`} role="alert">{error}</div>
```

Also add `aria-required` (the required marker at `FieldShell.tsx:17` is currently a visual-only
` *`), and on failed submit move focus to the first invalid field — that single behavior is the
highest-value a11y improvement you can make for keyboard users.

### 3.3 Radio group labelling is fragile

`RadioField.tsx:14` uses `aria-labelledby={`${props.name}-label`}`, which only resolves if
`field.label` is set (`FieldShell.tsx:14` renders the label conditionally). A radio group with no
label produces a dangling `aria-labelledby` reference. Use `<fieldset>`/`<legend>` for grouped
inputs instead — it's the semantically correct element and degrades gracefully.

### 3.4 No focus management, no `autoComplete`, no keyboard affordances

No field supports `autoComplete`, so browser autofill can't help on the very forms (signup,
checkout, address) this library targets. Add `autoComplete` to `FieldConfig` and pass it through.

---

## 4. `apps/web` API — security & durability

The demo API at `apps/web/app/api/forms/route.ts` and `apps/web/app/api/forms/[id]/route.ts` is
functional but has issues that must not be copied into anything real. Since these routes double as
the reference implementation for `createApiStorage`, they will be copied.

### 4.1 No authentication on write endpoints

`POST /api/forms`, `PUT /api/forms/[id]`, and `DELETE /api/forms/[id]` are unauthenticated. Anyone
who can reach the deployment can rewrite or delete every form definition. Even for a demo, add a
guard and a comment saying so:

```ts
function assertAuthorized(request: Request) {
    const token = request.headers.get("authorization");
    if (token !== `Bearer ${process.env.FORMAKIT_ADMIN_TOKEN}`) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
}
```

`createApiStorage` (`storage/createStorage.ts:53-58`) already supports a `headers` option, so the
client side is ready for this.

### 4.2 Zod parse failures become unhandled 500s

`route.ts:28` — `formDefinitionValidator.parse(await request.json())` throws a `ZodError` that no
handler catches. Next.js returns a 500 with a stack trace instead of a 400 with field-level errors.
`request.json()` on a malformed body throws too.

**Fix:**

```ts
const parsed = formDefinitionValidator.safeParse(await request.json().catch(() => null));
if (!parsed.success) {
    return Response.json({ error: "Invalid form definition", issues: parsed.error.issues }, { status: 400 });
}
```

### 4.3 Read-modify-write on a JSON file, with no locking

Both routes do `readForms()` → mutate → `writeForms()` (`route.ts:14-16`). Two concurrent `PUT`s
interleave and one silently loses its write. `fs.writeFile` is also not atomic — a crash mid-write
truncates `data/forms/index.json` and takes the whole app down, since `readForms` has no fallback
for a missing or corrupt file.

**Fix for the demo:** write to a temp file and `fs.rename` (atomic on POSIX), serialize writes
through an in-process promise chain, and make `readForms` tolerate `ENOENT` by returning `[]`.
**Fix for production guidance:** say plainly in the README that the filesystem adapter is for local
development only — it does not work on serverless/read-only filesystems (Vercel, Lambda) or across
multiple instances. Point users at a database-backed `FormStorageAdapter`, which the interface
already supports.

### 4.4 `createRegistryStorage` mutates its input array's contents

`storage/createStorage.ts:10` does `let forms = [...options.forms]` — a shallow copy. The array is
new but the `FormDefinition` objects inside are shared with the caller's registry
(`apps/web/forms/registry.ts`). `save()` at line 25 replaces entries with clones, so it's safe in
practice, but the initial objects handed out by `list()` at line 15 are live references the caller
can mutate. Make the copy deep (`options.forms.map(structuredClone)`) for consistency with the rest
of the adapter, which is careful about this.

---

## 5. Packaging & publishing

`formakit` and `formakit-ant-adaptor` are published to npm (`private: false`, versions `0.1.2` /
`0.1.1`), so these affect real consumers.

### 5.1 No `"use client"` directive in the core package

`packages/formakit/src/**` contains zero `"use client"` directives, yet `FormBuilder` uses
`useState`/`useMemo`/`useCallback`. `formakit-panel` gets this right
(`packages/formakit-panel/src/index.ts:1`); the core package does not. Any React Server Components
consumer importing `FormBuilder` into a server component gets a runtime error, and the workaround
(wrapping in their own client component) isn't documented. `apps/web/app/page.tsx:1` only works
because the whole page is `"use client"`.

**Fix** — add `"use client"` to `packages/formakit/src/index.tsx` and to `FormBuilder.tsx`. Note
that `tsc` preserves the directive only if it's the first statement in the emitted file; verify the
built `dist/index.js` actually contains it.

### 5.2 Missing `sideEffects: false`

Neither published package declares `sideEffects`. Bundlers must therefore assume every module has
side effects and cannot tree-shake unused field components or utilities. Add `"sideEffects": false`
to both `package.json` files (or `["*.css"]` for `formakit-panel`, which ships a stylesheet).

### 5.3 ESM-only, `tsc`-only build

Both packages build with bare `tsc` and publish ESM only, with no `require` condition in `exports`.
That's a defensible modern choice, but it silently breaks Jest (non-ESM config), older Next.js
setups, and any CJS consumer, with a confusing `ERR_REQUIRE_ESM`. Either:

- Switch to `tsup`/`unbuild` for a dual ESM+CJS build with proper `exports` conditions, or
- State the ESM-only requirement prominently in the README and in `engines`.

`tsc`-only also means no bundling of the JSX runtime hints, no minification, and no `.d.ts` rollup.

### 5.4 Version and metadata drift

- `formakit-ant-adaptor` requires `formakit: ^0.1.0` in `peerDependencies` while the core is at
  `0.1.2` — fine now, but there's no CI check keeping these in sync. Adopt `changesets` for
  coordinated versioning across the workspace.
- `formakit-panel` has no `repository` field (the other two got one in `af6c1ed`) and is not marked
  `private`, so it's ambiguous whether it's meant to be published.
- `formakit-panel` depends on `zod@^3.25.76` as a **runtime dependency**. Zod v4 is current; more
  importantly, a hard dep means consumers can end up with two copies of zod. Consider making it a
  peer dependency, or hand-writing the ~120 lines of validation in `schema/validate.ts` to drop the
  dependency entirely.
- The root `package.json` sets `packageManager: bun@1.2.23` and the repo has a `bun.lock`, but there
  is now an untracked `package-lock.json` in the working tree. Pick one package manager and add the
  other's lockfile to `.gitignore` — mixed lockfiles cause "works on my machine" divergence.

---

## 6. Missing infrastructure

### 6.1 There are no tests. Not one.

`find . -name "*.test.*"` returns nothing. For a library whose entire value proposition is
"validation and state management you don't have to write," this is the single biggest risk in the
repo — and it's why the bugs in §1.3 and §2.4 went unnoticed.

**Minimum viable test suite** (Vitest + `@testing-library/react`, ~a day of work):

```
packages/formakit/src/utils/__tests__/
  runFieldValidation.test.ts    # every rule × every value type — this is a pure function, table-test it
  runFormValidation.test.ts     # hidden/disabled skipping, form-level validator merge order
  createInitialValues.test.ts   # defaultValue vs initialValues precedence
  responsiveGrid.test.ts        # clamping at boundaries (0, 1, 12, 13)
packages/formakit/src/hooks/__tests__/
  useFormState.test.tsx         # setValue/setTouched/submit/reset lifecycles, callback call counts
                                # ← run these under <StrictMode> and §1.1 fails immediately
packages/formakit/src/__tests__/
  FormBuilder.test.tsx          # render → type → submit, conditional visibility, adaptor override
packages/formakit-panel/src/schema/__tests__/
  convert.test.ts               # schemaToFormConfig ∘ formConfigToSchema === identity (round-trip)
```

The round-trip property test on `convert.ts` is especially valuable — the `pattern` rule already
converts `RegExp ⇄ string` in both directions (`convert.ts:10-15, 59-64`), and that's exactly the
kind of asymmetry (flags are dropped: `new RegExp(rule.value)` loses `/i`) that a round-trip test
catches for free. **That's a live bug**: a case-insensitive pattern saved through the panel comes
back case-sensitive.

### 6.2 No CI

There is no `.github/` directory. `turbo run build`, `lint`, and `check-types` all exist as scripts
and nothing runs them. Add:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run check-types
      - run: bun run lint
      - run: bun run test
      - run: bun run build
```

Add a `publish` job gated on a changeset, so `prepublishOnly: npm run build` isn't the only thing
standing between a broken build and npm.

### 6.3 No linting on the published packages

`packages/formakit/package.json` lists `@repo/eslint-config` as a devDependency but defines **no
`lint` script**, so `turbo run lint` skips the core library entirely. `formakit-panel` doesn't even
depend on the shared config. `apps/web` is the only workspace actually being linted.

### 6.4 Documentation gaps

`plan.md` (20 KB, last touched April) is design notes committed at the repo root — move it to
`docs/` or delete it. `packages/formakit-panel/INTEGRATION_PROMPT.md` reads as an AI prompt rather
than user documentation.

More importantly, the README doesn't cover: that `config` must be referentially stable (§1.2), that
`initialValues` is read once (§1.5), that the package is ESM-only (§5.3), or which of the `mode`
options actually work (§2.4). Every one of those is something a user will hit in their first hour.

---

## 7. Suggested order of work

**Week 1 — stop the bleeding**

1. Set up Vitest + the pure-function tests for `runFieldValidation` (§6.1) — you need the safety net
   before touching validation.
2. Fix the validation type guards, especially `required` on booleans/arrays (§1.3).
3. Memoize `normalizeConfig` and the design-system registry (§1.2) — this is a one-line change with
   a large payoff, and it fixes the field-remounting/focus-loss class of bugs.
4. Move side effects out of the `setValues` updater (§1.1).
5. Add `"use client"` to the core package (§5.1) and drop the unused `react-grid-layout` dep (§2.5).

**Week 2 — correctness and access**

6. Wire up `id`/`htmlFor`/`aria-invalid`/`aria-describedby`/`role="alert"` (§3.1, §3.2), plus
   focus-first-error on failed submit.
7. Implement `defaultTrigger` / `touchStrategy` / `validateOnMount`, or remove them from the public
   surface (§2.4).
8. Add async validation sequencing (§1.4) and hidden-field error pruning (§1.6).
9. Fix the `pattern` regex-flag loss in `convert.ts` and add the round-trip test (§6.1).

**Week 3 — hardening**

10. Hoist the grid CSS out of `FormRow` into a real stylesheet (§2.2).
11. `React.memo` the field renderer with a per-field comparator (§2.1, step 1) and benchmark a
    50-field form before/after.
12. Harden the demo API: auth, `safeParse`, atomic writes, and a README note about serverless
    (§4.1–§4.3).
13. Stand up CI and changesets (§6.2, §5.4).

**Later — the bigger bets**

14. Per-field subscriptions via an external store (§2.1, step 3) — the change that makes large forms
    genuinely fast.
15. Dual ESM/CJS build (§5.3).
16. Field arrays / repeatable groups, and nested object paths (`address.city`) — the config schema is
    strictly flat today (`FormErrors` is `Record<keyof TValues & string, string>`), which is the
    largest missing *feature* relative to React Hook Form and the thing most likely to force a user
    to abandon the library mid-project.

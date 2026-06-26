# formakit

A config-driven React form builder with a responsive 12-column grid, built-in validation, and pluggable UI adaptors.

Define your form as JSON — layout, fields, validation rules, and submit handling — and render it with a single `<FormBuilder />` component. Swap the default HTML inputs for Ant Design, MUI, or your own design system without changing the form config.

## Features

- **Config-driven** — rows, columns, and fields defined in a typed JSON schema
- **Responsive grid** — 12-column layout with `xs` → `xl` breakpoints
- **Built-in field types** — text, email, password, number, textarea, select, radio, checkbox, switch, date, time
- **Validation** — field rules, custom validators, and form-level validators
- **Design system integration** — plug in your own UI components via a simple adaptor contract
- **Global adaptor provider** — set a UI kit once at the app level
- **Conditional fields** — show, hide, or disable fields based on form values
- **Dynamic options** — static or computed select/radio options
- **Custom items** — render arbitrary React content inside the form grid
- **TypeScript-first** — full generic types for form values and config

## Installation

```bash
npm install formakit
# or
bun add formakit
# or
pnpm add formakit
```

**Peer dependencies:** React 18 or 19.

### Optional: Ant Design adaptor

```bash
npm install formakit-ant-adaptor antd
```

See [Using Ant Design](#using-ant-design) below.

## Quick start

```tsx
import FormBuilder, { type FormConfig } from "formakit";

type LoginValues = {
  email: string;
  password: string;
  remember: boolean;
};

const config: FormConfig<LoginValues> = {
  id: "login-form",
  initialValues: {
    email: "",
    password: "",
    remember: false,
  },
  rows: [
    {
      id: "login-row",
      columns: [
        {
          id: "main",
          span: 12,
          items: [
            {
              kind: "field",
              field: {
                name: "email",
                type: "email",
                label: "Email",
                placeholder: "you@example.com",
                validation: {
                  rules: [
                    { type: "required", message: "Email is required" },
                    { type: "email", message: "Enter a valid email" },
                  ],
                },
              },
            },
            {
              kind: "field",
              field: {
                name: "password",
                type: "password",
                label: "Password",
                validation: {
                  rules: [
                    { type: "required", message: "Password is required" },
                    { type: "minLength", value: 6, message: "At least 6 characters" },
                  ],
                },
              },
            },
            {
              kind: "field",
              field: {
                name: "remember",
                type: "checkbox",
                label: "Remember me",
              },
            },
          ],
        },
      ],
    },
  ],
  submit: {
    validateBeforeSubmit: true,
    onSubmit: ({ values }) => {
      console.log("Submitted:", values);
    },
  },
};

export function LoginForm() {
  return <FormBuilder config={config} />;
}
```

## Layout

FormaKit uses a three-level layout model:

```
Row  →  Column  →  Item (field or custom)
```

Each level sits on a **12-column CSS grid**. Use `span` to control width and `offset` to control horizontal position.

### Row and column spans

Columns are placed inside a row. A column with `span: 6` takes half the row; `span: 12` takes the full row.

```tsx
{
  id: "contact-row",
  columns: [
    { id: "name", span: 6, items: [/* ... */] },
    { id: "email", span: 6, items: [/* ... */] },
  ],
}
```

### Responsive spans

Pass a breakpoint object instead of a number. Supported breakpoints: `xs`, `sm`, `md`, `lg`, `xl`.

```tsx
{
  id: "name-column",
  span: { xs: 12, md: 6, lg: 4 },
  items: [/* ... */],
}
```

Values are clamped to the range **1–12**. A value like `24` is treated as `12`.

### Item spans inside a column

Fields inside a column also use the 12-column grid. To place two fields side by side, give each a `span` of `6` and set an **`offset` on the second field**:

```tsx
{
  id: "profile-column",
  span: 12,
  items: [
    {
      kind: "field",
      span: { xs: 12, md: 6 },
      field: { name: "firstName", type: "text", label: "First name" },
    },
    {
      kind: "field",
      span: { xs: 12, md: 6 },
      offset: { xs: 0, md: 6 }, // starts at column 7
      field: { name: "lastName", type: "text", label: "Last name" },
    },
  ],
}
```

> **Important:** FormaKit does not auto-flow items. Without an `offset`, every item defaults to `start: 1` and stacks vertically — even when each item has `span: 6`.

| Breakpoint | First field | Second field | Result |
|---|---|---|---|
| `xs: 12` | full width | full width | stacked (mobile) |
| `md: 6` + `offset: 6` | columns 1–6 | columns 7–12 | side by side |

Use **column `span`** to size groups in a row. Use **item `span` + `offset`** to size and position individual fields inside a column.

## Field types

| Type | Description |
|---|---|
| `text` | Single-line text input |
| `email` | Email input with email validation rule |
| `password` | Password input |
| `number` | Numeric input |
| `textarea` | Multi-line text |
| `select` | Dropdown (requires `options`) |
| `radio` | Radio group (requires `options`) |
| `checkbox` | Checkbox (boolean value) |
| `switch` | Toggle switch (boolean value) |
| `date` | Date input (`YYYY-MM-DD` string) |
| `time` | Time input (`HH:mm:ss` string) |
| `custom` | Custom renderer via `componentKey` + `components` registry |

### Field config

```tsx
{
  name: "country",
  type: "select",
  label: "Country",
  placeholder: "Select a country",
  description: "Where is your company registered?",
  disabled: false,
  readOnly: false,
  defaultValue: "us",
  props: { autoFocus: true },          // forwarded to the underlying input
  ui: {
    className: "my-field",
    labelClassName: "my-label",
    errorClassName: "my-error",
    requiredMarker: " *",
  },
  options: [
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
  ],
  validation: {
    rules: [{ type: "required", message: "Required" }],
    validate: ({ value }) => (value === "us" ? null : "US only for now"),
  },
}
```

### Dynamic options

Options can be a static array or a function that receives current form values:

```tsx
{
  name: "city",
  type: "select",
  options: ({ values }) =>
    values.country === "us"
      ? [{ label: "New York", value: "nyc" }]
      : [{ label: "Toronto", value: "tor" }],
}
```

### Conditional visibility and disabled state

```tsx
{
  name: "companyName",
  type: "text",
  label: "Company",
  hidden: ({ values }) => !values.isBusiness,
  disabled: ({ values }) => values.isLocked,
}
```

Rows and columns also support `hidden` with the same signature.

## Validation

### Built-in rules

| Rule | Config |
|---|---|
| `required` | `{ type: "required", message?: string }` |
| `minLength` | `{ type: "minLength", value: number, message?: string }` |
| `maxLength` | `{ type: "maxLength", value: number, message?: string }` |
| `min` | `{ type: "min", value: number, message?: string }` |
| `max` | `{ type: "max", value: number, message?: string }` |
| `pattern` | `{ type: "pattern", value: RegExp, message?: string }` |
| `email` | `{ type: "email", message?: string }` |

### Custom field validator

```tsx
validation: {
  validate: ({ value, values, field }) => {
    if (value !== values.password) return "Passwords must match";
    return null;
  },
}
```

### Form-level validators

```tsx
const config: FormConfig<SignupValues> = {
  validators: ({ values }) => {
    if (values.password !== values.confirmPassword) {
      return { confirmPassword: "Passwords do not match" };
    }
    return {};
  },
  rows: [/* ... */],
};
```

### Validation mode

Control when validation runs:

```tsx
mode: {
  defaultTrigger: ["blur", "submit"],       // when to validate (default: "submit")
  revalidateAfterSubmit: "change",          // re-validate invalid fields after first submit (default: "change")
  touchStrategy: "blur",                    // when fields become "touched" (default: "blur")
  validateOnMount: false,                   // validate immediately on mount (default: false)
}
```

After the first submit, invalid fields are re-validated on change by default — errors disappear as soon as the user fixes the value.

Per-field overrides are available via `field.validationMode`.

## Submit handling

```tsx
submit: {
  validateBeforeSubmit: true,
  onSubmit: async ({ values, isValid, errors, helpers }) => {
    if (!isValid) return;
    await saveToApi(values);
    helpers.reset();
  },
  onSubmitSuccess: ({ values, helpers }) => {
    console.log("Success", values);
  },
  onSubmitFailed: ({ values, errors, submissionError, helpers }) => {
    console.error("Failed", errors, submissionError);
  },
}
```

`helpers` provides:

- `setValue(name, value)` — update a field value
- `setError(name, error)` — set a field error manually
- `reset(nextValues?)` — reset the form

## Custom items

Render arbitrary React content inside the grid — buttons, rich text, dividers, etc.:

```tsx
{
  kind: "custom",
  id: "submit-button",
  span: 12,
  render: (api) => (
    <button type="submit" disabled={api.isSubmitting}>
      {api.isSubmitting ? "Saving..." : "Save"}
    </button>
  ),
}
```

The `api` object is the same as `useFormBuilderContext()` — see [Form context API](#form-context-api).

## Design system integration

FormaKit ships with plain HTML inputs. To use your own UI kit, pass components through `config.designSystem.components`. FormaKit maps form state into a simple props contract:

```tsx
import type { DesignComponentProps } from "formakit";

function MyTextInput(props: DesignComponentProps) {
  return (
    <input
      name={props.name}
      value={String(props.value ?? "")}
      placeholder={props.placeholder}
      disabled={props.disabled}
      onBlur={props.onBlur}
      onChange={(e) => props.onChange(e.target.value)}
      {...props.props}
    />
  );
}

const config: FormConfig<MyValues> = {
  designSystem: {
    components: {
      text: MyTextInput,
      email: MyTextInput,
      password: MyTextInput,
    },
  },
  rows: [/* ... */],
};
```

### `DesignComponentProps`

| Prop | Type | Description |
|---|---|---|
| `name` | `string` | Field name |
| `value` | `unknown` | Current value |
| `label` | `string?` | Label text (rendered by `FieldShell` unless you handle it) |
| `placeholder` | `string?` | Placeholder text |
| `disabled` | `boolean?` | Disabled state |
| `readOnly` | `boolean?` | Read-only state |
| `required` | `boolean?` | Whether the field has a required rule |
| `error` | `boolean?` | Whether the field has an error |
| `errorMessage` | `string \| null?` | Error message text |
| `description` | `string?` | Help text |
| `options` | `SelectOption[]?` | Options for select/radio fields |
| `onChange` | `(value) => void` | Value change handler |
| `onBlur` | `() => void` | Blur handler |
| `props` | `Record<string, unknown>?` | Extra props from `field.props` |

### Advanced: full field renderer

For full control, register a `FieldComponent` via `config.components`. This receives `FieldComponentProps` (includes `field`, `error`, `options`, etc.) and overrides both the design system adaptor and built-in renderers.

```tsx
components: {
  mySpecialField: MyCustomFieldRenderer,
}
```

Use `field.componentKey: "mySpecialField"` to target it.

**Override priority:** `config.components` > `designSystem.adapters` > adapted `designSystem.components` > built-in defaults.

## Global adaptor provider

Set a UI adaptor once at the app level instead of repeating it in every form config:

```tsx
import { FormBuilder, FormBuilderGlobalProvider } from "formakit";
import { antDesignAdaptor } from "formakit-ant-adaptor";

function App() {
  return (
    <FormBuilderGlobalProvider adaptor={{ designSystem: antDesignAdaptor }}>
      <FormBuilder config={loginConfig} />
      <FormBuilder config={signupConfig} />
    </FormBuilderGlobalProvider>
  );
}
```

Per-form `config.designSystem` and `config.components` override the global adaptor.

### Using Ant Design

Install the optional adaptor package:

```bash
npm install formakit-ant-adaptor antd
```

```tsx
import { FormBuilder, FormBuilderGlobalProvider } from "formakit";
import { antDesignAdaptor } from "formakit-ant-adaptor";

<FormBuilderGlobalProvider adaptor={{ designSystem: antDesignAdaptor }}>
  <FormBuilder config={config} />
</FormBuilderGlobalProvider>
```

`antDesignAdaptor` maps all built-in field types to Ant Design components. Override individual components with `createAntDesignAdaptor({ components: { text: MyCustomInput } })`.

## Form context API

Inside a `FormBuilder` tree (including custom items), use the render API:

```tsx
import { useFormBuilderContext } from "formakit";

function LivePreview() {
  const api = useFormBuilderContext<MyValues>();

  return <pre>{JSON.stringify(api.values, null, 2)}</pre>;
}
```

### `FormRenderApi`

| Property / method | Type | Description |
|---|---|---|
| `values` | `TValues` | Current form values |
| `errors` | `FormErrors<TValues>` | Field errors |
| `touched` | `Record<string, boolean>` | Touched fields |
| `dirtyFields` | `Record<string, boolean>` | Changed fields |
| `isValid` | `boolean` | Whether the form passes validation |
| `isSubmitting` | `boolean` | Submit in progress |
| `isValidating` | `boolean` | Validation in progress |
| `submitCount` | `number` | Number of submit attempts |
| `setValue` | `(name, value) => void` | Update a field |
| `setError` | `(name, error) => void` | Set a field error |
| `reset` | `(nextValues?) => void` | Reset the form |

## Headless usage

Use `useFormBuilder` when you want full control over rendering:

```tsx
import { useFormBuilder } from "formakit";

function MyCustomForm() {
  const { config, state, api, setValue, setTouched, submit } = useFormBuilder(config);

  // Build your own UI using state.values, state.errors, etc.
}
```

## Callbacks

```tsx
callbacks: {
  onValuesChange: ({ values, changedField }) => { /* ... */ },
  onFieldChange: ({ name, value, values }) => { /* ... */ },
  onFieldBlur: ({ name, values }) => { /* ... */ },
  onValidationChange: ({ isValid, errors }) => { /* ... */ },
}
```

## Context data

Pass arbitrary data to validators, condition resolvers, and dynamic options:

```tsx
const config: FormConfig<MyValues> = {
  context: { locale: "en", maxBudget: 10000 },
  rows: [
    {
      columns: [
        {
          items: [
            {
              kind: "field",
              field: {
                name: "budget",
                type: "number",
                validation: {
                  validate: ({ value, context }) =>
                    Number(value) > (context?.maxBudget as number)
                      ? "Over budget"
                      : null,
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
```

## API reference

### Components

| Export | Description |
|---|---|
| `FormBuilder` | Main form component (default export) |
| `FormBuilderGlobalProvider` | App-level adaptor provider |
| `FormBuilderAdaptorProvider` | Alias for the adaptor provider |

### Hooks

| Export | Description |
|---|---|
| `useFormBuilder` | Headless form state and actions |
| `useFormBuilderContext` | Access render API inside a form |
| `useFormBuilderAdaptor` | Read the current global adaptor |

### Types

| Export | Description |
|---|---|
| `FormConfig<TValues>` | Full form configuration |
| `FormBuilderProps<TValues>` | `FormBuilder` component props |
| `FormBuilderAdaptor<TValues>` | Global adaptor shape |
| `FormRenderApi<TValues>` | Render API / context type |
| `FieldConfig<TValues>` | Single field configuration |
| `DesignComponentProps` | Design system component contract |
| `DesignSystemConfig<TValues>` | Design system registration |
| `ValidationRule` | Built-in validation rule union |
| `FormRow`, `FormColumn`, `FormItem` | Layout types |

## Related packages

| Package | Description |
|---|---|
| [`formakit-ant-adaptor`](https://www.npmjs.com/package/formakit-ant-adaptor) | Ant Design UI adaptor plugin |
| [`formakit-panel`](https://www.npmjs.com/package/formakit-panel) | Visual form editor and admin panel |

## License

MIT

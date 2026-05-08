 # Formakit Config-Driven Form Engine Plan

  ## Summary

  Build @formakit/form-builder as a scalable, config-driven form package
  with a balanced hybrid architecture:

  - a strong built-in renderer for common form usage
  - extensible hooks and override points for custom fields, custom
    validation, and custom layout rendering
  - a semantic rows -> columns -> items layout schema as the primary
    public API
  - a validation engine that supports both built-in rules and custom
    validators, but defaults to a performant UX:
      - validate on submit first
      - after the first submit attempt, revalidate touched/changed
        fields on change
      - allow per-form and per-field override for change, blur, or
        submit

  This replaces the current prototype-oriented react-grid-layout-first
  approach with a maintainable form engine that can still add advanced
  layout adapters later.

  ## Goals

  - Accept one config object that renders a complete form in different
    layouts.
  - Support dynamic per-field validation and developer-defined custom
    validation.
  - Support callbacks for submit success, submit failure, validation
    changes, and field value changes.
  - Keep the package fast for large forms by isolating state updates and
    validation scope.
  - Keep the public API easy enough for consumers to use without forcing
    them into one UI system.

  ## Non-Goals For First Version

  - No drag-and-drop form designer.
  - No visual layout editor in the package itself.
  - No dependency on react-hook-form, formik, zod, or yup in v1 core.
  - No react-grid-layout as the primary runtime renderer.
  - No async schema generation from remote endpoints inside core; async
    option loading is supported at field level only.

  ## Recommended Architecture

  ### 1. Package direction

  Use a balanced hybrid structure:

  - FormBuilder as the main batteries-included component
  - internal hooks for state and validation
  - default field renderers for common input types
  - override registry for custom field renderers
  - optional lower-level hooks exported for advanced consumers later

  This gives fast adoption now and keeps the internals reusable.

  ### 2. Primary layout model

  Make semantic layout config the source of truth:

  - form
      - rows
          - columns
              - items

  Each item is either:

  - a field item
  - a custom render item

  Responsive behavior is handled through column span/visibility/order
  props rather than raw grid coordinates.

  ### 3. Validation model

  Support:

  - built-in rule objects
  - custom field validators
  - optional form-level validators for cross-field logic

  Default validation strategy:

  - run full validation on submit
  - if submit fails, mark relevant fields touched
  - after first submit, validate changed fields on change
  - allow override at form level and per field

  This is the best balance of UX, performance, and scalability for most
  products.

  ## Public API Changes

  ## New top-level component API

  export interface FormBuilderProps<TValues extends Record<string,
unknown> = Record<string, unknown>> {
    config: FormConfig<TValues>;
    className?: string;
    style?: React.CSSProperties;
  }

  ## New config schema

  export interface FormConfig<TValues extends Record<string, unknown> =
Record<string, unknown>> {
    id?: string;
    initialValues?: Partial<TValues>;
    mode?: ValidationModeConfig;
    rows: FormRow<TValues>[];
    submit?: FormSubmitConfig<TValues>;
    callbacks?: FormCallbacks<TValues>;
    components?: Partial<FieldComponentRegistry<TValues>>;
    context?: Record<string, unknown>;
  }

  ## Validation mode config

  export type ValidationTrigger = "change" | "blur" | "submit";

  export interface ValidationModeConfig {
    defaultTrigger?: ValidationTrigger | ValidationTrigger[];
    revalidateAfterSubmit?: "change" | "blur" | "change-or-blur";
    touchStrategy?: "blur" | "change" | "submit";
    validateOnMount?: boolean;
  }

  Default values:

  - defaultTrigger: "submit"
  - revalidateAfterSubmit: "change"
  - touchStrategy: "blur"
  - validateOnMount: false

  ## Layout types

  export interface FormRow<TValues> {
    id: string;
    columns: FormColumn<TValues>[];
    hidden?: boolean | ConditionResolver<TValues>;
  }

  export interface FormColumn<TValues> {
    id: string;
    span?: ResponsiveSpan;
    offset?: ResponsiveSpan;
    hidden?: boolean | ConditionResolver<TValues>;
    items: FormItem<TValues>[];
  }

  export type ResponsiveSpan =
    | number
    | {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
      };

  ## Item types

  export type FormItem<TValues> = FieldItem<TValues> |
CustomItem<TValues>;

  export interface CustomItem<TValues> {
    kind: "custom";
    id: string;
    render: (api: FormRenderApi<TValues>) => React.ReactNode;
  }

  export interface FieldItem<TValues> {
    kind: "field";
    field: FieldConfig<TValues>;
  }

  ## Field config

  export type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "switch"
    | "date"
    | "time"
    | "custom";

  export interface FieldConfig<TValues> {
    name: keyof TValues & string;
    type: FieldType;
    label?: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean | ConditionResolver<TValues>;
    hidden?: boolean | ConditionResolver<TValues>;
    readOnly?: boolean;
    props?: Record<string, unknown>;
    defaultValue?: unknown;
    options?: FieldOptionsSource<TValues>;
    validation?: FieldValidationConfig<TValues>;
    validationMode?: Partial<FieldValidationModeOverride>;
    ui?: FieldUiConfig;
    componentKey?: string;
  }

  ## Validation interfaces

  export interface FieldValidationConfig<TValues> {
    rules?: ValidationRule[];
    validate?: FieldValidator<TValues> | FieldValidator<TValues>[];
  }

  export type ValidationRule =
    | { type: "required"; message?: string }
    | { type: "minLength"; value: number; message?: string }
    | { type: "maxLength"; value: number; message?: string }
    | { type: "min"; value: number; message?: string }
    | { type: "max"; value: number; message?: string }
    | { type: "pattern"; value: RegExp; message?: string }
    | { type: "email"; message?: string };

  export type FieldValidator<TValues> = (args: {
    value: unknown;
    values: TValues;
    field: FieldConfig<TValues>;
    context?: Record<string, unknown>;
  }) => string | null | Promise<string | null>;

  export type FormValidator<TValues> = (args: {
    values: TValues;
    context?: Record<string, unknown>;
  }) => Partial<Record<keyof TValues & string, string | null>> |
Promise<Partial<Record<keyof TValues & string, string | null>>>;

  ## Submit + callbacks

  export interface FormSubmitConfig<TValues> {
    validateBeforeSubmit?: boolean;
    onSubmit: (args: {
      values: TValues;
      isValid: boolean;
      errors: FormErrors<TValues>;
      helpers: FormActionHelpers<TValues>;
    }) => void | Promise<void>;
    onSubmitSuccess?: (args: SubmitSuccessArgs<TValues>) => void;
    onSubmitFailed?: (args: SubmitFailedArgs<TValues>) => void;
  }

  export interface FormCallbacks<TValues> {
    onValuesChange?: (args: { values: TValues; changedField?: keyof
TValues & string }) => void;
    onFieldChange?: (args: { name: keyof TValues & string; value: unknown;
values: TValues }) => void;
    onValidationChange?: (args: { isValid: boolean; errors:
FormErrors<TValues> }) => void;
    onFieldBlur?: (args: { name: keyof TValues & string; values:
TValues }) => void;
  }

  ## Internal File Structure

  Refactor packages/formakit/src into:

  src/
    index.ts
    FormBuilder.tsx
    components/
      FormRenderer.tsx
      FormRow.tsx
      FormColumn.tsx
      FieldShell.tsx
      fields/
        TextField.tsx
        TextareaField.tsx
        NumberField.tsx
        SelectField.tsx
        CheckboxField.tsx
        RadioField.tsx
        SwitchField.tsx
        DateField.tsx
        TimeField.tsx
        index.ts
    hooks/
      useFormBuilder.ts
      useFormState.ts
      useValidationEngine.ts
      useFieldController.ts
    utils/
      createInitialValues.ts
      normalizeConfig.ts
      resolveCondition.ts
      runFieldValidation.ts
      runFormValidation.ts
      eventTriggers.ts
    types/
      config.ts
      fields.ts
      validation.ts
      state.ts
      layout.ts
      callbacks.ts
      index.ts
    context/
      FormBuilderContext.tsx
    constants/
      defaults.ts

  ## Implementation Plan

  ### Phase 1: Replace prototype types with stable config model

  1. Remove the current IStaticLayout, IResponsiveLayout, and mixed
     config.layout shape from the public API.
  2. Introduce new semantic types:
      - FormConfig
      - FormRow
      - FormColumn
      - FieldConfig
      - CustomItem
      - validation and callback types
  3. Keep types generic over TValues for better inference.
  4. Make src/index.ts export only the new stable API.

  ### Phase 2: Build the form state engine

  Create useFormState to manage:

  - values
  - errors
  - touched
  - dirtyFields
  - submitCount
  - isSubmitting
  - isValidating
  - isValid

  Required actions:

  - setValue(name, value, options?)
  - setTouched(name, touched)
  - validateField(name)
  - validateForm()
  - submit()
  - reset(nextValues?)

  Implementation rules:

  - field updates must only update the minimum required slices
  - no per-render full-form recomputation
  - derive isValid from errors state
  - use stable callbacks and memoized context values

  ### Phase 3: Build the validation engine

  Create useValidationEngine, runFieldValidation, and runFormValidation.

  Validation flow:

  1. resolve field visibility and disabled state
  2. skip hidden fields by default
  3. run built-in rules in order
  4. run field custom validators in order
  5. optionally run form-level validators
  6. merge errors with field-level errors winning first, then form-level
     if field-level is empty

  Async validator behavior:

  - track per-field validation request version
  - ignore stale async validation results
  - optionally expose isValidating per field in the future, but global
    first version is enough

  Performance rules:

  - on field change, validate only that field unless the trigger
    requires more
  - on submit, validate all visible enabled fields
  - form-level validators run only on submit by default, or when
    explicitly configured

  ### Phase 4: Build the renderer layer

  Create:

  - FormRenderer
  - FormRow
  - FormColumn
  - FieldShell
  - built-in field components

  Rendering rules:

  - rows and columns are layout containers only
  - FieldShell handles label, description, error, loading, and required
    marker
  - field components receive normalized controller props:
      - name
      - value
      - onChange
      - onBlur
      - disabled
      - readOnly
      - error
      - options
      - ui
      - props

  Default styling strategy:

  - keep styling minimal and unopinionated
  - use simple CSS classes or inline class hooks, not hard-coded app-
    like visual design
  - avoid embedding layout-library-specific rendering assumptions

  ### Phase 5: Add renderer overrides and custom fields

  Support 2 override paths:

  1. componentKey on a field config:
      - resolves from config.components
  2. type: "custom" with explicit renderer:
      - for cases where the consumer fully owns rendering

  Resolution order:

  1. field-level explicit renderer or componentKey
  2. registered custom component in config
  3. built-in field component for type
  4. fallback error renderer in development

  This keeps built-ins convenient while allowing teams to replace any
  part.

  ### Phase 6: Add config-controlled behavior for lifecycle and
  callbacks

  Submit behavior:

  - submit() validates according to submit.validateBeforeSubmit
  - if invalid:
      - increment submitCount
      - populate errors
      - call submit.onSubmitFailed
  - if valid:
      - set isSubmitting
      - call submit.onSubmit
      - if resolved successfully, call submit.onSubmitSuccess
      - if onSubmit throws, map to onSubmitFailed with submission error
        payload

  Callback rules:

  - onValuesChange fires after a value commit
  - onFieldChange fires for the specific field
  - onValidationChange only fires when errors or isValid meaningfully
    change
  - onFieldBlur fires after touched state update

  ### Phase 7: Add dynamic conditions and options

  Support conditional logic with resolver functions:

  type ConditionResolver<TValues> = (args: {
    values: TValues;
    context?: Record<string, unknown>;
  }) => boolean;

  Use this for:

  - hidden
  - disabled

  Support options via:

  - static arrays
  - resolver functions from current values/context
  - async loaders later if needed, but v1 plan should support sync first
    and leave async as an additive enhancement

  Recommended v1 options type:

  type FieldOptionsSource<TValues> =
    | SelectOption[]
    | ((args: { values: TValues; context?: Record<string, unknown> }) =>
SelectOption[]);

  If async options are required later, add a distinct loadOptions API
  instead of overloading options.

  ### Phase 8: Simplify or remove current react-grid-layout dependency

  For the initial scalable package structure:

  - stop using react-grid-layout as the default renderer
  - keep layout rendering based on semantic rows/columns and CSS grid/       
    flex
  - optionally keep react-grid-layout as a future experimental adapter
    for builder-mode or admin layout editors

  This avoids forcing a heavy dependency and keeps runtime rendering
  predictable.

  ## Best Default Validation Behavior

  For your question about “validate on every change or only on submit,”
  the best default for a reusable form package is:

  - validate on submit first
  - then validate changed/touched fields on change after the first
    failed submit

  Why this is best:

  - faster for large forms than validating everything on each keystroke
  - avoids noisy UX before users try to submit
  - gives fast recovery after errors appear
  - scales well for async and cross-field validation

  Expose config so developers can still choose:

  - submit-only۶
  - blur-first
  - immediate change validation

  ## Example Target Usage

  type LoginValues = {
    email: string;
    password: string;
    remember: boolean;
  };

  const config: FormConfig<LoginValues> = {
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: {
      defaultTrigger: "submit",
      revalidateAfterSubmit: "change",
    },
    rows: [
      {
        id: "credentials",
        columns: [
          {
            id: "left",
            span: { xs: 12, md: 6 },
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
            ],
          },
          {
            id: "right",
            span: { xs: 12, md: 6 },
            items: [
              {
                kind: "field",
                field: {
                  name: "password",
                  type: "password",
                  label: "Password",
                  validation: {
                    rules: [{ type: "required" }, { type: "minLength",
value: 8 }],
                    validate: ({ value }) =>
                      typeof value === "string" && value.includes(" ")
                        ? "Password must not contain spaces"
                        : null,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
    submit: {
      onSubmit: async ({ values }) => {
        console.log("submit", values);
      },
      onSubmitSuccess: ({ values }) => {
        console.log("success", values);
      },
      onSubmitFailed: ({ errors }) => {
        console.log("failed", errors);
      },
    },
    callbacks: {
      onValidationChange: ({ isValid, errors }) => {
        console.log(isValid, errors);
      },
    },
  };

  ## Migration From Current Code

  Current package issues to resolve:

  - config.layout and items are inconsistent with each other
  - IFormBuilderLayout is incorrectly typed as responsive layouts rather
    than a form layout contract
  - field definitions store runtime UI error state directly in config
  - StaticLayout and ResponsiveLayout are not form-aware
  - FormBuilder currently renders prototype demo content unrelated to
    config

  Migration steps:

  1. freeze the current prototype API and do not extend it
  2. replace src/types/* with the new normalized model
  3. replace src/index.tsx with a single real FormBuilder.tsx
  4. keep a tiny compatibility note in docs instead of trying to support
     the old shape
  5. remove prototype-only fields like error, loading, and direct
     layout-specific fields arrays from public field config

  ## Testing Plan

  ### Unit tests

  Add tests for:

  - initial values normalization
  - required/min/max/minLength/maxLength/pattern/email rules
  - custom sync field validators
  - custom async field validators with stale result protection
  - form-level validation merge behavior
  - hidden/disabled field validation skipping
  - trigger behavior:
      - submit-only
      - blur
      - change
      - submit then revalidate on change
  - touched/dirty tracking
  - submit success flow
  - submit failed flow
  - callback firing conditions

  ### Component tests

  Add rendering tests for:

  - rows and columns render correctly
  - built-in text/select/checkbox fields update state correctly
  - error messages appear in the right trigger phase
  - custom item render receives current form API
  - custom renderer override is used when componentKey is present


  - simple login form
  - multi-column responsive registration form
  - conditional field visibility based on another field value
  - cross-field validation example such as password confirmation
  - submit failure then correction on change
  - custom renderer for a design-system component

  ## Acceptance Criteria

  Implementation is complete when:

  - a consumer can pass one config object and render a working form
  - fields can validate with built-in rules and custom validators
  - submit success and failure callbacks fire with structured payloads
  - validation timing is configurable globally and per field
  - rows/columns/items layout works without react-grid-layout
  - field renderers are overridable without forking the package
  - package types infer field names and callback payloads cleanly
  - current prototype demo content is removed from the library
    entrypoint

  ## Assumptions And Defaults Chosen

  Because you asked to “make the plan” without answering the remaining
  preference question, this plan locks these defaults:

  - package shape: balanced hybrid
  - layout model: rows/columns/items semantic schema
  - validation system: built-in rules plus custom validators
  - default validation timing: submit first, then changed fields after
    failed submit
  - default renderer strategy: minimal built-ins with override hooks
  - layout runtime: CSS-based layout, not react-grid-layout as core
  - async options loading: not first-class in v1 core API; keep sync
    resolver API first

  ## Suggested Implementation Order

  1. Redesign types and public config API
  2. Build state hook and validation engine
  3. Build default renderer and field components
  4. Wire submit lifecycle and callbacks
  5. Add override registry and custom item rendering
  6. Add tests and example usage in apps/web
  7. Remove prototype layout code and outdated types

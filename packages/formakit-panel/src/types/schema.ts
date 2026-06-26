import type {
    DesignSystemConfig,
    FieldComponentRegistry,
    FormCallbacks,
    FormConfig,
    FormSubmitConfig,
} from "formakit";

export type FieldTypeSchema =
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
    | "time";

export type ResponsiveSpanSchema =
    | number
    | {
          xs?: number;
          sm?: number;
          md?: number;
          lg?: number;
          xl?: number;
      };

export type ValidationRuleSchema =
    | { type: "required"; message?: string }
    | { type: "minLength"; value: number; message?: string }
    | { type: "maxLength"; value: number; message?: string }
    | { type: "min"; value: number; message?: string }
    | { type: "max"; value: number; message?: string }
    | { type: "pattern"; value: string; message?: string }
    | { type: "email"; message?: string };

export interface FieldValidationSchema {
    rules?: ValidationRuleSchema[];
}

export interface SelectOptionSchema {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
}

export interface FieldUiSchema {
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    errorClassName?: string;
}

export interface FieldSchema {
    name: string;
    type: FieldTypeSchema;
    label?: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    hidden?: boolean;
    readOnly?: boolean;
    props?: Record<string, unknown>;
    defaultValue?: unknown;
    options?: SelectOptionSchema[];
    validation?: FieldValidationSchema;
    ui?: FieldUiSchema;
    componentKey?: string;
}

export interface FieldItemSchema {
    kind: "field";
    span?: ResponsiveSpanSchema;
    offset?: ResponsiveSpanSchema;
    field: FieldSchema;
}

export interface FormColumnSchema {
    id: string;
    span?: ResponsiveSpanSchema;
    offset?: ResponsiveSpanSchema;
    hidden?: boolean;
    items: FieldItemSchema[];
}

export interface FormRowSchema {
    id: string;
    hidden?: boolean;
    columns: FormColumnSchema[];
}

export interface ValidationModeSchema {
    defaultTrigger?: ("change" | "blur" | "submit") | ("change" | "blur" | "submit")[];
    revalidateAfterSubmit?: "change" | "blur" | "change-or-blur";
    touchStrategy?: "blur" | "change" | "submit";
    validateOnMount?: boolean;
}

export interface FormConfigSchema {
    id?: string;
    initialValues?: Record<string, unknown>;
    mode?: ValidationModeSchema;
    rows: FormRowSchema[];
}

export interface FormDefinition {
    id: string;
    name: string;
    description?: string;
    schema: FormConfigSchema;
}

export interface FormRuntimeHooks<TValues extends Record<string, unknown> = Record<string, unknown>> {
    submit?: FormSubmitConfig<TValues>;
    callbacks?: FormCallbacks<TValues>;
    designSystem?: DesignSystemConfig<TValues>;
    components?: Partial<FieldComponentRegistry<TValues>>;
}

export type EditorSelection =
    | { type: "form" }
    | { type: "row"; rowId: string }
    | { type: "column"; rowId: string; columnId: string }
    | { type: "field"; rowId: string; columnId: string; fieldName: string };

export type { FormConfig };

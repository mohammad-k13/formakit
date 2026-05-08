import type { FieldConfig } from "./fields";

export type ValidationTrigger = "change" | "blur" | "submit";

export interface ValidationModeConfig {
    defaultTrigger?: ValidationTrigger | ValidationTrigger[];
    revalidateAfterSubmit?: "change" | "blur" | "change-or-blur";
    touchStrategy?: "blur" | "change" | "submit";
    validateOnMount?: boolean;
}

export interface FieldValidationModeOverride {
    trigger: ValidationTrigger | ValidationTrigger[];
    revalidateAfterSubmit: "change" | "blur" | "change-or-blur";
    touchStrategy: "blur" | "change" | "submit";
    validateOnMount: boolean;
}

export type ValidationRule =
    | { type: "required"; message?: string }
    | { type: "minLength"; value: number; message?: string }
    | { type: "maxLength"; value: number; message?: string }
    | { type: "min"; value: number; message?: string }
    | { type: "max"; value: number; message?: string }
    | { type: "pattern"; value: RegExp; message?: string }
    | { type: "email"; message?: string };

export type FieldValidator<TValues extends Record<string, unknown>> = (args: {
    value: unknown;
    values: TValues;
    field: FieldConfig<TValues>;
    context?: Record<string, unknown>;
}) => string | null | Promise<string | null>;

export type FormValidator<TValues extends Record<string, unknown>> = (args: {
    values: TValues;
    context?: Record<string, unknown>;
}) =>
    | Partial<Record<keyof TValues & string, string | null>>
    | Promise<Partial<Record<keyof TValues & string, string | null>>>;

export interface FieldValidationConfig<TValues extends Record<string, unknown>> {
    rules?: ValidationRule[];
    validate?: FieldValidator<TValues> | FieldValidator<TValues>[];
}

export type FormErrors<TValues extends Record<string, unknown>> = Partial<
    Record<keyof TValues & string, string | null>
>;

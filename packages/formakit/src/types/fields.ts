import type React from "react";
import type { FieldValidationConfig, FieldValidationModeOverride } from "./validation";

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

export type ConditionResolver<TValues extends Record<string, unknown>> = (args: {
    values: TValues;
    context?: Record<string, unknown>;
}) => boolean;

export interface SelectOption {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
}

export type FieldOptionsSource<TValues extends Record<string, unknown>> =
    | SelectOption[]
    | ((args: { values: TValues; context?: Record<string, unknown> }) => SelectOption[]);

export interface FieldUiConfig {
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    errorClassName?: string;
    requiredMarker?: React.ReactNode;
}

export interface FieldConfig<TValues extends Record<string, unknown>> {
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

export interface FieldComponentProps<TValues extends Record<string, unknown>> {
    field: FieldConfig<TValues>;
    name: keyof TValues & string;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    disabled?: boolean;
    readOnly?: boolean;
    error?: string | null;
    options?: SelectOption[];
    ui?: FieldUiConfig;
    props?: Record<string, unknown>;
}

export type FieldComponent<TValues extends Record<string, unknown>> = React.ComponentType<
    FieldComponentProps<TValues>
>;

export type FieldComponentRegistry<TValues extends Record<string, unknown>> = Partial<
    Record<FieldType | string, FieldComponent<TValues>>
>;

export interface DesignComponentProps<TValue = unknown> {
    name: string;
    value: TValue;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    error?: boolean;
    errorMessage?: string | null;
    description?: string;
    options?: SelectOption[];
    onChange: (value: TValue) => void;
    onBlur: () => void;
    props?: Record<string, unknown>;
}

export type DesignComponent<TValue = unknown> = React.ComponentType<DesignComponentProps<TValue>>;

export type DesignComponentRegistry = Partial<Record<FieldType | string, DesignComponent>>;

export interface DesignSystemConfig<TValues extends Record<string, unknown> = Record<string, unknown>> {
    components: DesignComponentRegistry;
    adapters?: Partial<Record<FieldType | string, FieldComponent<TValues>>>;
}

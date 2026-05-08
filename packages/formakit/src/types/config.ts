import type React from "react";
import type { FormCallbacks, FormSubmitConfig } from "./callbacks";
import type { FieldComponentRegistry } from "./fields";
import type { FormRow } from "./layout";
import type { FormValidator, ValidationModeConfig } from "./validation";

export interface FormConfig<TValues extends Record<string, unknown> = Record<string, unknown>> {
    id?: string;
    initialValues?: Partial<TValues>;
    mode?: ValidationModeConfig;
    rows: FormRow<TValues>[];
    submit?: FormSubmitConfig<TValues>;
    callbacks?: FormCallbacks<TValues>;
    components?: Partial<FieldComponentRegistry<TValues>>;
    validators?: FormValidator<TValues> | FormValidator<TValues>[];
    context?: Record<string, unknown>;
}

export interface FormBuilderProps<TValues extends Record<string, unknown> = Record<string, unknown>> {
    config: FormConfig<TValues>;
    className?: string;
    style?: React.CSSProperties;
}

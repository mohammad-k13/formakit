import type { FormActionHelpers } from "./callbacks";
import type { FormErrors } from "./validation";

export interface FormState<TValues extends Record<string, unknown>> {
    values: TValues;
    errors: FormErrors<TValues>;
    touched: Partial<Record<keyof TValues & string, boolean>>;
    dirtyFields: Partial<Record<keyof TValues & string, boolean>>;
    submitCount: number;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
}

export interface FormRenderApi<TValues extends Record<string, unknown>> extends FormState<TValues> {
    helpers: FormActionHelpers<TValues>;
    setValue: FormActionHelpers<TValues>["setValue"];
    setError: FormActionHelpers<TValues>["setError"];
    reset: FormActionHelpers<TValues>["reset"];
}

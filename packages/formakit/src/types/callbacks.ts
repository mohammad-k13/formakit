import type { FormErrors } from "./validation";

export interface FormActionHelpers<TValues extends Record<string, unknown>> {
    setValue: (name: keyof TValues & string, value: unknown) => void;
    setError: (name: keyof TValues & string, error: string | null) => void;
    reset: (nextValues?: Partial<TValues>) => void;
}

export interface SubmitSuccessArgs<TValues extends Record<string, unknown>> {
    values: TValues;
    helpers: FormActionHelpers<TValues>;
}

export interface SubmitFailedArgs<TValues extends Record<string, unknown>> {
    values: TValues;
    errors: FormErrors<TValues>;
    helpers: FormActionHelpers<TValues>;
    submissionError?: unknown;
}

export interface FormSubmitConfig<TValues extends Record<string, unknown>> {
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

export interface FormCallbacks<TValues extends Record<string, unknown>> {
    onValuesChange?: (args: { values: TValues; changedField?: keyof TValues & string }) => void;
    onFieldChange?: (args: { name: keyof TValues & string; value: unknown; values: TValues }) => void;
    onValidationChange?: (args: { isValid: boolean; errors: FormErrors<TValues> }) => void;
    onFieldBlur?: (args: { name: keyof TValues & string; values: TValues }) => void;
}

import { useCallback, useMemo, useState } from "react";
import { createInitialValues } from "../utils/createInitialValues";
import { runFormValidation } from "../utils/runFormValidation";
import { setFieldError } from "../utils/runFieldValidation";
import type { FormActionHelpers, FormConfig, FormErrors, FormRenderApi, FormState } from "../types";

export function useFormState<TValues extends Record<string, unknown>>(config: FormConfig<TValues>) {
    const [values, setValues] = useState<TValues>(() => createInitialValues(config));
    const [errors, setErrors] = useState<FormErrors<TValues>>({});
    const [touched, setTouchedState] = useState<FormState<TValues>["touched"]>({});
    const [dirtyFields, setDirtyFields] = useState<FormState<TValues>["dirtyFields"]>({});
    const [submitCount, setSubmitCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    const setError = useCallback((name: keyof TValues & string, error: string | null) => {
        setErrors((current) => setFieldError(current, name, error));
    }, []);

    const setValue = useCallback(
        (name: keyof TValues & string, value: unknown) => {
            setValues((current) => {
                const next = { ...current, [name]: value } as TValues;
                config.callbacks?.onFieldChange?.({ name, value, values: next });
                config.callbacks?.onValuesChange?.({ values: next, changedField: name });
                return next;
            });
            setDirtyFields((current) => ({ ...current, [name]: true }));
        },
        [config.callbacks],
    );

    const setTouched = useCallback(
        (name: keyof TValues & string, touchedValue: boolean) => {
            setTouchedState((current) => ({ ...current, [name]: touchedValue }));
            if (touchedValue) config.callbacks?.onFieldBlur?.({ name, values });
        },
        [config.callbacks, values],
    );

    const validateForm = useCallback(async () => {
        setIsValidating(true);
        try {
            const nextErrors = await runFormValidation({ config, values });
            setErrors(nextErrors);
            config.callbacks?.onValidationChange?.({
                isValid: Object.keys(nextErrors).length === 0,
                errors: nextErrors,
            });
            return nextErrors;
        } finally {
            setIsValidating(false);
        }
    }, [config, values]);

    const reset = useCallback(
        (nextValues?: Partial<TValues>) => {
            const initialValues = { ...createInitialValues(config), ...(nextValues ?? {}) } as TValues;
            setValues(initialValues);
            setErrors({});
            setTouchedState({});
            setDirtyFields({});
            setSubmitCount(0);
            config.callbacks?.onValuesChange?.({ values: initialValues });
        },
        [config],
    );

    const helpers = useMemo<FormActionHelpers<TValues>>(
        () => ({ setValue, setError, reset }),
        [reset, setError, setValue],
    );

    const submit = useCallback(async () => {
        setSubmitCount((count) => count + 1);
        const shouldValidate = config.submit?.validateBeforeSubmit ?? true;
        const nextErrors = shouldValidate ? await validateForm() : errors;
        const isValid = Object.keys(nextErrors).length === 0;

        if (!isValid) {
            config.submit?.onSubmitFailed?.({ values, errors: nextErrors, helpers });
            return;
        }

        if (!config.submit) return;

        setIsSubmitting(true);
        try {
            await config.submit.onSubmit({ values, isValid, errors: nextErrors, helpers });
            config.submit.onSubmitSuccess?.({ values, helpers });
        } catch (submissionError) {
            config.submit.onSubmitFailed?.({ values, errors: nextErrors, helpers, submissionError });
        } finally {
            setIsSubmitting(false);
        }
    }, [config, errors, helpers, validateForm, values]);

    const state = useMemo<FormState<TValues>>(
        () => ({
            values,
            errors,
            touched,
            dirtyFields,
            submitCount,
            isSubmitting,
            isValidating,
            isValid: Object.keys(errors).length === 0,
        }),
        [dirtyFields, errors, isSubmitting, isValidating, submitCount, touched, values],
    );

    const api = useMemo<FormRenderApi<TValues>>(
        () => ({ ...state, helpers, setValue, setError, reset }),
        [helpers, reset, setError, setValue, state],
    );

    return { state, api, helpers, setValue, setTouched, validateForm, submit, reset };
}

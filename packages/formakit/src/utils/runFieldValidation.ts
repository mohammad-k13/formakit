import type { FieldConfig, FormErrors, ValidationRule } from "../types";

function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === "";
}

function validateRule(rule: ValidationRule, value: unknown): string | null {
    switch (rule.type) {
        case "required":
            return isEmpty(value) ? (rule.message ?? "This field is required") : null;
        case "minLength":
            return typeof value === "string" && value.length < rule.value
                ? (rule.message ?? `Must be at least ${rule.value} characters`)
                : null;
        case "maxLength":
            return typeof value === "string" && value.length > rule.value
                ? (rule.message ?? `Must be at most ${rule.value} characters`)
                : null;
        case "min":
            return typeof value === "number" && value < rule.value
                ? (rule.message ?? `Must be at least ${rule.value}`)
                : null;
        case "max":
            return typeof value === "number" && value > rule.value
                ? (rule.message ?? `Must be at most ${rule.value}`)
                : null;
        case "pattern":
            return typeof value === "string" && !rule.value.test(value)
                ? (rule.message ?? "Invalid format")
                : null;
        case "email":
            return typeof value === "string" && value.length > 0 && !/^\S+@\S+\.\S+$/.test(value)
                ? (rule.message ?? "Enter a valid email")
                : null;
    }
}

export async function runFieldValidation<TValues extends Record<string, unknown>>(args: {
    field: FieldConfig<TValues>;
    values: TValues;
    context?: Record<string, unknown>;
}): Promise<string | null> {
    const { field, values, context } = args;
    const value = values[field.name];

    for (const rule of field.validation?.rules ?? []) {
        const error = validateRule(rule, value);
        if (error) return error;
    }

    const validators = field.validation?.validate
        ? Array.isArray(field.validation.validate)
            ? field.validation.validate
            : [field.validation.validate]
        : [];

    for (const validate of validators) {
        const error = await validate({ value, values, field, context });
        if (error) return error;
    }

    return null;
}

export function setFieldError<TValues extends Record<string, unknown>>(
    errors: FormErrors<TValues>,
    name: keyof TValues & string,
    error: string | null,
): FormErrors<TValues> {
    const next = { ...errors };
    if (error) next[name] = error;
    else delete next[name];
    return next;
}

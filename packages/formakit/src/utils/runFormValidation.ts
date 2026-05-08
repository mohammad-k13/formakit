import { collectFields } from "./createInitialValues";
import { resolveCondition } from "./resolveCondition";
import { runFieldValidation } from "./runFieldValidation";
import type { FormConfig, FormErrors } from "../types";

export async function runFormValidation<TValues extends Record<string, unknown>>(args: {
    config: FormConfig<TValues>;
    values: TValues;
}): Promise<FormErrors<TValues>> {
    const { config, values } = args;
    const errors: FormErrors<TValues> = {};

    for (const field of collectFields(config)) {
        const isHidden = resolveCondition(field.hidden, values, config.context);
        const isDisabled = resolveCondition(field.disabled, values, config.context);
        if (isHidden || isDisabled) continue;

        const error = await runFieldValidation({ field, values, context: config.context });
        if (error) errors[field.name] = error;
    }

    const formValidators = config.validators
        ? Array.isArray(config.validators)
            ? config.validators
            : [config.validators]
        : [];

    for (const validate of formValidators) {
        const formErrors = await validate({ values, context: config.context });
        for (const [name, error] of Object.entries(formErrors)) {
            if (!errors[name as keyof TValues & string] && error) {
                errors[name as keyof TValues & string] = error;
            }
        }
    }

    return errors;
}

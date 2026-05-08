import { useCallback } from "react";
import { runFormValidation } from "../utils/runFormValidation";
import type { FormConfig } from "../types";

export function useValidationEngine<TValues extends Record<string, unknown>>(config: FormConfig<TValues>) {
    const validateForm = useCallback(
        (values: TValues) => runFormValidation({ config, values }),
        [config],
    );

    return { validateForm };
}

import { DEFAULT_VALIDATION_MODE } from "../constants/defaults";
import type { FormConfig } from "../types";

export function normalizeConfig<TValues extends Record<string, unknown>>(config: FormConfig<TValues>) {
    return {
        ...config,
        mode: {
            ...DEFAULT_VALIDATION_MODE,
            ...config.mode,
        },
    };
}

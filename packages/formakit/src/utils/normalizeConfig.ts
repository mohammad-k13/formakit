import { DEFAULT_VALIDATION_MODE } from "../constants/defaults";
import { createDesignSystemComponents } from "./createDesignSystemComponents";
import type { FormConfig } from "../types";

export function normalizeConfig<TValues extends Record<string, unknown>>(config: FormConfig<TValues>) {
    const designComponents = createDesignSystemComponents(config.designSystem);

    return {
        ...config,
        components: {
            ...designComponents,
            ...config.components,
        },
        mode: {
            ...DEFAULT_VALIDATION_MODE,
            ...config.mode,
        },
    };
}

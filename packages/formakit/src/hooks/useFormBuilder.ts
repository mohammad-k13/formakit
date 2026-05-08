import { normalizeConfig } from "../utils/normalizeConfig";
import { useFormState } from "./useFormState";
import type { FormConfig } from "../types";

export function useFormBuilder<TValues extends Record<string, unknown>>(config: FormConfig<TValues>) {
    const normalizedConfig = normalizeConfig(config);
    const form = useFormState(normalizedConfig);

    return { config: normalizedConfig, ...form };
}

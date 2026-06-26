import type { FormBuilderAdaptor, FormConfig } from "../types";

export function mergeConfigWithAdaptor<TValues extends Record<string, unknown>>(
    config: FormConfig<TValues>,
    adaptor?: FormBuilderAdaptor<TValues> | null,
): FormConfig<TValues> {
    if (!adaptor) {
        return config;
    }

    const mergedDesignSystem =
        adaptor.designSystem || config.designSystem
            ? {
                  components: {
                      ...(adaptor.designSystem?.components ?? {}),
                      ...(config.designSystem?.components ?? {}),
                  },
                  adapters: {
                      ...(adaptor.designSystem?.adapters ?? {}),
                      ...(config.designSystem?.adapters ?? {}),
                  },
              }
            : undefined;

    return {
        ...config,
        designSystem: mergedDesignSystem,
        components: {
            ...(adaptor.components ?? {}),
            ...(config.components ?? {}),
        },
    };
}

import type { DesignSystemConfig, FieldComponentRegistry } from "./fields";

export interface FormBuilderAdaptor<TValues extends Record<string, unknown> = Record<string, unknown>> {
    designSystem?: DesignSystemConfig<TValues>;
    components?: Partial<FieldComponentRegistry<TValues>>;
}

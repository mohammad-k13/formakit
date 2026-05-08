import type { FieldConfig, FormConfig } from "../types";

function collectFields<TValues extends Record<string, unknown>>(config: FormConfig<TValues>): FieldConfig<TValues>[] {
    return config.rows.flatMap((row) =>
        row.columns.flatMap((column) =>
            column.items.flatMap((item) => (item.kind === "field" ? [item.field] : [])),
        ),
    );
}

export function createInitialValues<TValues extends Record<string, unknown>>(
    config: FormConfig<TValues>,
): TValues {
    const values: Record<string, unknown> = { ...(config.initialValues ?? {}) };

    for (const field of collectFields(config)) {
        if (!(field.name in values) && "defaultValue" in field) {
            values[field.name] = field.defaultValue;
        }
    }

    return values as TValues;
}

export { collectFields };

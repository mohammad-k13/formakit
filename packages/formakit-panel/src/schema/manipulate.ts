import type { FormConfigSchema, FormDefinition } from "../types/schema";

export function updateFormSchema(
    definition: FormDefinition,
    updater: (schema: FormConfigSchema) => FormConfigSchema,
): FormDefinition {
    return {
        ...definition,
        schema: updater(structuredClone(definition.schema)),
    };
}

export function findFieldPath(
    schema: FormConfigSchema,
    fieldName: string,
): { rowId: string; columnId: string; fieldName: string } | null {
    for (const row of schema.rows) {
        for (const column of row.columns) {
            for (const item of column.items) {
                if (item.field.name === fieldName) {
                    return { rowId: row.id, columnId: column.id, fieldName };
                }
            }
        }
    }
    return null;
}

export function listAllFields(schema: FormConfigSchema) {
    const fields: Array<{ rowId: string; columnId: string; fieldName: string; label?: string }> = [];
    for (const row of schema.rows) {
        for (const column of row.columns) {
            for (const item of column.items) {
                fields.push({
                    rowId: row.id,
                    columnId: column.id,
                    fieldName: item.field.name,
                    label: item.field.label,
                });
            }
        }
    }
    return fields;
}

export function collectFieldNames(schema: FormConfigSchema) {
    return listAllFields(schema).map((field) => field.fieldName);
}

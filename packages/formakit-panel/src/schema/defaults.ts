import type { FormConfigSchema, FormDefinition } from "../types/schema";

export function createEmptyFormDefinition(overrides?: Partial<FormDefinition>): FormDefinition {
    const id = overrides?.id ?? `form-${Date.now()}`;
    return {
        id,
        name: overrides?.name ?? "New Form",
        description: overrides?.description,
        schema: overrides?.schema ?? createEmptyFormConfigSchema(id),
    };
}

export function createEmptyFormConfigSchema(id?: string): FormConfigSchema {
    return {
        id,
        initialValues: {},
        mode: {
            defaultTrigger: ["blur", "submit"],
            touchStrategy: "blur",
            revalidateAfterSubmit: "change",
        },
        rows: [
            {
                id: "row-1",
                columns: [
                    {
                        id: "column-1",
                        span: 12,
                        items: [],
                    },
                ],
            },
        ],
    };
}

export function createEmptyFieldItem(name?: string) {
    const fieldName = name ?? `field_${Date.now()}`;
    return {
        kind: "field" as const,
        field: {
            name: fieldName,
            type: "text" as const,
            label: "New Field",
            placeholder: "",
        },
    };
}

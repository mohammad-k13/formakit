import { z } from "zod";

const responsiveSpanSchema = z.union([
    z.number(),
    z.object({
        xs: z.number().optional(),
        sm: z.number().optional(),
        md: z.number().optional(),
        lg: z.number().optional(),
        xl: z.number().optional(),
    }),
]);

const validationRuleSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("required"), message: z.string().optional() }),
    z.object({ type: z.literal("minLength"), value: z.number(), message: z.string().optional() }),
    z.object({ type: z.literal("maxLength"), value: z.number(), message: z.string().optional() }),
    z.object({ type: z.literal("min"), value: z.number(), message: z.string().optional() }),
    z.object({ type: z.literal("max"), value: z.number(), message: z.string().optional() }),
    z.object({ type: z.literal("pattern"), value: z.string(), message: z.string().optional() }),
    z.object({ type: z.literal("email"), message: z.string().optional() }),
]);

const fieldSchema = z.object({
    name: z.string().min(1),
    type: z.enum([
        "text",
        "email",
        "password",
        "number",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "switch",
        "date",
        "time",
    ]),
    label: z.string().optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    disabled: z.boolean().optional(),
    hidden: z.boolean().optional(),
    readOnly: z.boolean().optional(),
    props: z.record(z.unknown()).optional(),
    defaultValue: z.unknown().optional(),
    options: z
        .array(
            z.object({
                label: z.string(),
                value: z.union([z.string(), z.number(), z.boolean()]),
                disabled: z.boolean().optional(),
            }),
        )
        .optional(),
    validation: z
        .object({
            rules: z.array(validationRuleSchema).optional(),
        })
        .optional(),
    ui: z
        .object({
            className: z.string().optional(),
            inputClassName: z.string().optional(),
            labelClassName: z.string().optional(),
            descriptionClassName: z.string().optional(),
            errorClassName: z.string().optional(),
        })
        .optional(),
    componentKey: z.string().optional(),
});

const fieldItemSchema = z.object({
    kind: z.literal("field"),
    span: responsiveSpanSchema.optional(),
    offset: responsiveSpanSchema.optional(),
    field: fieldSchema,
});

export const formConfigSchemaValidator = z.object({
    id: z.string().optional(),
    initialValues: z.record(z.unknown()).optional(),
    mode: z
        .object({
            defaultTrigger: z
                .union([
                    z.enum(["change", "blur", "submit"]),
                    z.array(z.enum(["change", "blur", "submit"])),
                ])
                .optional(),
            revalidateAfterSubmit: z.enum(["change", "blur", "change-or-blur"]).optional(),
            touchStrategy: z.enum(["blur", "change", "submit"]).optional(),
            validateOnMount: z.boolean().optional(),
        })
        .optional(),
    rows: z.array(
        z.object({
            id: z.string().min(1),
            hidden: z.boolean().optional(),
            columns: z.array(
                z.object({
                    id: z.string().min(1),
                    span: responsiveSpanSchema.optional(),
                    offset: responsiveSpanSchema.optional(),
                    hidden: z.boolean().optional(),
                    items: z.array(fieldItemSchema),
                }),
            ),
        }),
    ),
});

export const formDefinitionValidator = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    schema: formConfigSchemaValidator,
});

export function parseFormDefinition(input: unknown) {
    return formDefinitionValidator.parse(input);
}

export function parseFormConfigSchema(input: unknown) {
    return formConfigSchemaValidator.parse(input);
}

import type { FieldItem, FormConfig, ValidationRule } from "formakit";
import type {
    FieldItemSchema,
    FieldSchema,
    FormConfigSchema,
    FormRuntimeHooks,
    ValidationRuleSchema,
} from "../types/schema";

function mapValidationRule(rule: ValidationRuleSchema): ValidationRule {
    if (rule.type === "pattern") {
        return { type: "pattern", value: new RegExp(rule.value), message: rule.message };
    }
    return rule;
}

function mapField(field: FieldSchema) {
    return {
        ...field,
        validation: field.validation
            ? {
                  rules: field.validation.rules?.map(mapValidationRule),
              }
            : undefined,
    };
}

function mapFieldItem(item: FieldItemSchema) {
    return {
        ...item,
        field: mapField(item.field),
    };
}

export function schemaToFormConfig<TValues extends Record<string, unknown> = Record<string, unknown>>(
    schema: FormConfigSchema,
    hooks?: FormRuntimeHooks<TValues>,
): FormConfig<TValues> {
    return {
        id: schema.id,
        initialValues: schema.initialValues as Partial<TValues> | undefined,
        mode: schema.mode,
        rows: schema.rows.map((row) => ({
            ...row,
            hidden: row.hidden,
            columns: row.columns.map((column) => ({
                ...column,
                hidden: column.hidden,
                items: column.items.map(mapFieldItem),
            })),
        })),
        submit: hooks?.submit,
        callbacks: hooks?.callbacks,
        designSystem: hooks?.designSystem,
        components: hooks?.components,
    };
}

function validationRuleToSchema(rule: ValidationRule): ValidationRuleSchema {
    if (rule.type === "pattern") {
        return { type: "pattern", value: rule.value.source, message: rule.message };
    }
    return rule as ValidationRuleSchema;
}

export function formConfigToSchema(config: FormConfig): FormConfigSchema {
    return {
        id: config.id,
        initialValues: config.initialValues as Record<string, unknown> | undefined,
        mode: config.mode,
        rows: config.rows.map((row) => ({
            id: row.id,
            hidden: typeof row.hidden === "boolean" ? row.hidden : undefined,
            columns: row.columns.map((column) => ({
                id: column.id,
                span: column.span,
                offset: column.offset,
                hidden: typeof column.hidden === "boolean" ? column.hidden : undefined,
                items: column.items
                    .filter((item) => item.kind === "field")
                    .map((item) => {
                        const fieldItem = item as FieldItem<Record<string, unknown>>;
                        return {
                            kind: "field" as const,
                            span: fieldItem.span,
                            offset: fieldItem.offset,
                            field: {
                                name: fieldItem.field.name,
                                type: fieldItem.field.type as FieldItemSchema["field"]["type"],
                                label: fieldItem.field.label,
                                description: fieldItem.field.description,
                                placeholder: fieldItem.field.placeholder,
                                disabled:
                                    typeof fieldItem.field.disabled === "boolean"
                                        ? fieldItem.field.disabled
                                        : undefined,
                                hidden:
                                    typeof fieldItem.field.hidden === "boolean"
                                        ? fieldItem.field.hidden
                                        : undefined,
                                readOnly: fieldItem.field.readOnly,
                                props: fieldItem.field.props,
                                defaultValue: fieldItem.field.defaultValue,
                                options: Array.isArray(fieldItem.field.options)
                                    ? fieldItem.field.options
                                    : undefined,
                                validation: fieldItem.field.validation
                                    ? {
                                          rules: fieldItem.field.validation.rules?.map(validationRuleToSchema),
                                      }
                                    : undefined,
                                ui: fieldItem.field.ui
                                    ? {
                                          className: fieldItem.field.ui.className,
                                          inputClassName: fieldItem.field.ui.inputClassName,
                                          labelClassName: fieldItem.field.ui.labelClassName,
                                          descriptionClassName: fieldItem.field.ui.descriptionClassName,
                                          errorClassName: fieldItem.field.ui.errorClassName,
                                      }
                                    : undefined,
                                componentKey: fieldItem.field.componentKey,
                            },
                        };
                    }),
            })),
        })),
    };
}

export function mergeRuntimeHooks<TValues extends Record<string, unknown>>(
    schema: FormConfigSchema,
    hooks?: FormRuntimeHooks<TValues>,
): FormConfig<TValues> {
    return schemaToFormConfig(schema, hooks);
}

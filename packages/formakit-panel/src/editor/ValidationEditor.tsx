import { Trash2 } from "lucide-react";
import type { ValidationRuleSchema } from "../types/schema";
import { Button, FieldGroup, Input, Select } from "../ui";

const RULE_TYPES = [
    { label: "Required", value: "required" },
    { label: "Min length", value: "minLength" },
    { label: "Max length", value: "maxLength" },
    { label: "Min", value: "min" },
    { label: "Max", value: "max" },
    { label: "Pattern", value: "pattern" },
    { label: "Email", value: "email" },
];

export function ValidationEditor(props: {
    rules: ValidationRuleSchema[];
    onChange: (rules: ValidationRuleSchema[]) => void;
}) {
    const addRule = (type: ValidationRuleSchema["type"]) => {
        const base = { type, message: "" } as ValidationRuleSchema;
        if (type === "minLength" || type === "maxLength" || type === "min" || type === "max") {
            props.onChange([...props.rules, { ...base, value: 1 } as ValidationRuleSchema]);
            return;
        }
        if (type === "pattern") {
            props.onChange([...props.rules, { type: "pattern", value: ".*", message: "" }]);
            return;
        }
        props.onChange([...props.rules, base]);
    };

    const updateRule = (index: number, patch: Partial<ValidationRuleSchema>) => {
        props.onChange(
            props.rules.map((rule, ruleIndex) =>
                ruleIndex === index ? ({ ...rule, ...patch } as ValidationRuleSchema) : rule,
            ),
        );
    };

    const removeRule = (index: number) => {
        props.onChange(props.rules.filter((_, ruleIndex) => ruleIndex !== index));
    };

    return (
        <div className="fp-editor-section">
            <div className="fp-editor-section__header">
                <h4>Validation</h4>
                <Select
                    value=""
                    options={[{ label: "Add rule...", value: "" }, ...RULE_TYPES]}
                    onChange={(type) => {
                        if (!type) return;
                        addRule(type as ValidationRuleSchema["type"]);
                    }}
                />
            </div>
            {props.rules.length === 0 ? (
                <p className="fp-muted">No validation rules.</p>
            ) : (
                <div className="fp-editor-stack">
                    {props.rules.map((rule, index) => (
                        <div key={`${rule.type}-${index}`} className="fp-rule-card">
                            <div className="fp-rule-card__header">
                                <strong>{rule.type}</strong>
                                <Button variant="ghost" size="sm" onClick={() => removeRule(index)}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                            {"value" in rule ? (
                                <FieldGroup label="Value">
                                    <Input
                                        value={String(rule.value)}
                                        onChange={(value) => {
                                            const numeric =
                                                rule.type === "pattern"
                                                    ? value
                                                    : Number(value);
                                            updateRule(index, { value: numeric } as Partial<ValidationRuleSchema>);
                                        }}
                                    />
                                </FieldGroup>
                            ) : null}
                            <FieldGroup label="Message">
                                <Input
                                    value={rule.message ?? ""}
                                    onChange={(message) => updateRule(index, { message })}
                                />
                            </FieldGroup>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

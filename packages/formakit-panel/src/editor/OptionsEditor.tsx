import { Plus, Trash2 } from "lucide-react";
import type { SelectOptionSchema } from "../types/schema";
import { Button, FieldGroup, Input } from "../ui";

export function OptionsEditor(props: {
    options: SelectOptionSchema[];
    onChange: (options: SelectOptionSchema[]) => void;
}) {
    const addOption = () => {
        props.onChange([
            ...props.options,
            { label: "Option", value: `option_${props.options.length + 1}` },
        ]);
    };

    const updateOption = (index: number, patch: Partial<SelectOptionSchema>) => {
        props.onChange(
            props.options.map((option, optionIndex) =>
                optionIndex === index ? { ...option, ...patch } : option,
            ),
        );
    };

    const removeOption = (index: number) => {
        props.onChange(props.options.filter((_, optionIndex) => optionIndex !== index));
    };

    return (
        <div className="fp-editor-section">
            <div className="fp-editor-section__header">
                <h4>Options</h4>
                <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus size={14} /> Add
                </Button>
            </div>
            <div className="fp-editor-stack">
                {props.options.map((option, index) => (
                    <div key={`${option.value}-${index}`} className="fp-rule-card">
                        <div className="fp-rule-card__header">
                            <strong>Option {index + 1}</strong>
                            <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                                <Trash2 size={14} />
                            </Button>
                        </div>
                        <FieldGroup label="Label">
                            <Input
                                value={option.label}
                                onChange={(label) => updateOption(index, { label })}
                            />
                        </FieldGroup>
                        <FieldGroup label="Value">
                            <Input
                                value={String(option.value)}
                                onChange={(value) => updateOption(index, { value })}
                            />
                        </FieldGroup>
                    </div>
                ))}
            </div>
        </div>
    );
}

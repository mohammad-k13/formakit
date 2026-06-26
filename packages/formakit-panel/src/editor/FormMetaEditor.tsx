import type { FormDefinition } from "../types/schema";
import { FieldGroup, Input, Select } from "../ui";

export function FormMetaEditor(props: {
    draft: FormDefinition;
    onChange: (draft: FormDefinition) => void;
}) {
    const { draft, onChange } = props;
    const schema = draft.schema;

    return (
        <div className="fp-editor-stack">
            <FieldGroup label="Form name">
                <Input
                    value={draft.name}
                    onChange={(name) => onChange({ ...draft, name })}
                />
            </FieldGroup>
            <FieldGroup label="Form ID">
                <Input
                    value={draft.id}
                    onChange={(id) =>
                        onChange({
                            ...draft,
                            id,
                            schema: { ...schema, id },
                        })
                    }
                />
            </FieldGroup>
            <FieldGroup label="Description">
                <Input
                    value={draft.description ?? ""}
                    onChange={(description) => onChange({ ...draft, description })}
                />
            </FieldGroup>
            <FieldGroup label="Revalidate after submit">
                <Select
                    value={schema.mode?.revalidateAfterSubmit ?? "change"}
                    options={[
                        { label: "On change", value: "change" },
                        { label: "On blur", value: "blur" },
                        { label: "Change or blur", value: "change-or-blur" },
                    ]}
                    onChange={(revalidateAfterSubmit) =>
                        onChange({
                            ...draft,
                            schema: {
                                ...schema,
                                mode: {
                                    ...schema.mode,
                                    revalidateAfterSubmit: revalidateAfterSubmit as "change" | "blur" | "change-or-blur",
                                },
                            },
                        })
                    }
                />
            </FieldGroup>
            <FieldGroup label="Touch strategy">
                <Select
                    value={schema.mode?.touchStrategy ?? "blur"}
                    options={[
                        { label: "Blur", value: "blur" },
                        { label: "Change", value: "change" },
                        { label: "Submit", value: "submit" },
                    ]}
                    onChange={(touchStrategy) =>
                        onChange({
                            ...draft,
                            schema: {
                                ...schema,
                                mode: {
                                    ...schema.mode,
                                    touchStrategy: touchStrategy as "blur" | "change" | "submit",
                                },
                            },
                        })
                    }
                />
            </FieldGroup>
        </div>
    );
}

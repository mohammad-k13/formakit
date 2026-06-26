import type { FormConfigSchema } from "../types/schema";
import { collectFieldNames } from "../schema/manipulate";
import { FieldGroup, Input } from "../ui";

export function InitialValuesEditor(props: {
    schema: FormConfigSchema;
    onChange: (initialValues: Record<string, unknown>) => void;
}) {
    const fieldNames = collectFieldNames(props.schema);
    const initialValues = props.schema.initialValues ?? {};

    return (
        <div className="fp-editor-stack">
            {fieldNames.length === 0 ? (
                <p className="fp-muted">Add fields to edit initial values.</p>
            ) : (
                fieldNames.map((name) => (
                    <FieldGroup key={name} label={name}>
                        <Input
                            value={initialValues[name] != null ? String(initialValues[name]) : ""}
                            onChange={(value) =>
                                props.onChange({
                                    ...initialValues,
                                    [name]: value,
                                })
                            }
                        />
                    </FieldGroup>
                ))
            )}
        </div>
    );
}

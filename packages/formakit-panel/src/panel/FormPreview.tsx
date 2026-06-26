import { useMemo } from "react";
import { FormBuilder } from "formakit";
import type { FormDefinition, FormRuntimeHooks } from "../types/schema";
import { schemaToFormConfig } from "../schema/convert";

export function FormPreview(props: {
    draft: FormDefinition | null;
    runtimeHooks?: FormRuntimeHooks;
}) {
    const config = useMemo(() => {
        if (!props.draft) return null;
        return schemaToFormConfig(props.draft.schema, props.runtimeHooks);
    }, [props.draft, props.runtimeHooks]);

    if (!props.draft || !config) {
        return (
            <div className="fp-preview fp-preview--empty">
                <p>Select a form to preview.</p>
            </div>
        );
    }

    return (
        <div className="fp-preview">
            <div className="fp-preview__header">
                <h3>{props.draft.name}</h3>
                <span className="fp-muted">Live preview</span>
            </div>
            <div className="fp-preview__canvas fp-preview__canvas--light">
                <FormBuilder
                    className="fp-form-preview"
                    config={{
                        ...config,
                        submit: {
                            validateBeforeSubmit: true,
                            onSubmit: () => undefined,
                        },
                    }}
                />
            </div>
        </div>
    );
}

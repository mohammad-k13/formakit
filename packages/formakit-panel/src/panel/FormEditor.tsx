"use client";

import { useState } from "react";
import type { EditorSelection, FormDefinition } from "../types/schema";
import type { FieldSettingsSection } from "../editor/FieldContextMenu";
import { FormMetaEditor } from "../editor/FormMetaEditor";
import { FieldEditor } from "../editor/FieldEditor";
import { LayoutTree, ColumnEditor } from "../editor/LayoutTree";
import { InitialValuesEditor } from "../editor/InitialValuesEditor";
import { Tabs } from "../ui";

export function FormEditor(props: {
    draft: FormDefinition | null;
    selection: EditorSelection;
    onSelect: (selection: EditorSelection) => void;
    onChange: (draft: FormDefinition) => void;
}) {
    const [tab, setTab] = useState("layout");
    const [showFieldSettings, setShowFieldSettings] = useState(false);
    const [fieldSettingsSection, setFieldSettingsSection] = useState<FieldSettingsSection | null>(null);

    if (!props.draft) {
        return (
            <aside className="fp-editor fp-editor--empty">
                <p>Select a form to edit.</p>
            </aside>
        );
    }

    const openFieldSettings = (section?: FieldSettingsSection) => {
        setShowFieldSettings(true);
        setFieldSettingsSection(section ?? "general");
        setTab("layout");
    };

    return (
        <aside className="fp-editor fp-editor--wide">
            <div className="fp-editor__header">
                <h3>Edit</h3>
                <Tabs
                    activeId={tab}
                    tabs={[
                        { id: "layout", label: "Field tree" },
                        { id: "properties", label: "Form" },
                        { id: "initial", label: "Initial values" },
                    ]}
                    onChange={setTab}
                />
            </div>

            {tab === "layout" ? (
                <div className="fp-editor__layout-pane">
                    <LayoutTree
                        draft={props.draft}
                        selection={props.selection}
                        onSelect={props.onSelect}
                        onChange={props.onChange}
                        onOpenFieldSettings={openFieldSettings}
                    />
                    {props.selection.type === "field" && showFieldSettings ? (
                        <div className="fp-field-settings-panel">
                            <div className="fp-field-settings-panel__header">
                                <h4>Field settings</h4>
                                <button type="button" className="fp-tab" onClick={() => setShowFieldSettings(false)}>
                                    Close
                                </button>
                            </div>
                            <FieldEditor
                                draft={props.draft}
                                selection={props.selection}
                                onChange={props.onChange}
                                focusSection={fieldSettingsSection}
                            />
                        </div>
                    ) : null}
                    {props.selection.type === "column" ? (
                        <div className="fp-field-settings-panel">
                            <h4>Column settings</h4>
                            <ColumnEditor
                                draft={props.draft}
                                selection={props.selection}
                                onChange={props.onChange}
                            />
                        </div>
                    ) : null}
                </div>
            ) : null}

            {tab === "initial" ? (
                <InitialValuesEditor
                    schema={props.draft.schema}
                    onChange={(initialValues) =>
                        props.onChange({
                            ...props.draft!,
                            schema: { ...props.draft!.schema, initialValues },
                        })
                    }
                />
            ) : null}

            {tab === "properties" ? (
                <div className="fp-editor__content">
                    <FormMetaEditor draft={props.draft} onChange={props.onChange} />
                </div>
            ) : null}
        </aside>
    );
}

"use client";

"use client";

import type { EditorSelection, FieldSchema, FormDefinition, ResponsiveSpanSchema } from "../types/schema";
import type { FieldSettingsSection } from "./FieldContextMenu";
import { createEmptyFieldItem } from "../schema/defaults";
import { useEffect, useRef } from "react";
import { Checkbox, FieldGroup, Input, Select } from "../ui";
import { ValidationEditor } from "./ValidationEditor";
import { OptionsEditor } from "./OptionsEditor";
import { ResponsiveSpanEditor } from "./ResponsiveSpanEditor";

const FIELD_TYPES: Array<{ label: string; value: FieldSchema["type"] }> = [
    { label: "Text", value: "text" },
    { label: "Email", value: "email" },
    { label: "Password", value: "password" },
    { label: "Number", value: "number" },
    { label: "Textarea", value: "textarea" },
    { label: "Select", value: "select" },
    { label: "Radio", value: "radio" },
    { label: "Checkbox", value: "checkbox" },
    { label: "Switch", value: "switch" },
    { label: "Date", value: "date" },
    { label: "Time", value: "time" },
];

function updateFieldInDraft(
    draft: FormDefinition,
    selection: Extract<EditorSelection, { type: "field" }>,
    updater: (args: {
        field: FieldSchema;
        itemSpan?: ResponsiveSpanSchema;
        itemOffset?: ResponsiveSpanSchema;
    }) => {
        field: FieldSchema;
        itemSpan?: ResponsiveSpanSchema;
        itemOffset?: ResponsiveSpanSchema;
    },
) {
    const row = draft.schema.rows.find((item) => item.id === selection.rowId);
    const column = row?.columns.find((item) => item.id === selection.columnId);
    const itemIndex = column?.items.findIndex((item) => item.field.name === selection.fieldName) ?? -1;
    if (!row || !column || itemIndex < 0) return draft;

    const current = column.items[itemIndex]!;
    const updated = updater({
        field: current.field,
        itemSpan: current.span,
        itemOffset: current.offset,
    });

    const nextItems = column.items.map((item, index) =>
        index === itemIndex
            ? {
                  ...item,
                  span: updated.itemSpan,
                  offset: updated.itemOffset,
                  field: updated.field,
              }
            : item,
    );

    return {
        ...draft,
        schema: {
            ...draft.schema,
            rows: draft.schema.rows.map((currentRow) =>
                currentRow.id !== row.id
                    ? currentRow
                    : {
                          ...currentRow,
                          columns: currentRow.columns.map((currentColumn) =>
                              currentColumn.id !== column.id
                                  ? currentColumn
                                  : { ...currentColumn, items: nextItems },
                          ),
                      },
            ),
        },
    };
}

export function FieldEditor(props: {
    draft: FormDefinition;
    selection: Extract<EditorSelection, { type: "field" }>;
    onChange: (draft: FormDefinition) => void;
    focusSection?: FieldSettingsSection | null;
}) {
    const { draft, selection, onChange } = props;
    const row = draft.schema.rows.find((item) => item.id === selection.rowId);
    const column = row?.columns.find((item) => item.id === selection.columnId);
    const item = column?.items.find((entry) => entry.field.name === selection.fieldName);

    if (!row || !column || !item) {
        return <div className="fp-empty">Field not found.</div>;
    }

    const field = item.field;
    const generalRef = useRef<HTMLDivElement>(null);
    const spacingRef = useRef<HTMLDivElement>(null);
    const validationRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!props.focusSection) return;
        const target =
            props.focusSection === "general"
                ? generalRef.current
                : props.focusSection === "spacing"
                  ? spacingRef.current
                  : props.focusSection === "validation"
                    ? validationRef.current
                    : optionsRef.current;
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [props.focusSection, selection.fieldName]);

    const patch = (partial: Partial<FieldSchema>) => {
        onChange(
            updateFieldInDraft(draft, selection, ({ field: current, itemSpan, itemOffset }) => ({
                field: { ...current, ...partial },
                itemSpan,
                itemOffset,
            })),
        );
    };

    return (
        <div className="fp-editor-stack fp-field-settings">
            <div ref={generalRef} className="fp-editor-section">
                <h4>General</h4>
                <FieldGroup label="Field name">
                    <Input value={field.name} onChange={(name) => patch({ name })} />
                </FieldGroup>
                <FieldGroup label="Type">
                    <Select
                        value={field.type}
                        options={FIELD_TYPES.map((type) => ({ label: type.label, value: type.value }))}
                        onChange={(type) => patch({ type: type as FieldSchema["type"] })}
                    />
                </FieldGroup>
                <FieldGroup label="Label">
                    <Input value={field.label ?? ""} onChange={(label) => patch({ label })} />
                </FieldGroup>
                <FieldGroup label="Placeholder">
                    <Input value={field.placeholder ?? ""} onChange={(placeholder) => patch({ placeholder })} />
                </FieldGroup>
                <FieldGroup label="Description">
                    <Input value={field.description ?? ""} onChange={(description) => patch({ description })} />
                </FieldGroup>
                <Checkbox label="Disabled" checked={field.disabled} onChange={(disabled) => patch({ disabled })} />
                <Checkbox label="Read only" checked={field.readOnly} onChange={(readOnly) => patch({ readOnly })} />
                <Checkbox label="Hidden" checked={field.hidden} onChange={(hidden) => patch({ hidden })} />
            </div>

            <div ref={spacingRef} className="fp-editor-section">
                <h4>Spacing</h4>
                <ResponsiveSpanEditor
                    label="Field width per screen"
                    value={item.span}
                    onChange={(span) =>
                        onChange(
                            updateFieldInDraft(draft, selection, ({ field: current, itemOffset }) => ({
                                field: current,
                                itemSpan: span,
                                itemOffset,
                            })),
                        )
                    }
                />
                <ResponsiveSpanEditor
                    label="Field offset per screen"
                    value={item.offset}
                    onChange={(offset) =>
                        onChange(
                            updateFieldInDraft(draft, selection, ({ field: current, itemSpan }) => ({
                                field: current,
                                itemSpan,
                                itemOffset: offset,
                            })),
                        )
                    }
                />
            </div>

            {(field.type === "select" || field.type === "radio") && (
                <div ref={optionsRef} className="fp-editor-section">
                    <OptionsEditor options={field.options ?? []} onChange={(options) => patch({ options })} />
                </div>
            )}

            <div ref={validationRef} className="fp-editor-section">
                <ValidationEditor
                    rules={field.validation?.rules ?? []}
                    onChange={(rules) => patch({ validation: { rules } })}
                />
            </div>
        </div>
    );
}

export function addFieldToColumn(draft: FormDefinition, rowId: string, columnId: string) {
    const item = createEmptyFieldItem();
    const nextRows = draft.schema.rows.map((row) =>
        row.id !== rowId
            ? row
            : {
                  ...row,
                  columns: row.columns.map((column) =>
                      column.id !== columnId ? column : { ...column, items: [...column.items, item] },
                  ),
              },
    );
    return {
        ...draft,
        schema: { ...draft.schema, rows: nextRows },
    };
}

export function removeFieldFromColumn(
    draft: FormDefinition,
    rowId: string,
    columnId: string,
    fieldName: string,
) {
    const nextRows = draft.schema.rows.map((row) =>
        row.id !== rowId
            ? row
            : {
                  ...row,
                  columns: row.columns.map((column) =>
                      column.id !== columnId
                          ? column
                          : {
                                ...column,
                                items: column.items.filter((item) => item.field.name !== fieldName),
                            },
                  ),
              },
    );
    return {
        ...draft,
        schema: { ...draft.schema, rows: nextRows },
    };
}

"use client";

import { Plus, Trash2 } from "lucide-react";
import type { EditorSelection, FormDefinition, ResponsiveSpanSchema } from "../types/schema";
import { addFieldToColumn, FieldEditor, removeFieldFromColumn } from "./FieldEditor";
import { FieldContextMenu, type FieldSettingsSection } from "./FieldContextMenu";
import { ResponsiveSpanEditor, formatResponsiveSpan } from "./ResponsiveSpanEditor";
import { Button, FieldGroup, Input } from "../ui";

export function LayoutTree(props: {
    draft: FormDefinition;
    selection: EditorSelection;
    onSelect: (selection: EditorSelection) => void;
    onChange: (draft: FormDefinition) => void;
    onOpenFieldSettings: (section?: FieldSettingsSection) => void;
}) {
    const { draft, selection, onSelect, onChange, onOpenFieldSettings } = props;

    const addRow = () => {
        const id = `row-${Date.now()}`;
        onChange({
            ...draft,
            schema: {
                ...draft.schema,
                rows: [
                    ...draft.schema.rows,
                    {
                        id,
                        columns: [{ id: `column-${Date.now()}`, span: 12, items: [] }],
                    },
                ],
            },
        });
        onSelect({ type: "row", rowId: id });
    };

    const addColumn = (rowId: string) => {
        const columnId = `column-${Date.now()}`;
        onChange({
            ...draft,
            schema: {
                ...draft.schema,
                rows: draft.schema.rows.map((row) =>
                    row.id !== rowId
                        ? row
                        : {
                              ...row,
                              columns: [...row.columns, { id: columnId, span: 6, items: [] }],
                          },
                ),
            },
        });
        onSelect({ type: "column", rowId, columnId });
    };

    const removeRow = (rowId: string) => {
        onChange({
            ...draft,
            schema: {
                ...draft.schema,
                rows: draft.schema.rows.filter((row) => row.id !== rowId),
            },
        });
        onSelect({ type: "form" });
    };

    const removeColumn = (rowId: string, columnId: string) => {
        onChange({
            ...draft,
            schema: {
                ...draft.schema,
                rows: draft.schema.rows.map((row) =>
                    row.id !== rowId
                        ? row
                        : { ...row, columns: row.columns.filter((column) => column.id !== columnId) },
                ),
            },
        });
        onSelect({ type: "row", rowId });
    };

    const isSelected = (candidate: EditorSelection) => JSON.stringify(candidate) === JSON.stringify(selection);

    return (
        <div className="fp-layout-tree fp-layout-tree--large">
            <div className="fp-layout-tree__header">
                <h4>Field tree</h4>
                <Button variant="outline" size="sm" onClick={addRow}>
                    <Plus size={14} /> Row
                </Button>
            </div>
            <div className="fp-layout-tree__scroll">
                {draft.schema.rows.map((row) => (
                    <div key={row.id} className="fp-tree-node">
                        <div className="fp-tree-node__row">
                            <button
                                type="button"
                                className={`fp-tree-node__label ${isSelected({ type: "row", rowId: row.id }) ? "fp-tree-node__label--active" : ""}`}
                                onClick={() => onSelect({ type: "row", rowId: row.id })}
                            >
                                Row: {row.id}
                            </button>
                            <div className="fp-tree-node__actions">
                                <Button variant="ghost" size="sm" onClick={() => addColumn(row.id)}>
                                    <Plus size={14} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => removeRow(row.id)}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                        {row.columns.map((column) => (
                            <div key={column.id} className="fp-tree-node fp-tree-node--nested">
                                <div className="fp-tree-node__row">
                                    <button
                                        type="button"
                                        className={`fp-tree-node__label ${isSelected({ type: "column", rowId: row.id, columnId: column.id }) ? "fp-tree-node__label--active" : ""}`}
                                        onClick={() =>
                                            onSelect({ type: "column", rowId: row.id, columnId: column.id })
                                        }
                                    >
                                        Column: {column.id}
                                        <span className="fp-tree-node__meta">
                                            span {formatResponsiveSpan(column.span)}
                                        </span>
                                    </button>
                                    <div className="fp-tree-node__actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const next = addFieldToColumn(draft, row.id, column.id);
                                                onChange(next);
                                                const newField = next.schema.rows
                                                    .find((item) => item.id === row.id)
                                                    ?.columns.find((item) => item.id === column.id)
                                                    ?.items.at(-1);
                                                if (newField) {
                                                    onSelect({
                                                        type: "field",
                                                        rowId: row.id,
                                                        columnId: column.id,
                                                        fieldName: newField.field.name,
                                                    });
                                                    onOpenFieldSettings();
                                                }
                                            }}
                                        >
                                            <Plus size={14} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeColumn(row.id, column.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                                {column.items.map((item) => {
                                    const fieldSelection = {
                                        type: "field" as const,
                                        rowId: row.id,
                                        columnId: column.id,
                                        fieldName: item.field.name,
                                    };
                                    return (
                                        <div key={item.field.name} className="fp-tree-node fp-tree-node--nested">
                                            <div className="fp-tree-node__row">
                                                <button
                                                    type="button"
                                                    className={`fp-tree-node__label ${isSelected(fieldSelection) ? "fp-tree-node__label--active" : ""}`}
                                                    onClick={() => {
                                                        onSelect(fieldSelection);
                                                        onOpenFieldSettings("general");
                                                    }}
                                                    onContextMenu={(event) => {
                                                        event.preventDefault();
                                                        onSelect(fieldSelection);
                                                        onOpenFieldSettings("general");
                                                    }}
                                                >
                                                    {item.field.label || item.field.name}
                                                    <span className="fp-tree-node__meta">
                                                        {item.field.type} · {formatResponsiveSpan(item.span)}
                                                    </span>
                                                </button>
                                                <div className="fp-tree-node__actions">
                                                    <FieldContextMenu
                                                        selection={fieldSelection}
                                                        onSelect={onSelect}
                                                        onOpenSettings={onOpenFieldSettings}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onChange(
                                                                removeFieldFromColumn(
                                                                    draft,
                                                                    row.id,
                                                                    column.id,
                                                                    item.field.name,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ColumnEditor(props: {
    draft: FormDefinition;
    selection: Extract<EditorSelection, { type: "column" }>;
    onChange: (draft: FormDefinition) => void;
}) {
    const row = props.draft.schema.rows.find((item) => item.id === props.selection.rowId);
    const column = row?.columns.find((item) => item.id === props.selection.columnId);
    if (!column) return <div className="fp-empty">Column not found.</div>;

    const updateColumn = (patch: { span?: ResponsiveSpanSchema; offset?: ResponsiveSpanSchema }) => {
        props.onChange({
            ...props.draft,
            schema: {
                ...props.draft.schema,
                rows: props.draft.schema.rows.map((currentRow) =>
                    currentRow.id !== props.selection.rowId
                        ? currentRow
                        : {
                              ...currentRow,
                              columns: currentRow.columns.map((currentColumn) =>
                                  currentColumn.id !== props.selection.columnId
                                      ? currentColumn
                                      : { ...currentColumn, ...patch },
                              ),
                          },
                ),
            },
        });
    };

    return (
        <div className="fp-editor-stack">
            <FieldGroup label="Column ID">
                <Input value={column.id} disabled />
            </FieldGroup>
            <ResponsiveSpanEditor label="Column width per screen" value={column.span} onChange={(span) => updateColumn({ span })} />
            <ResponsiveSpanEditor label="Column offset per screen" value={column.offset} onChange={(offset) => updateColumn({ offset })} />
        </div>
    );
}

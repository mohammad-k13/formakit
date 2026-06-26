"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Download, Moon, RotateCcw, Save, Sun, Upload } from "lucide-react";
import type { FormDefinition, FormRuntimeHooks } from "../types/schema";
import type { ApiStorageOptions, RegistryStorageOptions, StorageOptions } from "../types/storage";
import { createStorage } from "../storage/createStorage";
import { parseFormDefinition } from "../schema/validate";
import { FormSidebar } from "./FormSidebar";
import { FormPreview } from "./FormPreview";
import { FormEditor } from "./FormEditor";
import { usePanelState } from "./usePanelState";
import { Button } from "../ui";

export interface FormakitPanelProps {
    forms?: FormDefinition[];
    storage?: ApiStorageOptions;
    runtimeHooks?: FormRuntimeHooks;
    onSave?: (definition: FormDefinition) => void | Promise<void>;
    onCreate?: (definition: FormDefinition) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
    className?: string;
    defaultDarkMode?: boolean;
}

export function FormakitPanel(props: FormakitPanelProps) {
    const [darkMode, setDarkMode] = useState(props.defaultDarkMode ?? false);

    const storage = useMemo(() => {
        if (props.storage) {
            return createStorage(props.storage);
        }
        const registryOptions: RegistryStorageOptions = {
            type: "registry",
            forms: props.forms ?? [],
            onSave: props.onSave,
            onCreate: props.onCreate,
            onDelete: props.onDelete,
        };
        return createStorage(registryOptions);
    }, [props.forms, props.onCreate, props.onDelete, props.onSave, props.storage]);

    const panel = usePanelState({
        storage,
        runtimeHooks: props.runtimeHooks,
    });

    const importRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        if (!panel.draft) return;
        const blob = new Blob([JSON.stringify(panel.draft, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${panel.draft.id}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (file: File) => {
        const text = await file.text();
        const parsed = parseFormDefinition(JSON.parse(text));
        panel.importForm(parsed);
    };

    return (
        <div
            className={`fp-panel ${darkMode ? "fp-panel--dark" : ""} ${props.className ?? ""}`.trim()}
        >
            <header className="fp-panel__toolbar">
                <div>
                    <h1>FormaKit Panel</h1>
                    {panel.isDirty ? <span className="fp-badge">Unsaved changes</span> : null}
                </div>
                <div className="fp-panel__actions">
                    <Button variant="outline" size="sm" onClick={() => setDarkMode((current) => !current)}>
                        {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                        {darkMode ? "Light" : "Dark"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
                        <Upload size={14} /> Import
                    </Button>
                    <input
                        ref={importRef}
                        type="file"
                        accept="application/json"
                        hidden
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void handleImport(file);
                            event.currentTarget.value = "";
                        }}
                    />
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={!panel.draft}>
                        <Download size={14} /> Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={panel.duplicateForm} disabled={!panel.draft}>
                        <Copy size={14} /> Duplicate
                    </Button>
                    <Button variant="outline" size="sm" onClick={panel.revertDraft} disabled={!panel.isDirty}>
                        <RotateCcw size={14} /> Revert
                    </Button>
                    <Button size="sm" onClick={() => void panel.saveDraft()} disabled={!panel.isDirty || panel.saving}>
                        <Save size={14} /> {panel.saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </header>

            {panel.error ? <div className="fp-alert fp-alert--error">{panel.error}</div> : null}
            {panel.loading ? <div className="fp-alert">Loading forms...</div> : null}

            <div className="fp-panel__body">
                <FormSidebar
                    forms={panel.forms}
                    selectedId={panel.selectedId}
                    search={panel.search}
                    isDirty={panel.isDirty}
                    onSearchChange={panel.setSearch}
                    onSelect={panel.setSelectedId}
                    onCreate={panel.createForm}
                />
                <FormPreview draft={panel.draft} runtimeHooks={panel.runtimeHooks} />
                <FormEditor
                    draft={panel.draft}
                    selection={panel.selection}
                    onSelect={panel.setSelection}
                    onChange={(draft) => panel.updateDraft(() => draft)}
                />
            </div>
        </div>
    );
}

export type { StorageOptions, ApiStorageOptions, RegistryStorageOptions };

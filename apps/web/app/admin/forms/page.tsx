"use client";

import { useCallback, useState } from "react";
import { FormakitPanel, type FormDefinition } from "formakit-panel";
import "formakit-panel/styles.css";
import { formRegistry as initialForms } from "../../../forms/registry";

export default function FormsAdminPage() {
    const [forms, setForms] = useState<FormDefinition[]>(initialForms);

    const handleSave = useCallback((updated: FormDefinition) => {
        setForms((current) => current.map((form) => (form.id === updated.id ? updated : form)));
    }, []);

    const handleCreate = useCallback((created: FormDefinition) => {
        setForms((current) => [...current, created]);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setForms((current) => current.filter((form) => form.id !== id));
    }, []);

    return (
        <FormakitPanel
            forms={forms}
            onSave={handleSave}
            onCreate={handleCreate}
            onDelete={handleDelete}
        />
    );
}

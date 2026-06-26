import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EditorSelection, FormDefinition, FormRuntimeHooks } from "../types/schema";
import type { FormStorageAdapter } from "../types/storage";
import { createEmptyFormDefinition } from "../schema/defaults";

export function usePanelState(args: {
    storage: FormStorageAdapter;
    runtimeHooks?: FormRuntimeHooks;
}) {
    const { storage } = args;
    const [forms, setForms] = useState<FormDefinition[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draft, setDraft] = useState<FormDefinition | null>(null);
    const [selection, setSelection] = useState<EditorSelection>({ type: "form" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const baselinesRef = useRef<Record<string, FormDefinition>>({});
    const draftsCacheRef = useRef<Record<string, FormDefinition>>({});
    const unsavedIdsRef = useRef<Set<string>>(new Set());
    const formsRef = useRef(forms);
    formsRef.current = forms;

    const loadForms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const nextForms = await storage.list();
            setForms(nextForms);
            for (const form of nextForms) {
                baselinesRef.current[form.id] = structuredClone(form);
            }
            if (!selectedId && nextForms.length > 0) {
                setSelectedId(nextForms[0]!.id);
            }
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Failed to load forms");
        } finally {
            setLoading(false);
        }
    }, [selectedId, storage]);

    useEffect(() => {
        void loadForms();
    }, [loadForms]);

    useEffect(() => {
        if (!selectedId) {
            setDraft(null);
            return;
        }

        setError(null);
        setSelection({ type: "form" });

        const cachedDraft = draftsCacheRef.current[selectedId];
        if (cachedDraft) {
            setDraft(structuredClone(cachedDraft));
            return;
        }

        const sidebarForm = formsRef.current.find((form) => form.id === selectedId);
        if (sidebarForm) {
            const nextDraft = structuredClone(sidebarForm);
            draftsCacheRef.current[selectedId] = nextDraft;
            setDraft(nextDraft);
            return;
        }

        void storage
            .get(selectedId)
            .then((form) => {
                const nextDraft = structuredClone(form);
                baselinesRef.current[form.id] = structuredClone(form);
                draftsCacheRef.current[form.id] = nextDraft;
                setDraft(nextDraft);
            })
            .catch((cause) => {
                setError(cause instanceof Error ? cause.message : "Failed to load form");
            });
    }, [selectedId, storage]);

    const filteredForms = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return forms;
        return forms.filter(
            (form) =>
                form.name.toLowerCase().includes(query) ||
                form.description?.toLowerCase().includes(query) ||
                form.id.toLowerCase().includes(query),
        );
    }, [forms, search]);

    const isDirty = useMemo(() => {
        if (!draft || !selectedId) return false;
        if (unsavedIdsRef.current.has(selectedId)) return true;
        const baseline = baselinesRef.current[selectedId];
        if (!baseline) return true;
        return JSON.stringify(baseline) !== JSON.stringify(draft);
    }, [draft, selectedId]);

    const updateDraft = useCallback((updater: (current: FormDefinition) => FormDefinition) => {
        setDraft((current) => {
            if (!current) return current;
            const next = updater(structuredClone(current));
            draftsCacheRef.current[next.id] = next;
            setForms((all) =>
                all.map((form) =>
                    form.id === next.id ? { ...form, name: next.name, description: next.description } : form,
                ),
            );
            return next;
        });
    }, []);

    const saveDraft = useCallback(async () => {
        if (!draft) return;
        setSaving(true);
        setError(null);
        try {
            const isNew = unsavedIdsRef.current.has(draft.id);
            if (isNew) {
                await storage.create(draft);
                unsavedIdsRef.current.delete(draft.id);
            } else {
                await storage.save(draft);
            }
            baselinesRef.current[draft.id] = structuredClone(draft);
            draftsCacheRef.current[draft.id] = structuredClone(draft);
            await loadForms();
            setSelectedId(draft.id);
        } catch (cause) {
            try {
                await storage.save(draft);
                baselinesRef.current[draft.id] = structuredClone(draft);
                unsavedIdsRef.current.delete(draft.id);
                await loadForms();
            } catch (inner) {
                setError(inner instanceof Error ? inner.message : "Failed to save form");
            }
        } finally {
            setSaving(false);
        }
    }, [draft, loadForms, storage]);

    const revertDraft = useCallback(() => {
        if (!selectedId) return;
        setError(null);
        const baseline = baselinesRef.current[selectedId];
        if (baseline) {
            const next = structuredClone(baseline);
            draftsCacheRef.current[selectedId] = next;
            setDraft(next);
            setSelection({ type: "form" });
            return;
        }
        const sidebarForm = forms.find((form) => form.id === selectedId);
        if (sidebarForm) {
            const next = structuredClone(sidebarForm);
            draftsCacheRef.current[selectedId] = next;
            setDraft(next);
            setSelection({ type: "form" });
        }
    }, [forms, selectedId]);

    const createForm = useCallback(() => {
        const form = createEmptyFormDefinition();
        unsavedIdsRef.current.add(form.id);
        draftsCacheRef.current[form.id] = structuredClone(form);
        setForms((current) => [...current, form]);
        setSelectedId(form.id);
        setDraft(structuredClone(form));
        setSelection({ type: "form" });
        setError(null);
    }, []);

    const duplicateForm = useCallback(() => {
        if (!draft) return;
        const copy = structuredClone(draft);
        copy.id = `${draft.id}-copy-${Date.now()}`;
        copy.name = `${draft.name} (copy)`;
        copy.schema.id = copy.id;
        unsavedIdsRef.current.add(copy.id);
        draftsCacheRef.current[copy.id] = structuredClone(copy);
        setForms((current) => [...current, copy]);
        setSelectedId(copy.id);
        setDraft(structuredClone(copy));
        setSelection({ type: "form" });
    }, [draft]);

    const deleteForm = useCallback(async () => {
        if (!draft || !storage.delete) return;
        setSaving(true);
        try {
            if (!unsavedIdsRef.current.has(draft.id)) {
                await storage.delete(draft.id);
            }
            unsavedIdsRef.current.delete(draft.id);
            delete draftsCacheRef.current[draft.id];
            delete baselinesRef.current[draft.id];
            const remaining = forms.filter((form) => form.id !== draft.id);
            setForms(remaining);
            setSelectedId(remaining[0]?.id ?? null);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Failed to delete form");
        } finally {
            setSaving(false);
        }
    }, [draft, forms, storage]);

    const importForm = useCallback((definition: FormDefinition) => {
        unsavedIdsRef.current.add(definition.id);
        draftsCacheRef.current[definition.id] = structuredClone(definition);
        setForms((current) => {
            const index = current.findIndex((form) => form.id === definition.id);
            if (index === -1) return [...current, definition];
            const next = [...current];
            next[index] = definition;
            return next;
        });
        setSelectedId(definition.id);
        setDraft(structuredClone(definition));
        setSelection({ type: "form" });
    }, []);

    return {
        forms: filteredForms,
        allForms: forms,
        selectedId,
        setSelectedId,
        draft,
        selection,
        setSelection,
        loading,
        saving,
        error,
        search,
        setSearch,
        isDirty,
        runtimeHooks: args.runtimeHooks,
        updateDraft,
        saveDraft,
        revertDraft,
        createForm,
        duplicateForm,
        deleteForm,
        importForm,
        reload: loadForms,
    };
}

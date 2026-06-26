import { FileText, Plus, Search } from "lucide-react";
import type { FormDefinition } from "../types/schema";
import { Button, Input } from "../ui";

export function FormSidebar(props: {
    forms: FormDefinition[];
    selectedId: string | null;
    search: string;
    isDirty: boolean;
    onSearchChange: (value: string) => void;
    onSelect: (id: string) => void;
    onCreate: () => void;
}) {
    return (
        <aside className="fp-sidebar">
            <div className="fp-sidebar__header">
                <h2>Forms</h2>
                <Button variant="outline" size="sm" onClick={props.onCreate}>
                    <Plus size={14} />
                </Button>
            </div>
            <div className="fp-sidebar__search">
                <Search size={14} />
                <Input
                    value={props.search}
                    placeholder="Search forms..."
                    onChange={props.onSearchChange}
                />
            </div>
            <div className="fp-sidebar__list">
                {props.forms.length === 0 ? (
                    <p className="fp-muted">No forms found.</p>
                ) : (
                    props.forms.map((form) => (
                        <button
                            key={form.id}
                            type="button"
                            className={`fp-sidebar__item ${props.selectedId === form.id ? "fp-sidebar__item--active" : ""}`}
                            onClick={() => props.onSelect(form.id)}
                        >
                            <FileText size={16} />
                            <div>
                                <strong>{form.name}</strong>
                                {form.description ? <span>{form.description}</span> : null}
                                <code>{form.id}</code>
                            </div>
                            {props.isDirty && props.selectedId === form.id ? (
                                <span className="fp-badge">Unsaved</span>
                            ) : null}
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import type { EditorSelection } from "../types/schema";

export type FieldSettingsSection = "general" | "spacing" | "validation" | "options";

export function FieldContextMenu(props: {
    selection: Extract<EditorSelection, { type: "field" }>;
    onSelect: (selection: EditorSelection) => void;
    onOpenSettings: (section?: FieldSettingsSection) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handlePointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);

    const openSection = (section: FieldSettingsSection) => {
        props.onSelect(props.selection);
        props.onOpenSettings(section);
        setOpen(false);
    };

    return (
        <div
            className="fp-context-menu"
            ref={rootRef}
            onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                props.onSelect(props.selection);
                setOpen(true);
            }}
        >
            <button
                type="button"
                className="fp-btn fp-btn--ghost fp-btn--sm"
                aria-label="Field actions"
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen((current) => !current);
                }}
            >
                <MoreHorizontal size={14} />
            </button>
            {open ? (
                <div className="fp-context-menu__dropdown">
                    <button type="button" onClick={() => openSection("general")}>
                        Field settings
                    </button>
                    <button type="button" onClick={() => openSection("spacing")}>
                        Spacing per screen
                    </button>
                    <button type="button" onClick={() => openSection("validation")}>
                        Validation rules
                    </button>
                    <button type="button" onClick={() => openSection("options")}>
                        Options & values
                    </button>
                </div>
            ) : null}
        </div>
    );
}

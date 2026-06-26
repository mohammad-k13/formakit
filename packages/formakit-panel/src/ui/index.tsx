import type { ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

export function Button(props: {
    children: ReactNode;
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "sm" | "md";
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit";
    onClick?: () => void;
}) {
    const { children, variant = "default", size = "md", className, disabled, type = "button", onClick } = props;
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn("fp-btn", `fp-btn--${variant}`, `fp-btn--${size}`, className)}
        >
            {children}
        </button>
    );
}

export function Input(props: {
    value?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    type?: string;
    onChange?: (value: string) => void;
}) {
    const { value, placeholder, className, disabled, type = "text", onChange } = props;
    return (
        <input
            type={type}
            value={value ?? ""}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("fp-input", className)}
            onChange={(event) => onChange?.(event.target.value)}
        />
    );
}

export function Textarea(props: {
    value?: string;
    placeholder?: string;
    className?: string;
    rows?: number;
    onChange?: (value: string) => void;
}) {
    const { value, placeholder, className, rows = 3, onChange } = props;
    return (
        <textarea
            value={value ?? ""}
            placeholder={placeholder}
            rows={rows}
            className={cn("fp-textarea", className)}
            onChange={(event) => onChange?.(event.target.value)}
        />
    );
}

export function Label(props: { children: ReactNode; className?: string; htmlFor?: string }) {
    return (
        <label htmlFor={props.htmlFor} className={cn("fp-label", props.className)}>
            {props.children}
        </label>
    );
}

export function Select(props: {
    value?: string;
    className?: string;
    options: Array<{ label: string; value: string }>;
    onChange?: (value: string) => void;
}) {
    const { value, className, options, onChange } = props;
    return (
        <select
            value={value ?? ""}
            className={cn("fp-select", className)}
            onChange={(event) => onChange?.(event.target.value)}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

export function Checkbox(props: {
    checked?: boolean;
    label?: string;
    onChange?: (checked: boolean) => void;
}) {
    return (
        <label className="fp-checkbox">
            <input
                type="checkbox"
                checked={Boolean(props.checked)}
                onChange={(event) => props.onChange?.(event.target.checked)}
            />
            {props.label ? <span>{props.label}</span> : null}
        </label>
    );
}

export function Tabs(props: {
    tabs: Array<{ id: string; label: string }>;
    activeId: string;
    onChange: (id: string) => void;
}) {
    return (
        <div className="fp-tabs">
            {props.tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    className={cn("fp-tab", props.activeId === tab.id && "fp-tab--active")}
                    onClick={() => props.onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export function Card(props: { title?: string; children: ReactNode; className?: string }) {
    return (
        <div className={cn("fp-card", props.className)}>
            {props.title ? <div className="fp-card__title">{props.title}</div> : null}
            <div className="fp-card__body">{props.children}</div>
        </div>
    );
}

export function FieldGroup(props: { label: string; children: ReactNode }) {
    return (
        <div className="fp-field-group">
            <Label>{props.label}</Label>
            {props.children}
        </div>
    );
}

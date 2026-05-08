import React from "react";
import type { FieldConfig } from "../types";

export function FieldShell<TValues extends Record<string, unknown>>(props: {
    field: FieldConfig<TValues>;
    error?: string | null;
    children: React.ReactNode;
}) {
    const { field, error, children } = props;
    const required = field.validation?.rules?.some((rule) => rule.type === "required");

    return (
        <div className={field.ui?.className ?? "formakit-field"}>
            {field.label ? (
                <label id={`${field.name}-label`} className={field.ui?.labelClassName} htmlFor={field.name}>
                    {field.label}
                    {required ? field.ui?.requiredMarker ?? " *" : null}
                </label>
            ) : null}
            {children}
            {field.description ? (
                <div className={field.ui?.descriptionClassName ?? "formakit-field-description"}>
                    {field.description}
                </div>
            ) : null}
            {error ? <div className={field.ui?.errorClassName ?? "formakit-field-error"}>{error}</div> : null}
        </div>
    );
}

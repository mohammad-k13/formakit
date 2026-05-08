import React from "react";
import type { FieldComponentProps } from "../../types";

export function TextField<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    const { field, value, onChange, onBlur, disabled, readOnly } = props;
    return (
        <input
            type={field.type === "custom" ? "text" : field.type}
            name={props.name}
            value={typeof value === "string" || typeof value === "number" ? value : ""}
            placeholder={field.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            {...(props.props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
    );
}

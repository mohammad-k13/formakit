import React from "react";
import type { FieldComponentProps } from "../../types";

export function TextareaField<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    const { field, value, onChange, onBlur, disabled, readOnly } = props;
    return (
        <textarea
            name={props.name}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            {...(props.props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
    );
}

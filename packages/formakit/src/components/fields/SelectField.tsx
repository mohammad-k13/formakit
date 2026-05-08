import React from "react";
import type { FieldComponentProps } from "../../types";

export function SelectField<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    const { field, value, onChange, onBlur, disabled, readOnly, options = [] } = props;
    return (
        <select
            name={props.name}
            value={typeof value === "string" || typeof value === "number" ? value : ""}
            disabled={disabled}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            aria-readonly={readOnly}
            {...(props.props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
            {field.placeholder ? <option value="">{field.placeholder}</option> : null}
            {options.map((option) => (
                <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

import React from "react";
import type { FieldComponentProps } from "../../types";

export function NumberField<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    const { field, value, onChange, onBlur, disabled, readOnly } = props;
    return (
        <input
            type="number"
            name={props.name}
            value={typeof value === "number" || typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value === "" ? undefined : event.target.valueAsNumber)}
            {...(props.props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
    );
}

import React from "react";
import type { FieldComponentProps } from "../../types";

export function CheckboxField<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    const { value, onChange, onBlur, disabled, readOnly } = props;
    return (
        <input
            type="checkbox"
            name={props.name}
            checked={Boolean(value)}
            disabled={disabled || readOnly}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.checked)}
            {...(props.props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
    );
}

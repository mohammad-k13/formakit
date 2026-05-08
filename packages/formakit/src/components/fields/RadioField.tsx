import React from "react";
import type { FieldComponentProps } from "../../types";

export function RadioField<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    const { value, onChange, onBlur, disabled, readOnly, options = [] } = props;
    return (
        <div role="radiogroup" aria-labelledby={`${props.name}-label`}>
            {options.map((option) => (
                <label key={String(option.value)}>
                    <input
                        type="radio"
                        name={props.name}
                        value={String(option.value)}
                        checked={value === option.value}
                        disabled={disabled || readOnly || option.disabled}
                        onBlur={onBlur}
                        onChange={() => onChange(option.value)}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
}

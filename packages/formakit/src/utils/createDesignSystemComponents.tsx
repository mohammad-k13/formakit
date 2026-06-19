import React from "react";
import type {
    DesignComponent,
    DesignSystemConfig,
    FieldComponent,
    FieldComponentProps,
    FieldComponentRegistry,
    FieldType,
} from "../types";

const checkboxLikeFieldTypes = new Set<FieldType | string>(["checkbox", "switch"]);

function isRequired<TValues extends Record<string, unknown>>(props: FieldComponentProps<TValues>) {
    return Boolean(props.field.validation?.rules?.some((rule) => rule.type === "required"));
}

function toStringValue(value: unknown) {
    return typeof value === "string" || typeof value === "number" ? value : "";
}

function toBooleanValue(value: unknown) {
    return Boolean(value);
}

function toNumberValue(value: unknown) {
    return typeof value === "number" || typeof value === "string" ? value : "";
}

function resolveValue(type: string, value: unknown) {
    if (checkboxLikeFieldTypes.has(type)) return toBooleanValue(value);
    if (type === "number") return toNumberValue(value);
    return toStringValue(value);
}

function createDesignFieldComponent<TValues extends Record<string, unknown>>(
    type: string,
    Component: DesignComponent,
): FieldComponent<TValues> {
    return function DesignFieldComponent(props: FieldComponentProps<TValues>) {
        const value = resolveValue(type, props.value);

        return (
            <Component
                name={props.name}
                value={value}
                label={props.field.label}
                placeholder={props.field.placeholder}
                disabled={props.disabled}
                readOnly={props.readOnly}
                required={isRequired(props)}
                error={Boolean(props.error)}
                errorMessage={props.error}
                description={props.field.description}
                options={props.options}
                onChange={props.onChange}
                onBlur={props.onBlur}
                props={props.props}
            />
        );
    };
}

export function createDesignSystemComponents<TValues extends Record<string, unknown>>(
    designSystem?: DesignSystemConfig<TValues>,
) {
    if (!designSystem) return undefined;

    const components: FieldComponentRegistry<TValues> = {};

    for (const [type, Component] of Object.entries(designSystem.components)) {
        if (!Component) continue;
        components[type] = createDesignFieldComponent(type, Component);
    }

    return {
        ...components,
        ...designSystem.adapters,
    };
}

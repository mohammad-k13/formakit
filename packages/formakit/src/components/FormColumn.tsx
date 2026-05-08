import React from "react";
import { FieldShell } from "./FieldShell";
import { defaultFieldComponents } from "./fields/defaultFieldComponents";
import { useFieldController } from "../hooks/useFieldController";
import { resolveCondition } from "../utils/resolveCondition";
import type { FieldComponent, FieldConfig, FormColumn as FormColumnConfig, FormConfig, FormRenderApi, FormState } from "../types";

function spanToStyle(span: FormColumnConfig<Record<string, unknown>>["span"]): React.CSSProperties {
    if (typeof span === "number") {
        return { gridColumn: `span ${span}` };
    }

    if (span?.md) {
        return { gridColumn: `span ${span.md}` };
    }

    return { gridColumn: "span 12" };
}

export function FormColumn<TValues extends Record<string, unknown>>(props: {
    column: FormColumnConfig<TValues>;
    config: FormConfig<TValues>;
    state: FormState<TValues>;
    api: FormRenderApi<TValues>;
    setValue: (name: keyof TValues & string, value: unknown) => void;
    setTouched: (name: keyof TValues & string, touched: boolean) => void;
}) {
    const { column, config, state, api, setValue, setTouched } = props;

    if (resolveCondition(column.hidden, state.values, config.context)) return null;

    return (
        <div className="formakit-column" style={spanToStyle(column.span)}>
            {column.items.map((item) => {
                if (item.kind === "custom") {
                    return <React.Fragment key={item.id}>{item.render(api)}</React.Fragment>;
                }

                return (
                    <FieldItemRenderer
                        key={item.field.name}
                        field={item.field}
                        config={config}
                        state={state}
                        setValue={setValue}
                        setTouched={setTouched}
                    />
                );
            })}
        </div>
    );
}

function FieldItemRenderer<TValues extends Record<string, unknown>>(props: {
    field: FieldConfig<TValues>;
    config: FormConfig<TValues>;
    state: FormState<TValues>;
    setValue: (name: keyof TValues & string, value: unknown) => void;
    setTouched: (name: keyof TValues & string, touched: boolean) => void;
}) {
    const { field, config, state, setValue, setTouched } = props;
    const controller = useFieldController({ field, config, state, setValue, setTouched });

    if (controller.hidden) return null;

    const key = field.componentKey ?? field.type;
    const Component = (config.components?.[key] ?? defaultFieldComponents[field.type]) as FieldComponent<TValues> | undefined;

    if (!Component) {
        return <div>Unknown field renderer: {key}</div>;
    }

    return (
        <FieldShell field={field} error={controller.error}>
            <Component field={field} {...controller} />
        </FieldShell>
    );
}

import React from "react";
import { FieldShell } from "./FieldShell";
import { defaultFieldComponents } from "./fields/defaultFieldComponents";
import { useFieldController } from "../hooks/useFieldController";
import { resolveCondition } from "../utils/resolveCondition";
import { createResponsiveGridStyle } from "../utils/responsiveGrid";
import type { FieldComponent, FieldConfig, FormColumn as FormColumnConfig, FormConfig, FormItem, FormRenderApi, FormState } from "../types";

function hasResponsiveGridPlacement<TValues extends Record<string, unknown>>(item: FormItem<TValues>) {
    return Boolean(item.span || item.offset);
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
        <div className="formakit-column" style={createResponsiveGridStyle({ span: column.span, offset: column.offset, prefix: "column" })}>
            {column.items.map((item) => {
                if (item.kind === "custom") {
                    return (
                        <FormItemShell key={item.id} item={item}>
                            {item.render(api)}
                        </FormItemShell>
                    );
                }

                return (
                    <FormItemShell key={item.field.name} item={item}>
                        <FieldItemRenderer
                            field={item.field}
                            config={config}
                            state={state}
                            setValue={setValue}
                            setTouched={setTouched}
                        />
                    </FormItemShell>
                );
            })}
        </div>
    );
}

function FormItemShell<TValues extends Record<string, unknown>>(props: {
    item: FormItem<TValues>;
    children: React.ReactNode;
}) {
    if (!hasResponsiveGridPlacement(props.item)) {
        return <>{props.children}</>;
    }

    return (
        <div
            className="formakit-item"
            style={createResponsiveGridStyle({
                span: props.item.span,
                offset: props.item.offset,
                prefix: "item",
            })}
        >
            {props.children}
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

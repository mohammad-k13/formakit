import { useCallback, useMemo } from "react";
import { resolveCondition } from "../utils/resolveCondition";
import type { FieldConfig, FormConfig, FormState } from "../types";

export function useFieldController<TValues extends Record<string, unknown>>(args: {
    field: FieldConfig<TValues>;
    config: FormConfig<TValues>;
    state: FormState<TValues>;
    setValue: (name: keyof TValues & string, value: unknown) => void;
    setTouched: (name: keyof TValues & string, touched: boolean) => void;
}) {
    const { field, config, state, setValue, setTouched } = args;

    const onChange = useCallback(
        (value: unknown) => setValue(field.name, value),
        [field.name, setValue],
    );

    const onBlur = useCallback(() => setTouched(field.name, true), [field.name, setTouched]);

    return useMemo(() => {
        const options =
            typeof field.options === "function"
                ? field.options({ values: state.values, context: config.context })
                : field.options;

        return {
            name: field.name,
            value: state.values[field.name],
            onChange,
            onBlur,
            disabled: resolveCondition(field.disabled, state.values, config.context),
            hidden: resolveCondition(field.hidden, state.values, config.context),
            readOnly: field.readOnly,
            error: state.errors[field.name],
            options,
            ui: field.ui,
            props: field.props,
        };
    }, [config.context, field, onBlur, onChange, state.errors, state.values]);
}

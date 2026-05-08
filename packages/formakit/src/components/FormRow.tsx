import React from "react";
import { FormColumn } from "./FormColumn";
import { resolveCondition } from "../utils/resolveCondition";
import type { FormConfig, FormRenderApi, FormRow as FormRowConfig, FormState } from "../types";

export function FormRow<TValues extends Record<string, unknown>>(props: {
    row: FormRowConfig<TValues>;
    config: FormConfig<TValues>;
    state: FormState<TValues>;
    api: FormRenderApi<TValues>;
    setValue: (name: keyof TValues & string, value: unknown) => void;
    setTouched: (name: keyof TValues & string, touched: boolean) => void;
}) {
    const { row, config, state, api, setValue, setTouched } = props;

    if (resolveCondition(row.hidden, state.values, config.context)) return null;

    return (
        <div className="formakit-row" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
            {row.columns.map((column) => (
                <FormColumn
                    key={column.id}
                    column={column}
                    config={config}
                    state={state}
                    api={api}
                    setValue={setValue}
                    setTouched={setTouched}
                />
            ))}
        </div>
    );
}

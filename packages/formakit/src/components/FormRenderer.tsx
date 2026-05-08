import React from "react";
import { FormRow } from "./FormRow";
import type { FormConfig, FormRenderApi, FormState } from "../types";

export function FormRenderer<TValues extends Record<string, unknown>>(props: {
    config: FormConfig<TValues>;
    state: FormState<TValues>;
    api: FormRenderApi<TValues>;
    setValue: (name: keyof TValues & string, value: unknown) => void;
    setTouched: (name: keyof TValues & string, touched: boolean) => void;
}) {
    return (
        <>
            {props.config.rows.map((row) => (
                <FormRow
                    key={row.id}
                    row={row}
                    config={props.config}
                    state={props.state}
                    api={props.api}
                    setValue={props.setValue}
                    setTouched={props.setTouched}
                />
            ))}
        </>
    );
}

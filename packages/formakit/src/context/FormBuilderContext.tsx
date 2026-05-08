import React, { createContext, useContext } from "react";
import type { FormRenderApi } from "../types";

const FormBuilderContext = createContext<FormRenderApi<Record<string, unknown>> | null>(null);

export function FormBuilderProvider<TValues extends Record<string, unknown>>(props: {
    api: FormRenderApi<TValues>;
    children: React.ReactNode;
}) {
    return (
        <FormBuilderContext.Provider value={props.api as FormRenderApi<Record<string, unknown>>}>
            {props.children}
        </FormBuilderContext.Provider>
    );
}

export function useFormBuilderContext<TValues extends Record<string, unknown>>() {
    const context = useContext(FormBuilderContext);
    if (!context) {
        throw new Error("useFormBuilderContext must be used inside FormBuilder");
    }

    return context as FormRenderApi<TValues>;
}

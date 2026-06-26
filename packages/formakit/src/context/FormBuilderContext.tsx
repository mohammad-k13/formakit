import React, { createContext, useContext } from "react";
import type { FormBuilderAdaptor, FormRenderApi } from "../types";

const FormBuilderContext = createContext<FormRenderApi<Record<string, unknown>> | null>(null);
const FormBuilderAdaptorContext = createContext<FormBuilderAdaptor<Record<string, unknown>> | null>(null);

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

export function FormBuilderAdaptorProvider<TValues extends Record<string, unknown>>(props: {
    adaptor: FormBuilderAdaptor<TValues>;
    children: React.ReactNode;
}) {
    return (
        <FormBuilderAdaptorContext.Provider value={props.adaptor as FormBuilderAdaptor<Record<string, unknown>>}>
            {props.children}
        </FormBuilderAdaptorContext.Provider>
    );
}

export function FormBuilderGlobalProvider<TValues extends Record<string, unknown>>(props: {
    adaptor: FormBuilderAdaptor<TValues>;
    children: React.ReactNode;
}) {
    return <FormBuilderAdaptorProvider {...props} />;
}

export function useFormBuilderAdaptor<TValues extends Record<string, unknown>>() {
    const context = useContext(FormBuilderAdaptorContext);
    if (!context) {
        return null;
    }

    return context as FormBuilderAdaptor<TValues>;
}

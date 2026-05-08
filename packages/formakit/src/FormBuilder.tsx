import React from "react";
import { FormRenderer } from "./components/FormRenderer";
import { FormBuilderProvider } from "./context/FormBuilderContext";
import { useFormBuilder } from "./hooks/useFormBuilder";
import type { FormBuilderProps } from "./types";

export function FormBuilder<TValues extends Record<string, unknown> = Record<string, unknown>>({
    config,
    className,
    style,
}: FormBuilderProps<TValues>) {
    const { config: normalizedConfig, state, api, setValue, setTouched, submit } = useFormBuilder(config);

    return (
        <FormBuilderProvider api={api}>
            <form
                id={normalizedConfig.id}
                className={className ?? "formakit-form"}
                style={style}
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                }}
            >
                <FormRenderer
                    config={normalizedConfig}
                    state={state}
                    api={api}
                    setValue={setValue}
                    setTouched={setTouched}
                />
            </form>
        </FormBuilderProvider>
    );
}

export default FormBuilder;

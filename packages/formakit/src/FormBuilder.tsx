import React from "react";
import { FormRenderer } from "./components/FormRenderer";
import { FormBuilderProvider, useFormBuilderAdaptor } from "./context/FormBuilderContext";
import { useFormBuilder } from "./hooks/useFormBuilder";
import type { FormBuilderProps } from "./types";
import { mergeConfigWithAdaptor } from "./utils/mergeConfigWithAdaptor";

export function FormBuilder<TValues extends Record<string, unknown> = Record<string, unknown>>({
    config,
    className,
    style,
}: FormBuilderProps<TValues>) {
    const adaptor = useFormBuilderAdaptor<TValues>();
    const mergedConfig = React.useMemo(() => mergeConfigWithAdaptor(config, adaptor), [adaptor, config]);
    const { config: normalizedConfig, state, api, setValue, setTouched, submit } = useFormBuilder(mergedConfig);

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

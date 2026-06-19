import React from "react";
import { FormColumn } from "./FormColumn";
import { resolveCondition } from "../utils/resolveCondition";
import type { FormConfig, FormRenderApi, FormRow as FormRowConfig, FormState } from "../types";

const responsiveGridStyles = `
  .formakit-row {
    display: grid;
    gap: var(--formakit-row-gap, 16px);
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .formakit-column {
    display: grid;
    gap: var(--formakit-column-gap, 18px);
    grid-template-columns: repeat(12, minmax(0, 1fr));
    --formakit-active-column-span: var(--formakit-column-span-base, 12);
    --formakit-active-column-start: var(--formakit-column-start-base, 1);
    grid-column: var(--formakit-active-column-start) / span var(--formakit-active-column-span);
  }

  .formakit-item {
    --formakit-active-item-span: var(--formakit-item-span-base, 12);
    --formakit-active-item-start: var(--formakit-item-start-base, 1);
    grid-column: var(--formakit-active-item-start) / span var(--formakit-active-item-span);
  }

  @media (min-width: 0px) {
    .formakit-column {
      --formakit-active-column-span: var(--formakit-column-span-xs, var(--formakit-column-span-base, 12));
      --formakit-active-column-start: var(--formakit-column-start-xs, var(--formakit-column-start-base, 1));
    }

    .formakit-item {
      --formakit-active-item-span: var(--formakit-item-span-xs, var(--formakit-item-span-base, 12));
      --formakit-active-item-start: var(--formakit-item-start-xs, var(--formakit-item-start-base, 1));
    }
  }

  @media (min-width: 640px) {
    .formakit-column {
      --formakit-active-column-span: var(--formakit-column-span-sm, var(--formakit-column-span-xs, var(--formakit-column-span-base, 12)));
      --formakit-active-column-start: var(--formakit-column-start-sm, var(--formakit-column-start-xs, var(--formakit-column-start-base, 1)));
    }

    .formakit-item {
      --formakit-active-item-span: var(--formakit-item-span-sm, var(--formakit-item-span-xs, var(--formakit-item-span-base, 12)));
      --formakit-active-item-start: var(--formakit-item-start-sm, var(--formakit-item-start-xs, var(--formakit-item-start-base, 1)));
    }
  }

  @media (min-width: 768px) {
    .formakit-column {
      --formakit-active-column-span: var(--formakit-column-span-md, var(--formakit-column-span-sm, var(--formakit-column-span-xs, var(--formakit-column-span-base, 12))));
      --formakit-active-column-start: var(--formakit-column-start-md, var(--formakit-column-start-sm, var(--formakit-column-start-xs, var(--formakit-column-start-base, 1))));
    }

    .formakit-item {
      --formakit-active-item-span: var(--formakit-item-span-md, var(--formakit-item-span-sm, var(--formakit-item-span-xs, var(--formakit-item-span-base, 12))));
      --formakit-active-item-start: var(--formakit-item-start-md, var(--formakit-item-start-sm, var(--formakit-item-start-xs, var(--formakit-item-start-base, 1))));
    }
  }

  @media (min-width: 1024px) {
    .formakit-column {
      --formakit-active-column-span: var(--formakit-column-span-lg, var(--formakit-column-span-md, var(--formakit-column-span-sm, var(--formakit-column-span-xs, var(--formakit-column-span-base, 12)))));
      --formakit-active-column-start: var(--formakit-column-start-lg, var(--formakit-column-start-md, var(--formakit-column-start-sm, var(--formakit-column-start-xs, var(--formakit-column-start-base, 1)))));
    }

    .formakit-item {
      --formakit-active-item-span: var(--formakit-item-span-lg, var(--formakit-item-span-md, var(--formakit-item-span-sm, var(--formakit-item-span-xs, var(--formakit-item-span-base, 12)))));
      --formakit-active-item-start: var(--formakit-item-start-lg, var(--formakit-item-start-md, var(--formakit-item-start-sm, var(--formakit-item-start-xs, var(--formakit-item-start-base, 1)))));
    }
  }

  @media (min-width: 1280px) {
    .formakit-column {
      --formakit-active-column-span: var(--formakit-column-span-xl, var(--formakit-column-span-lg, var(--formakit-column-span-md, var(--formakit-column-span-sm, var(--formakit-column-span-xs, var(--formakit-column-span-base, 12))))));
      --formakit-active-column-start: var(--formakit-column-start-xl, var(--formakit-column-start-lg, var(--formakit-column-start-md, var(--formakit-column-start-sm, var(--formakit-column-start-xs, var(--formakit-column-start-base, 1))))));
    }

    .formakit-item {
      --formakit-active-item-span: var(--formakit-item-span-xl, var(--formakit-item-span-lg, var(--formakit-item-span-md, var(--formakit-item-span-sm, var(--formakit-item-span-xs, var(--formakit-item-span-base, 12))))));
      --formakit-active-item-start: var(--formakit-item-start-xl, var(--formakit-item-start-lg, var(--formakit-item-start-md, var(--formakit-item-start-sm, var(--formakit-item-start-xs, var(--formakit-item-start-base, 1))))));
    }
  }
`;

function FormKitResponsiveGridStyles() {
    return <style>{responsiveGridStyles}</style>;
}

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
        <>
            <FormKitResponsiveGridStyles />
            <div className="formakit-row">
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
        </>
    );
}

import type React from "react";
import type { FieldConfig } from "./fields";
import type { FormRenderApi } from "./state";

export interface FormRow<TValues extends Record<string, unknown>> {
    id: string;
    columns: FormColumn<TValues>[];
    hidden?: boolean | ((args: { values: TValues; context?: Record<string, unknown> }) => boolean);
}

export interface FormColumn<TValues extends Record<string, unknown>> {
    id: string;
    span?: ResponsiveSpan;
    offset?: ResponsiveSpan;
    hidden?: boolean | ((args: { values: TValues; context?: Record<string, unknown> }) => boolean);
    items: FormItem<TValues>[];
}

export type ResponsiveSpan =
    | number
    | {
          xs?: number;
          sm?: number;
          md?: number;
          lg?: number;
          xl?: number;
      };

export type FormItem<TValues extends Record<string, unknown>> = FieldItem<TValues> | CustomItem<TValues>;

export interface CustomItem<TValues extends Record<string, unknown>> {
    kind: "custom";
    id: string;
    span?: ResponsiveSpan;
    offset?: ResponsiveSpan;
    render: (api: FormRenderApi<TValues>) => React.ReactNode;
}

export interface FieldItem<TValues extends Record<string, unknown>> {
    kind: "field";
    span?: ResponsiveSpan;
    offset?: ResponsiveSpan;
    field: FieldConfig<TValues>;
}

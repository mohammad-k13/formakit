import React from "react";
import { Checkbox, DatePicker, Input, InputNumber, Radio, Select, Switch, TimePicker } from "antd";
import type { RadioChangeEvent } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { DesignComponentProps, DesignSystemConfig } from "formakit";

type AnyProps = Record<string, unknown>;

function asObject(value: unknown): AnyProps {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return value as AnyProps;
}

function toStringValue(value: unknown) {
    if (typeof value === "string" || typeof value === "number") return String(value);
    return undefined;
}

function toNumberValue(value: unknown) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.length > 0) {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

function toDateValue(value: unknown): Dayjs | null {
    if (typeof value !== "string" || !value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
}

function AntTextInput(props: DesignComponentProps) {
    return (
        <Input
            name={props.name}
            value={toStringValue(props.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            onBlur={props.onBlur}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onChange(event.target.value)}
            {...asObject(props.props)}
        />
    );
}

function AntPasswordInput(props: DesignComponentProps) {
    return (
        <Input.Password
            name={props.name}
            value={toStringValue(props.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            onBlur={props.onBlur}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onChange(event.target.value)}
            {...asObject(props.props)}
        />
    );
}

function AntTextarea(props: DesignComponentProps) {
    return (
        <Input.TextArea
            name={props.name}
            value={toStringValue(props.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            onBlur={props.onBlur}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange(event.target.value)}
            {...asObject(props.props)}
        />
    );
}

function AntNumberInput(props: DesignComponentProps) {
    return (
        <InputNumber
            style={{ width: "100%" }}
            value={toNumberValue(props.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            onBlur={props.onBlur}
            onChange={(value: number | string | null) => props.onChange(value ?? "")}
            {...asObject(props.props)}
        />
    );
}

function AntSelectInput(props: DesignComponentProps) {
    return (
        <Select
            value={props.value as string | number | boolean | undefined}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            options={props.options}
            onBlur={props.onBlur}
            onChange={(value: string | number | boolean) => props.onChange(value)}
            {...asObject(props.props)}
        />
    );
}

function AntRadioInput(props: DesignComponentProps) {
    return (
        <Radio.Group
            value={props.value as string | number | boolean | undefined}
            disabled={props.disabled}
            onBlur={props.onBlur}
            onChange={(event: RadioChangeEvent) => props.onChange(event.target.value)}
            {...asObject(props.props)}
        >
            {(props.options ?? []).map((option) => (
                <Radio key={`${option.value}`} value={option.value} disabled={option.disabled}>
                    {option.label}
                </Radio>
            ))}
        </Radio.Group>
    );
}

function AntCheckboxInput(props: DesignComponentProps) {
    return (
        <Checkbox
            name={props.name}
            checked={Boolean(props.value)}
            disabled={props.disabled}
            onBlur={props.onBlur}
            onChange={(event: { target: { checked: boolean } }) => props.onChange(event.target.checked)}
            {...asObject(props.props)}
        />
    );
}

function AntSwitchInput(props: DesignComponentProps) {
    return (
        <Switch
            checked={Boolean(props.value)}
            disabled={props.disabled}
            onChange={(checked: boolean) => props.onChange(checked)}
            {...asObject(props.props)}
        />
    );
}

function AntDateInput(props: DesignComponentProps) {
    return (
        <DatePicker
            style={{ width: "100%" }}
            value={toDateValue(props.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            onBlur={props.onBlur}
            onChange={(value: Dayjs | null) => props.onChange(value ? value.format("YYYY-MM-DD") : "")}
            {...asObject(props.props)}
        />
    );
}

function AntTimeInput(props: DesignComponentProps) {
    return (
        <TimePicker
            style={{ width: "100%" }}
            value={toDateValue(props.value)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            status={props.error ? "error" : undefined}
            onBlur={props.onBlur}
            onChange={(value: Dayjs | null) => props.onChange(value ? value.format("HH:mm:ss") : "")}
            {...asObject(props.props)}
        />
    );
}

export const antDesignAdaptor: DesignSystemConfig = {
    components: {
        text: AntTextInput,
        email: AntTextInput,
        password: AntPasswordInput,
        number: AntNumberInput,
        textarea: AntTextarea,
        select: AntSelectInput,
        radio: AntRadioInput,
        checkbox: AntCheckboxInput,
        switch: AntSwitchInput,
        date: AntDateInput,
        time: AntTimeInput,
    },
};

export function createAntDesignAdaptor(overrides?: Partial<DesignSystemConfig>): DesignSystemConfig {
    return {
        components: {
            ...antDesignAdaptor.components,
            ...(overrides?.components ?? {}),
        },
        adapters: {
            ...(antDesignAdaptor.adapters ?? {}),
            ...(overrides?.adapters ?? {}),
        },
    };
}

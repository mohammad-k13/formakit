import { CheckboxField } from "./CheckboxField";
import { DateField } from "./DateField";
import { NumberField } from "./NumberField";
import { RadioField } from "./RadioField";
import { SelectField } from "./SelectField";
import { SwitchField } from "./SwitchField";
import { TextareaField } from "./TextareaField";
import { TextField } from "./TextField";
import { TimeField } from "./TimeField";
import type { FieldComponentRegistry } from "../../types";

export const defaultFieldComponents: FieldComponentRegistry<Record<string, unknown>> = {
    text: TextField,
    email: TextField,
    password: TextField,
    number: NumberField,
    textarea: TextareaField,
    select: SelectField,
    radio: RadioField,
    checkbox: CheckboxField,
    switch: SwitchField,
    date: DateField,
    time: TimeField,
};

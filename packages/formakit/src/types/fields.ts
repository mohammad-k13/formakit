export type BuildInValidationTypes = "required" | "minLength" | "maxLength" | "min" | "max" | "pattern" | "email" | "custom";

export interface IField {
      name: string;
      label: string;
      labelPosition: "right" | "left" | "top" | "bottom"
      type: string;
      options: any;
      placeholder: string;
      required: boolean;
      disabled: boolean;
      loading: boolean;
      error: string;
}
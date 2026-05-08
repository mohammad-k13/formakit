import type { ValidationModeConfig } from "../types";

export const DEFAULT_VALIDATION_MODE: Required<ValidationModeConfig> = {
    defaultTrigger: "submit",
    revalidateAfterSubmit: "change",
    touchStrategy: "blur",
    validateOnMount: false,
};

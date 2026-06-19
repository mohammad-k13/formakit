import type { ValidationTrigger } from "../types";

export function includesTrigger(
    trigger: ValidationTrigger | ValidationTrigger[] | undefined,
    expected: ValidationTrigger,
): boolean {
    if (!trigger) return false;
    return Array.isArray(trigger) ? trigger.includes(expected) : trigger === expected;
}

export function includesRevalidationTrigger(
    trigger: "change" | "blur" | "change-or-blur" | undefined,
    expected: "change" | "blur",
): boolean {
    if (!trigger) return false;
    if (trigger === "change-or-blur") return true;
    return trigger === expected;
}

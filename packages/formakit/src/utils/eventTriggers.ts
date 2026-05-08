import type { ValidationTrigger } from "../types";

export function includesTrigger(
    trigger: ValidationTrigger | ValidationTrigger[] | undefined,
    expected: ValidationTrigger,
): boolean {
    if (!trigger) return false;
    return Array.isArray(trigger) ? trigger.includes(expected) : trigger === expected;
}

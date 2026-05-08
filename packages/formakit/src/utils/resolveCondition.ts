import type { ConditionResolver } from "../types";

export function resolveCondition<TValues extends Record<string, unknown>>(
    condition: boolean | ConditionResolver<TValues> | undefined,
    values: TValues,
    context?: Record<string, unknown>,
): boolean {
    if (typeof condition === "function") {
        return condition({ values, context });
    }

    return Boolean(condition);
}

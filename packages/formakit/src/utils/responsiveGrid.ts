import type React from "react";
import type { ResponsiveSpan } from "../types";

export type ResponsiveGridStyle = React.CSSProperties & Record<`--formakit-${string}`, string | number>;

export function clampSpan(span: number) {
    return Math.min(Math.max(span, 1), 12);
}

export function clampOffset(offset: number) {
    return Math.min(Math.max(offset, 0), 11);
}

export function createResponsiveGridStyle(args: {
    span?: ResponsiveSpan;
    offset?: ResponsiveSpan;
    prefix: "column" | "item";
}): React.CSSProperties {
    const style = {
        [`--formakit-${args.prefix}-span-base`]: 12,
        [`--formakit-${args.prefix}-start-base`]: 1,
    } as ResponsiveGridStyle;

    if (typeof args.span === "number") {
        style[`--formakit-${args.prefix}-span-base`] = clampSpan(args.span);
    } else if (args.span) {
        for (const [breakpoint, value] of Object.entries(args.span)) {
            if (typeof value !== "number") continue;
            style[`--formakit-${args.prefix}-span-${breakpoint}`] = clampSpan(value);
        }
    }

    if (typeof args.offset === "number") {
        style[`--formakit-${args.prefix}-start-base`] = clampOffset(args.offset) + 1;
    } else if (args.offset) {
        for (const [breakpoint, value] of Object.entries(args.offset)) {
            if (typeof value !== "number") continue;
            style[`--formakit-${args.prefix}-start-${breakpoint}`] = clampOffset(value) + 1;
        }
    }

    return style;
}

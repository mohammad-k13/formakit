import type { ResponsiveSpanSchema } from "../types/schema";
import { FieldGroup, Input, Select } from "../ui";

const BREAKPOINTS = ["xs", "sm", "md", "lg", "xl"] as const;

function isResponsiveObject(
    span: ResponsiveSpanSchema | undefined,
): span is Exclude<ResponsiveSpanSchema, number> {
    return typeof span === "object" && span !== null;
}

export function ResponsiveSpanEditor(props: {
    label: string;
    value?: ResponsiveSpanSchema;
    onChange: (value: ResponsiveSpanSchema | undefined) => void;
}) {
    const mode = isResponsiveObject(props.value) ? "responsive" : "fixed";
    const fixedValue = typeof props.value === "number" ? String(props.value) : "";

    return (
        <div className="fp-responsive-span">
            <FieldGroup label={props.label}>
                <Select
                    value={mode}
                    options={[
                        { label: "Fixed span", value: "fixed" },
                        { label: "Per breakpoint", value: "responsive" },
                    ]}
                    onChange={(nextMode) => {
                        if (nextMode === "fixed") {
                            props.onChange(typeof props.value === "number" ? props.value : 12);
                            return;
                        }
                        props.onChange({
                            xs: typeof props.value === "number" ? props.value : 12,
                            sm: undefined,
                            md: undefined,
                            lg: undefined,
                            xl: undefined,
                        });
                    }}
                />
            </FieldGroup>

            {mode === "fixed" ? (
                <FieldGroup label="Span (1-12)">
                    <Input
                        value={fixedValue}
                        placeholder="12"
                        onChange={(value) => {
                            const parsed = Number(value);
                            props.onChange(Number.isNaN(parsed) ? undefined : parsed);
                        }}
                    />
                </FieldGroup>
            ) : (
                <div className="fp-responsive-span__grid">
                    {BREAKPOINTS.map((breakpoint) => (
                        <FieldGroup key={breakpoint} label={breakpoint.toUpperCase()}>
                            <Input
                                value={
                                    isResponsiveObject(props.value) && props.value[breakpoint] != null
                                        ? String(props.value[breakpoint])
                                        : ""
                                }
                                placeholder="—"
                                onChange={(value) => {
                                    const current = isResponsiveObject(props.value)
                                        ? { ...props.value }
                                        : { xs: 12 };
                                    const parsed = Number(value);
                                    if (value === "" || Number.isNaN(parsed)) {
                                        delete current[breakpoint];
                                    } else {
                                        current[breakpoint] = parsed;
                                    }
                                    const hasValues = BREAKPOINTS.some((bp) => current[bp] != null);
                                    props.onChange(hasValues ? current : undefined);
                                }}
                            />
                        </FieldGroup>
                    ))}
                </div>
            )}
        </div>
    );
}

export function formatResponsiveSpan(span?: ResponsiveSpanSchema) {
    if (span == null) return "auto";
    if (typeof span === "number") return String(span);
    const parts = BREAKPOINTS.filter((bp) => span[bp] != null).map((bp) => `${bp}:${span[bp]}`);
    return parts.length > 0 ? parts.join(" ") : "auto";
}

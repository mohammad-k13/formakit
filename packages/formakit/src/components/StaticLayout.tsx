import React, { useState } from "react";
import { IStaticLayout } from "../types/layouts";
import { Layout, ReactGridLayout, useContainerWidth } from "react-grid-layout";

const StaticLayout = (conifg: IStaticLayout) => {
    const { containerRef, width, mounted } = useContainerWidth();

    const [newLayout, setNewLayout] = useState<Layout | null>(null);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            {mounted && (
                <ReactGridLayout
                    width={width}
                    layout={conifg.layouts}
                    gridConfig={conifg.gridConfig}
                    onLayoutChange={(layout) => {
                        console.log("layout changed", layout);
                        setNewLayout(layout);
                    }}
                >
                    {conifg.fields.map((field, index) => (
                        <div
                            key={field.name}
                            style={{
                                border: "1px solid #f1222370",
                                borderRadius: "8px",
                                textAlign: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                                padding: 5,
                            }}
                        >
                            <input
                                type={field.type}
                                name={field.name}
                                style={{ width: "100%" }}
                            />
                        </div>
                    ))}
                </ReactGridLayout>
            )}

            <button
                onClick={() => {
                    if (!!!newLayout) return;
                    navigator.clipboard.writeText(JSON.stringify(newLayout));
                    setNewLayout(null);
                }}
                disabled={!!!newLayout}
            >
                copy New layout
            </button>
        </div>
    );
};

export default StaticLayout;

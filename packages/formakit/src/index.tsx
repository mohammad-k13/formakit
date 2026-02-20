import React from "react";
import {
    GridLayoutProps,
    ReactGridLayout,
    Responsive,
    ResponsiveGridLayoutProps,
    useContainerWidth,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { IFormBuilderConfig } from "./types";
import { ResponsiveLayout, StaticLayout } from "./components";

const FormBuilder = ({config}: IFormBuilderConfig) => {
    const { width, containerRef, mounted } = useContainerWidth();
    console.log("width", width);
    const layoutType = config.type;

    const layout: GridLayoutProps["layout"] = [
        { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
        { i: "b", x: 1, y: 0, w: 4, h: 2 },
        { i: "c", x: 5, y: 0, w: 1, h: 2 },
    ];

    const layouts: ResponsiveGridLayoutProps["layouts"] = {
        md: [
            { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
            { i: "b", x: 1, y: 0, w: 2, h: 2 },
            { i: "c", x: 3, y: 0, w: 1, h: 2 },
        ],
        lg: [
            { i: "a", x: 0, y: 0, w: 1, h: 2 },
            { i: "b", x: 1, y: 0, w: 16, h: 2 },
            { i: "c", x: 17, y: 0, w: 1, h: 2 },
        ],
    };

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "800px",
                border: "1px solid #442",
                borderRadius: "5px",
            }}
        >
            {mounted && (
                <Responsive
                    layouts={layouts}
                    width={width}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 18, md: 4, sm: 6, xs: 4, xxs: 2 }}
                    // gridConfig={{ cols: 6, rowHeight: 30 }}
                >
                    <div
                        key="a"
                        style={{
                            border: "1px solid #f1222370",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                        }}
                    >
                        a
                    </div>
                    <div
                        key="b"
                        style={{
                            border: "1px solid #f1222370",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                        }}
                    >
                        b
                    </div>
                    <div
                        key="c"
                        style={{
                            border: "1px solid #f1222370",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                        }}
                    >
                        c
                    </div>
                </Responsive>
            )}

            <div
                style={{
                    width: "80%",
                    height: "1px",
                    background: "#595959",
                    marginBlock: "15px",
                    marginInline:" auto"
                }}
            />

            <div
                style={{
                    width: "95%",
                    height: "400px",
                    border: "1px solid #442",
                    borderRadius: "5px",
                    marginInline:"auto",
                    padding: '5px'
                }}
            >
                {layoutType === "responsive" ? (
                    <ResponsiveLayout {...config} />
                ) : (
                    <StaticLayout {...config} />
                )}
            </div>
        </div>
    );
};

export default FormBuilder;

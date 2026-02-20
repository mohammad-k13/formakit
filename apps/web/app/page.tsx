"use client";

import FormBuilder from "@formakit/form-builder";

export default function Home() {
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <FormBuilder
                config={{
                    type: "static",
                    layouts: [
                        {
                            i: "text_input",
                            x: 0,
                            y: 0,
                            w: 2,
                            h: 2,
                            moved: false,
                            static: false,
                        },
                        {
                            i: "password_input",
                            x: 2,
                            y: 0,
                            w: 10,
                            h: 10,
                            moved: false,
                            static: false,
                        },

                        // { i: "text_input", h: 4, x: 0, w: 6, y: 1 },
                        // { i: "password_input", h: 4,w: 3, x: 6, y: 1,},
                    ],
                    gridConfig: {
                        cols: 12,
                        rowHeight: 30,
                    },
                    fields: [
                        {
                            name: "text_input",
                            label: "Text Input",
                            type: "text",
                            placeholder: "Enter text",
                            disabled: false,
                            error: "",
                            labelPosition: "right",
                            loading: false,
                            options: null,
                            required: true,
                        },
                        {
                            name: "password_input",
                            label: "Text Input",
                            type: "password",
                            placeholder: "Enter text",
                            disabled: false,
                            error: "",
                            labelPosition: "right",
                            loading: false,
                            options: null,
                            required: true,
                        },
                    ],
                }}
            />
        </div>
    );
}

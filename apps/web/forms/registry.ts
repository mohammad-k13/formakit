import type { FormDefinition } from "formakit-panel";

export const loginForm: FormDefinition = {
    id: "login",
    name: "Login",
    description: "User authentication form",
    schema: {
        id: "login",
        initialValues: {
            email: "",
            password: "",
            remember: false,
        },
        mode: {
            defaultTrigger: ["blur", "submit"],
            revalidateAfterSubmit: "change",
            touchStrategy: "blur",
        },
        rows: [
            {
                id: "login-row",
                columns: [
                    {
                        id: "login-column",
                        span: 12,
                        items: [
                            {
                                kind: "field",
                                field: {
                                    name: "email",
                                    type: "email",
                                    label: "Email",
                                    placeholder: "you@example.com",
                                    validation: {
                                        rules: [
                                            { type: "required", message: "Email is required" },
                                            { type: "email", message: "Enter a valid email" },
                                        ],
                                    },
                                },
                            },
                            {
                                kind: "field",
                                field: {
                                    name: "password",
                                    type: "password",
                                    label: "Password",
                                    validation: {
                                        rules: [
                                            { type: "required", message: "Password is required" },
                                            { type: "minLength", value: 6, message: "At least 6 characters" },
                                        ],
                                    },
                                },
                            },
                            {
                                kind: "field",
                                field: {
                                    name: "remember",
                                    type: "checkbox",
                                    label: "Remember me",
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export const signupForm: FormDefinition = {
    id: "signup",
    name: "Signup",
    description: "Create a new account",
    schema: {
        id: "signup",
        initialValues: {
            fullName: "",
            email: "",
            role: "",
            bio: "",
        },
        rows: [
            {
                id: "profile-row",
                columns: [
                    {
                        id: "left-column",
                        span: 6,
                        items: [
                            {
                                kind: "field",
                                field: {
                                    name: "fullName",
                                    type: "text",
                                    label: "Full name",
                                    validation: {
                                        rules: [{ type: "required", message: "Name is required" }],
                                    },
                                },
                            },
                            {
                                kind: "field",
                                field: {
                                    name: "email",
                                    type: "email",
                                    label: "Email",
                                    validation: {
                                        rules: [
                                            { type: "required", message: "Email is required" },
                                            { type: "email" },
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                    {
                        id: "right-column",
                        span: 6,
                        items: [
                            {
                                kind: "field",
                                field: {
                                    name: "role",
                                    type: "select",
                                    label: "Role",
                                    options: [
                                        { label: "Developer", value: "developer" },
                                        { label: "Designer", value: "designer" },
                                        { label: "Manager", value: "manager" },
                                    ],
                                    validation: {
                                        rules: [{ type: "required", message: "Select a role" }],
                                    },
                                },
                            },
                            {
                                kind: "field",
                                field: {
                                    name: "bio",
                                    type: "textarea",
                                    label: "Bio",
                                    placeholder: "Tell us about yourself",
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export const contactForm: FormDefinition = {
    id: "contact",
    name: "Contact",
    description: "Contact request form",
    schema: {
        id: "contact",
        initialValues: {
            name: "",
            phone: "",
            message: "",
        },
        rows: [
            {
                id: "contact-row",
                columns: [
                    {
                        id: "contact-column",
                        span: 12,
                        items: [
                            {
                                kind: "field",
                                span: 6,
                                field: {
                                    name: "name",
                                    type: "text",
                                    label: "Name",
                                    validation: {
                                        rules: [{ type: "required" }],
                                    },
                                },
                            },
                            {
                                kind: "field",
                                span: 6,
                                field: {
                                    name: "phone",
                                    type: "text",
                                    label: "Phone",
                                },
                            },
                            {
                                kind: "field",
                                field: {
                                    name: "message",
                                    type: "textarea",
                                    label: "Message",
                                    validation: {
                                        rules: [
                                            { type: "required" },
                                            { type: "minLength", value: 10, message: "At least 10 characters" },
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export const formRegistry: FormDefinition[] = [loginForm, signupForm, contactForm];

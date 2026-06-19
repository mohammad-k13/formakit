"use client";

import FormBuilder, { type FormConfig } from "@formakit/form-builder";

type DemoFormValues = {
  fullName: string;
  email: string;
  company: string;
  budget: string;
  projectType: string;
  startDate: string;
  message: string;
  subscribe: boolean;
};

const fieldStyle = {
  width: "100%",
  minHeight: 44,
  border: "1px solid #d7dfcc",
  borderRadius: 12,
  padding: "10px 12px",
  background: "#fffdf7",
  color: "#172015",
  fontSize: 15,
  outlineColor: "#5f7f3b",
};

const labelClassName = "formakit-demo-label";
const fieldClassName = "formakit-demo-field";

const demoStyles = `
  .formakit-demo-field {
    display: grid;
    gap: 7px;
  }

  .formakit-demo-label {
    color: #2d3a27;
    font-size: 14px;
    font-weight: 700;
  }

  .formakit-field-error {
    color: #9f2d20;
    font-size: 13px;
  }
`;

const formConfig: FormConfig<DemoFormValues> = {
  id: "project-request-form",
  initialValues: {
    fullName: "",
    email: "",
    company: "",
    budget: "",
    projectType: "",
    startDate: "",
    message: "",
    subscribe: true,
  },
  mode: {
    defaultTrigger: ["blur", "submit"],
    touchStrategy: "blur",
  },
  rows: [
    {
      id: "contact-row",
      columns: [
        {
          id: "full-name-column",
          span: {
            xs: 12, // mobile full row
            sm: 5,
            md: 24,
            lg: 12,
          },
          items: [
            {
              kind: "field",
              span: {
                xs: 5,
                md: 8,
                lg: 12,
              },
              field: {
                name: "fullName",
                type: "text",
                label: "Full name",
                placeholder: "Jane Cooper",
                ui: { className: fieldClassName, labelClassName },
                props: { style: fieldStyle },
                validation: {
                  rules: [
                    { type: "required", message: "Please enter your name." },
                    {
                      type: "minLength",
                      value: 2,
                      message: "Name must be at least 2 characters.",
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          id: "email-column",
          span: 6,
          items: [
            {
              kind: "field",
              field: {
                name: "email",
                type: "email",
                label: "Email address",
                placeholder: "jane@company.com",
                ui: { className: fieldClassName, labelClassName },
                props: { style: fieldStyle },
                validation: {
                  rules: [
                    { type: "required", message: "Please enter your email." },
                    { type: "email", message: "Enter a valid email address." },
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    {
      id: "project-row",
      columns: [
        {
          id: "company-column",
          span: 4,
          items: [
            {
              kind: "field",
              field: {
                name: "company",
                type: "text",
                label: "Company",
                placeholder: "Acme Inc.",
                ui: { className: fieldClassName, labelClassName },
                props: { style: fieldStyle },
              },
            },
          ],
        },
        {
          id: "project-type-column",
          span: 4,
          items: [
            {
              kind: "field",
              field: {
                name: "projectType",
                type: "select",
                label: "Project type",
                placeholder: "Select one",
                options: [
                  { label: "Website", value: "website" },
                  { label: "Dashboard", value: "dashboard" },
                  { label: "Mobile app", value: "mobile-app" },
                  { label: "Automation", value: "automation" },
                ],
                ui: { className: fieldClassName, labelClassName },
                props: { style: fieldStyle },
                validation: {
                  rules: [
                    { type: "required", message: "Choose a project type." },
                  ],
                },
              },
            },
          ],
        },
        {
          id: "budget-column",
          span: 4,
          items: [
            {
              kind: "field",
              field: {
                name: "budget",
                type: "select",
                label: "Budget",
                placeholder: "Choose range",
                options: [
                  { label: "$2k - $5k", value: "2-5k" },
                  { label: "$5k - $15k", value: "5-15k" },
                  { label: "$15k+", value: "15k-plus" },
                ],
                ui: { className: fieldClassName, labelClassName },
                props: { style: fieldStyle },
              },
            },
          ],
        },
      ],
    },
    {
      id: "details-row",
      columns: [
        {
          id: "start-date-column",
          span: 4,
          items: [
            {
              kind: "field",
              field: {
                name: "startDate",
                type: "date",
                label: "Ideal start date",
                ui: { className: fieldClassName, labelClassName },
                props: { style: fieldStyle },
              },
            },
            {
              kind: "field",
              field: {
                name: "subscribe",
                type: "checkbox",
                label: "Send me form updates",
                ui: { className: fieldClassName, labelClassName },
              },
            },
          ],
        },
        {
          id: "message-column",
          span: 8,
          items: [
            {
              kind: "field",
              field: {
                name: "message",
                type: "textarea",
                label: "Project details",
                placeholder: "Tell us what you want to build...",
                ui: { className: fieldClassName, labelClassName },
                props: {
                  rows: 5,
                  style: { ...fieldStyle, resize: "vertical" },
                },
                validation: {
                  rules: [
                    {
                      type: "required",
                      message: "Share a few details about your project.",
                    },
                    {
                      type: "minLength",
                      value: 20,
                      message: "Please add at least 20 characters.",
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    {
      id: "submit-row",
      columns: [
        {
          id: "submit-column",
          span: 12,
          items: [
            {
              kind: "custom",
              id: "submit-button",
              render: (api) => (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button
                    type="submit"
                    disabled={api.isSubmitting}
                    style={{
                      border: 0,
                      borderRadius: 999,
                      padding: "13px 22px",
                      background: "#172015",
                      color: "#fffdf7",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {api.isSubmitting ? "Sending..." : "Send request"}
                  </button>
                  {api.submitCount > 0 && !api.isValid ? (
                    <span style={{ color: "#9f2d20", fontSize: 14 }}>
                      Please fix the highlighted fields.
                    </span>
                  ) : null}
                </div>
              ),
            },
          ],
        },
      ],
    },
  ],
  submit: {
    validateBeforeSubmit: true,
    onSubmit: ({ values, helpers }) => {
      console.log("Form submitted:", values);
      window.alert("Thanks! Your request was submitted.");
      helpers.reset();
    },
  },
};

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "radial-gradient(circle at top left, #dfeec2 0, transparent 34%), linear-gradient(135deg, #fff9ea 0%, #f1ead6 52%, #d7e5c1 100%)",
        color: "#172015",
      }}
    >
      <section
        style={{
          width: "min(100%, 960px)",
          margin: "0 auto",
          border: "1px solid rgba(23, 32, 21, 0.12)",
          borderRadius: 28,
          padding: 28,
          background: "rgba(255, 253, 247, 0.82)",
          boxShadow: "0 24px 70px rgba(23, 32, 21, 0.14)",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              color: "#5f7f3b",
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Formakit demo
          </p>
          <h1
            style={{
              marginTop: 8,
              fontSize: "clamp(32px, 6vw, 64px)",
              lineHeight: 0.95,
            }}
          >
            Start a project request
          </h1>
          <p
            style={{
              marginTop: 14,
              maxWidth: 620,
              color: "#516049",
              fontSize: 17,
            }}
          >
            This page renders a complete form from a Formakit JSON config with
            layout, fields, options, validation, and submit handling.
          </p>
        </div>

        <FormBuilder config={formConfig} style={{ display: "grid", gap: 18 }} />

        <style
          dangerouslySetInnerHTML={{
            __html: demoStyles,
          }}
        />
      </section>
    </main>
  );
}

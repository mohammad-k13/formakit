# FormaKit Panel — Integration Prompt

Use this document as a complete guide (or copy it as an AI prompt) to integrate `formakit-panel` into an existing React / Next.js project.

---

## Goal

Install `formakit` + `formakit-panel`, register all your form configs in a local registry file, and mount the admin panel so your team can:

- Browse forms in a sidebar
- Live-preview each form
- Edit name, layout, fields, validation, options, and initial values
- Export / import JSON
- Save changes through a local `onSave` callback (no REST API required)

---

## Install

```bash
npm i formakit formakit-panel
```

---

## Project structure (recommended)

```
src/
  forms/
    registry.ts          # all FormDefinition[] configs
    types.ts             # optional: form value types
  formakit/
    designSystem.tsx     # optional: Ant Design / MUI adapters
  app/admin/forms/
    page.tsx             # mounts <FormakitPanel />
```

---

## Step 1 — Import panel styles

In your admin page (or root layout for admin routes):

```tsx
import "formakit-panel/styles.css";
```

---

## Step 2 — Create the form registry

Every form is a `FormDefinition`:

```ts
interface FormDefinition {
  id: string;           // unique id
  name: string;         // shown in sidebar
  description?: string; // optional subtitle in sidebar
  schema: FormConfigSchema; // JSON-serializable form config
}
```

Create `src/forms/registry.ts` and export an array of all forms.

**Important:** The panel edits `schema` only. Runtime-only pieces (submit handlers, design system components, custom render functions) are passed separately via `runtimeHooks` when rendering forms in your app — not inside the registry JSON.

---

## Step 3 — Mount the panel (registry mode, no API)

```tsx
"use client";

import { useState, useCallback } from "react";
import { FormakitPanel, type FormDefinition } from "formakit-panel";
import "formakit-panel/styles.css";
import { formRegistry as initialForms } from "@/forms/registry";

export default function FormsAdminPage() {
  const [forms, setForms] = useState<FormDefinition[]>(initialForms);

  const handleSave = useCallback((updated: FormDefinition) => {
  setForms((current) =>
    current.map((form) => (form.id === updated.id ? updated : form)),
  );

  // Optional: persist locally yourself (file, IndexedDB, etc.)
  // localStorage.setItem("form-registry", JSON.stringify(...));
  // writeFileSync("forms/registry.json", ...);
  }, []);

  const handleCreate = useCallback((created: FormDefinition) => {
    setForms((current) => [...current, created]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setForms((current) => current.filter((form) => form.id !== id));
  }, []);

  return (
    <FormakitPanel
      forms={forms}
      onSave={handleSave}
      onCreate={handleCreate}
      onDelete={handleDelete}
      // optional: pass design system for live preview
      // runtimeHooks={{ designSystem: myDesignSystem }}
    />
  );
}
```

### What you do NOT need

- No `/api/forms` routes
- No `fetch()` for load or save
- No `storage={{ type: "api", baseUrl: "..." }}`

The panel keeps drafts in memory. `onSave` / `onCreate` / `onDelete` let **your app** decide how to persist (local state, localStorage, writing files in a Node script, etc.).

---

## Step 4 — Render forms in your app (runtime)

Registry configs are schemas. Convert to runtime config when rendering:

```tsx
import { FormBuilder } from "formakit";
import { schemaToFormConfig } from "formakit-panel";
import { loginForm } from "@/forms/registry";
import { myDesignSystem } from "@/formakit/designSystem";

const config = schemaToFormConfig(loginForm.schema, {
  designSystem: myDesignSystem,
  submit: {
    onSubmit: async ({ values }) => {
      console.log(values);
    },
  },
});

export function LoginPage() {
  return <FormBuilder config={config} />;
}
```

---

## Full sample config

Below is a **complete reference** showing every major feature: multiple rows, responsive column/field spans, all common field types, validation rules, select options, and form mode.

```ts
import type { FormDefinition } from "formakit-panel";

export const projectRequestForm: FormDefinition = {
  id: "project-request",
  name: "Project Request",
  description: "Full-featured sample form for onboarding new projects",
  schema: {
    id: "project-request",
    initialValues: {
      fullName: "",
      email: "",
      company: "",
      phone: "",
      budget: "",
      projectType: "web",
      startDate: "",
      message: "",
      subscribe: true,
      terms: false,
    },
    mode: {
      defaultTrigger: ["blur", "submit"],
      revalidateAfterSubmit: "change",
      touchStrategy: "blur",
      validateOnMount: false,
    },
    rows: [
      {
        id: "contact-row",
        columns: [
          {
            id: "name-column",
            span: {
              xs: 12,
              sm: 12,
              md: 6,
              lg: 4,
              xl: 4,
            },
            items: [
              {
                kind: "field",
                span: 12,
                field: {
                  name: "fullName",
                  type: "text",
                  label: "Full name",
                  placeholder: "Jane Cooper",
                  description: "Your legal name as it appears on documents.",
                  validation: {
                    rules: [
                      { type: "required", message: "Name is required" },
                      { type: "minLength", value: 2, message: "At least 2 characters" },
                      { type: "maxLength", value: 80, message: "Max 80 characters" },
                    ],
                  },
                },
              },
            ],
          },
          {
            id: "email-column",
            span: {
              xs: 12,
              sm: 12,
              md: 6,
              lg: 4,
              xl: 4,
            },
            items: [
              {
                kind: "field",
                span: 12,
                field: {
                  name: "email",
                  type: "email",
                  label: "Email address",
                  placeholder: "jane@company.com",
                  validation: {
                    rules: [
                      { type: "required", message: "Email is required" },
                      { type: "email", message: "Enter a valid email" },
                    ],
                  },
                },
              },
            ],
          },
          {
            id: "phone-column",
            span: {
              xs: 12,
              sm: 12,
              md: 12,
              lg: 4,
              xl: 4,
            },
            items: [
              {
                kind: "field",
                span: 12,
                field: {
                  name: "phone",
                  type: "text",
                  label: "Phone",
                  placeholder: "+1 555 000 0000",
                  validation: {
                    rules: [
                      {
                        type: "pattern",
                        value: "^[+]?[0-9\\s()-]{7,20}$",
                        message: "Enter a valid phone number",
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
        id: "project-row",
        columns: [
          {
            id: "project-main-column",
            span: 12,
            items: [
              {
                kind: "field",
                span: { xs: 12, md: 6, lg: 4 },
                field: {
                  name: "company",
                  type: "text",
                  label: "Company",
                  placeholder: "Acme Inc.",
                },
              },
              {
                kind: "field",
                span: { xs: 12, md: 6, lg: 4 },
                field: {
                  name: "budget",
                  type: "number",
                  label: "Budget (USD)",
                  placeholder: "10000",
                  validation: {
                    rules: [
                      { type: "min", value: 1000, message: "Minimum budget is 1000" },
                      { type: "max", value: 1000000, message: "Maximum budget is 1,000,000" },
                    ],
                  },
                },
              },
              {
                kind: "field",
                span: { xs: 12, md: 12, lg: 4 },
                field: {
                  name: "projectType",
                  type: "select",
                  label: "Project type",
                  placeholder: "Select a type",
                  options: [
                    { label: "Web application", value: "web" },
                    { label: "Mobile application", value: "mobile" },
                    { label: "Design system", value: "design" },
                    { label: "Consulting", value: "consulting", disabled: false },
                  ],
                  validation: {
                    rules: [{ type: "required", message: "Please select a project type" }],
                  },
                },
              },
              {
                kind: "field",
                span: { xs: 12, md: 6 },
                field: {
                  name: "startDate",
                  type: "date",
                  label: "Preferred start date",
                },
              },
              {
                kind: "field",
                span: { xs: 12, md: 6 },
                field: {
                  name: "message",
                  type: "textarea",
                  label: "Project details",
                  placeholder: "Describe goals, timeline, and constraints...",
                  validation: {
                    rules: [
                      { type: "required", message: "Please describe your project" },
                      { type: "minLength", value: 20, message: "At least 20 characters" },
                    ],
                  },
                },
              },
              {
                kind: "field",
                span: { xs: 12, md: 6, lg: 4 },
                field: {
                  name: "subscribe",
                  type: "switch",
                  label: "Subscribe to updates",
                },
              },
              {
                kind: "field",
                span: { xs: 12, md: 6, lg: 4 },
                field: {
                  name: "terms",
                  type: "checkbox",
                  label: "I agree to the terms and conditions",
                  validation: {
                    rules: [{ type: "required", message: "You must accept the terms" }],
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

export const loginForm: FormDefinition = {
  id: "login",
  name: "Login",
  description: "User authentication",
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

/** Register every form your app uses here */
export const formRegistry: FormDefinition[] = [
  loginForm,
  projectRequestForm,
];
```

---

## Schema reference (quick)

### Layout

| Key | Type | Description |
|-----|------|-------------|
| `rows` | `FormRowSchema[]` | Top-level layout rows |
| `rows[].columns` | `FormColumnSchema[]` | Columns inside a row (12-col grid) |
| `columns[].span` | `number` or `{ xs, sm, md, lg, xl }` | Column width per breakpoint |
| `columns[].offset` | same as span | Column offset per breakpoint |
| `items[].span` | same as span | Field width inside a column |
| `items[].offset` | same as offset | Field offset inside a column |

### Field types

`text` · `email` · `password` · `number` · `textarea` · `select` · `radio` · `checkbox` · `switch` · `date` · `time`

### Validation rules

| Rule | Extra fields |
|------|----------------|
| `required` | `message?` |
| `email` | `message?` |
| `minLength` | `value: number`, `message?` |
| `maxLength` | `value: number`, `message?` |
| `min` | `value: number`, `message?` |
| `max` | `value: number`, `message?` |
| `pattern` | `value: string` (regex string), `message?` |

### Select / radio options

```ts
options: [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b", disabled: true },
]
```

---

## Panel features your users get

| Feature | How |
|---------|-----|
| Sidebar list + search | Built-in |
| Live preview | `FormBuilder` via `schemaToFormConfig` |
| Edit form name / id / mode | Form tab |
| Layout tree (rows → columns → fields) | Field tree tab |
| Field settings | Click field or right-click context menu |
| Responsive spans per screen | Field / column settings → Spacing |
| Validation editor | Field settings → Validation |
| Select options editor | Field settings → Options (select/radio) |
| Initial values editor | Initial values tab |
| Export JSON | Toolbar |
| Import JSON | Toolbar |
| Duplicate form | Toolbar |
| Dark / light mode | Toolbar toggle (defaults to light) |

---

## Context menu (field tree)

On each field in the **Field tree** tab:

- **Right-click** the field row, or click **⋯**
- Choose: Field settings · Spacing per screen · Validation rules · Options & values

---

## Optional: design system for preview

If your app uses Ant Design, MUI, etc., pass adapters so the preview matches production UI:

```tsx
<FormakitPanel
  forms={forms}
  onSave={handleSave}
  runtimeHooks={{
    designSystem: {
      components: {
        text: AntTextInput,
        email: AntTextInput,
        password: AntPasswordInput,
        select: AntSelect,
        // ...one adapter per field type you use
      },
    },
  }}
/>
```

`DesignComponentProps` contract:

```ts
interface DesignComponentProps {
  name: string;
  value: unknown;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string | null;
  description?: string;
  options?: { label: string; value: string | number | boolean }[];
  onChange: (value: unknown) => void;
  onBlur: () => void;
  props?: Record<string, unknown>;
}
```

---

## What is NOT stored in the registry (runtime only)

Keep these in `runtimeHooks` or app code — the panel does not edit them:

- `submit.onSubmit` and other submit callbacks
- `callbacks` (onValuesChange, onFieldBlur, …)
- `designSystem` / custom `components`
- `custom` field items with `render` functions
- Function-based `hidden` / `disabled` / dynamic `options`

---

## Checklist

- [ ] `npm i formakit formakit-panel`
- [ ] Create `forms/registry.ts` with all `FormDefinition[]`
- [ ] Create admin page with `<FormakitPanel forms={...} onSave={...} />`
- [ ] Import `formakit-panel/styles.css`
- [ ] Use `"use client"` in Next.js admin page
- [ ] Convert schema → runtime with `schemaToFormConfig` where forms are rendered
- [ ] Pass `runtimeHooks` for design system + submit handlers in production pages

---

## Copy-paste AI prompt (short version)

```
Integrate formakit-panel into my React/Next.js app without any REST API.

1. Install formakit and formakit-panel.
2. Create src/forms/registry.ts exporting FormDefinition[] with all my forms as JSON-serializable schemas.
3. Create /admin/forms page with "use client", import "formakit-panel/styles.css", and mount:

   <FormakitPanel
     forms={forms}
     onSave={(f) => setForms(prev => prev.map(x => x.id === f.id ? f : x))}
     onCreate={(f) => setForms(prev => [...prev, f])}
     onDelete={(id) => setForms(prev => prev.filter(x => x.id !== id))}
   />

4. Do NOT use fetch or API routes for load/save.
5. Use schemaToFormConfig(schema, runtimeHooks) + FormBuilder to render forms in the app.
6. Each FormDefinition has { id, name, description?, schema } where schema has rows/columns/fields, validation rules, initialValues, and responsive spans (xs/sm/md/lg/xl).

Use the full sample config from formakit-panel/INTEGRATION_PROMPT.md as the template.
```

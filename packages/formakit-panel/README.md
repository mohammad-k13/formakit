# formakit-panel

Admin panel for browsing, previewing, and editing FormaKit form configs.

## Features

- Sidebar list of forms with search
- Live preview using `formakit` `FormBuilder`
- Property editor for form metadata, layout, fields, validation, and initial values
- Import / export JSON
- Two persistence modes:
  - **Registry mode** — pass forms via props + `onSave` callback
  - **API mode** — built-in REST client adapter

See **[INTEGRATION_PROMPT.md](./INTEGRATION_PROMPT.md)** for a complete copy-paste integration guide with a full sample config (registry-only, no API).

## Install

```bash
npm i formakit formakit-panel
```

Import styles in your app:

```tsx
import "formakit-panel/styles.css";
```

## Server / API routes

In Next.js API routes or other server code, import validators and types from the server entry — **not** the main package (which includes React client components):

```ts
import { formDefinitionValidator, type FormDefinition } from "formakit-panel/server";
```

## Registry mode (Mode A)

Your app owns persistence. Pass a registry and save callback:

```tsx
import { FormakitPanel, type FormDefinition } from "formakit-panel";
import "formakit-panel/styles.css";

const forms: FormDefinition[] = [
  {
    id: "login",
    name: "Login",
    schema: {
      id: "login",
      rows: [
        {
          id: "row-1",
          columns: [
            {
              id: "column-1",
              span: 12,
              items: [
                {
                  kind: "field",
                  field: {
                    name: "email",
                    type: "email",
                    label: "Email",
                    validation: { rules: [{ type: "required" }] },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
];

export function FormsAdminPage() {
  return (
    <FormakitPanel
      forms={forms}
      runtimeHooks={{
        designSystem: myDesignSystem,
      }}
      onSave={async (form) => {
        await fetch(`/api/forms/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }}
    />
  );
}
```

## API mode (Mode B)

The panel loads and saves forms through a REST API:

```tsx
<FormakitPanel
  storage={{
    type: "api",
    baseUrl: "/api",
  }}
  runtimeHooks={{ designSystem: myDesignSystem }}
/>
```

### REST contract

| Method | Path | Description |
|--------|------|-------------|
| GET | `/forms` | List all forms |
| GET | `/forms/:id` | Get one form |
| POST | `/forms` | Create form |
| PUT | `/forms/:id` | Update form |
| DELETE | `/forms/:id` | Delete form |

Response body shape:

```ts
interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  schema: FormConfigSchema;
}
```

## Schema vs runtime hooks

The panel edits **JSON-serializable** `FormConfigSchema` values. Runtime-only pieces are passed separately:

```ts
interface FormRuntimeHooks {
  submit?: FormSubmitConfig;
  callbacks?: FormCallbacks;
  designSystem?: DesignSystemConfig;
  components?: Partial<FieldComponentRegistry>;
}
```

Use helpers to convert:

```ts
import { schemaToFormConfig, formConfigToSchema } from "formakit-panel";

const runtimeConfig = schemaToFormConfig(definition.schema, runtimeHooks);
const schema = formConfigToSchema(existingFormConfig);
```

## Utilities

```ts
import {
  parseFormDefinition,
  createEmptyFormDefinition,
  createStorage,
  createApiStorage,
  createRegistryStorage,
} from "formakit-panel";
```

## Monorepo demo

This repository includes demo routes:

- `/admin/forms` — registry + `onSave` to API
- `/admin/forms-api` — API-only mode

Run the web app:

```bash
bun install
bun run build
cd apps/web && bun run dev
```

## Notes

- Custom field renderers, function-based conditions, and dynamic option loaders are runtime-only and not editable in the panel UI (v1).
- Pattern validation rules are stored as strings in schema and compiled to `RegExp` at preview time.
- The panel ships its own CSS (`formakit-panel/styles.css`) with shadcn-inspired primitives.

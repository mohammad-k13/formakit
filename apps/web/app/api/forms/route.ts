import { promises as fs } from "node:fs";
import path from "node:path";
import type { FormDefinition } from "formakit-panel/server";
import { formDefinitionValidator } from "formakit-panel/server";

const dataPath = path.join(process.cwd(), "data/forms/index.json");

async function readForms(): Promise<FormDefinition[]> {
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map((item) => formDefinitionValidator.parse(item));
}

async function writeForms(forms: FormDefinition[]) {
    await fs.writeFile(dataPath, `${JSON.stringify(forms, null, 2)}\n`, "utf8");
}

export async function GET() {
    const forms = await readForms();
    return Response.json(forms);
}

export async function POST(request: Request) {
    const body = formDefinitionValidator.parse(await request.json());
    const forms = await readForms();
    if (forms.some((form) => form.id === body.id)) {
        return Response.json({ error: "Form already exists" }, { status: 409 });
    }
    forms.push(body);
    await writeForms(forms);
    return Response.json(body, { status: 201 });
}

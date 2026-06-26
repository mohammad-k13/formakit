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

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const forms = await readForms();
    const form = forms.find((item) => item.id === id);
    if (!form) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(form);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const body = formDefinitionValidator.parse(await request.json());
    if (body.id !== id) {
        return Response.json({ error: "ID mismatch" }, { status: 400 });
    }
    const forms = await readForms();
    const index = forms.findIndex((item) => item.id === id);
    if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });
    forms[index] = body;
    await writeForms(forms);
    return Response.json(body);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const forms = await readForms();
    const next = forms.filter((item) => item.id !== id);
    if (next.length === forms.length) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }
    await writeForms(next);
    return new Response(null, { status: 204 });
}

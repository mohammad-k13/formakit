import type { FormDefinition } from "../types/schema";
import type {
    ApiStorageOptions,
    FormStorageAdapter,
    RegistryStorageOptions,
    StorageOptions,
} from "../types/storage";

export function createRegistryStorage(options: RegistryStorageOptions): FormStorageAdapter {
    let forms = [...options.forms];

    return {
        async list() {
            return [...forms];
        },
        async get(id) {
            const form = forms.find((item) => item.id === id);
            if (!form) throw new Error(`Form not found: ${id}`);
            return structuredClone(form);
        },
        async save(definition) {
            const index = forms.findIndex((item) => item.id === definition.id);
            if (index === -1) {
                forms.push(structuredClone(definition));
            } else {
                forms[index] = structuredClone(definition);
            }
            await options.onSave?.(definition);
        },
        async create(definition) {
            if (forms.some((item) => item.id === definition.id)) {
                throw new Error(`Form already exists: ${definition.id}`);
            }
            forms.push(structuredClone(definition));
            await options.onCreate?.(definition);
        },
        async delete(id) {
            forms = forms.filter((item) => item.id !== id);
            await options.onDelete?.(id);
        },
    };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

export function createApiStorage(options: ApiStorageOptions): FormStorageAdapter {
    const baseUrl = options.baseUrl.replace(/\/$/, "");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    return {
        async list() {
            return request<FormDefinition[]>(`${baseUrl}/forms`, { headers });
        },
        async get(id) {
            return request<FormDefinition>(`${baseUrl}/forms/${id}`, { headers });
        },
        async save(definition) {
            await request(`${baseUrl}/forms/${definition.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(definition),
            });
        },
        async create(definition) {
            await request(`${baseUrl}/forms`, {
                method: "POST",
                headers,
                body: JSON.stringify(definition),
            });
        },
        async delete(id) {
            await request(`${baseUrl}/forms/${id}`, {
                method: "DELETE",
                headers,
            });
        },
    };
}

export function createStorage(options: StorageOptions): FormStorageAdapter {
    if (options.type === "api") return createApiStorage(options);
    return createRegistryStorage(options);
}

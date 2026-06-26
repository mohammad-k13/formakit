import type { FormDefinition } from "./schema";

export interface FormStorageAdapter {
    list(): Promise<FormDefinition[]>;
    get(id: string): Promise<FormDefinition>;
    save(definition: FormDefinition): Promise<void>;
    create(definition: FormDefinition): Promise<void>;
    delete?(id: string): Promise<void>;
}

export interface RegistryStorageOptions {
    type: "registry";
    forms: FormDefinition[];
    onSave?: (definition: FormDefinition) => void | Promise<void>;
    onCreate?: (definition: FormDefinition) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
}

export interface ApiStorageOptions {
    type: "api";
    baseUrl: string;
    headers?: Record<string, string>;
}

export type StorageOptions = RegistryStorageOptions | ApiStorageOptions;

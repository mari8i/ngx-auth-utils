export type storageValue = string | null; 

export abstract class StorageProvider {
    public abstract store(key: string, value: unknown): storageValue;

    public abstract retrieve(key: string): storageValue;

    public abstract clear(key: string): void;
}

export class MemoryStorageProvider extends StorageProvider {
    private values: Map<string, storageValue> = new Map<string, storageValue>();

    constructor() {
        super();
    }

    clear(key: string): void {
        this.values.delete(key);
    }

    retrieve(key: string): storageValue {
        return this.values.get(key) as storageValue;
    }

    store(key: string, value: storageValue): storageValue {
        this.values.set(key, value);
        return value;
    }
}

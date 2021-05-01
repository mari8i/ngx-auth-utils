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

export class LocalStorageProvider extends StorageProvider {
    constructor() {
        super();
    }

    clear(key: string): void {
        localStorage.removeItem(key);
    }

    retrieve(key: string): storageValue {
        return localStorage.getItem(key);
    }

    store(key: string, value: storageValue): storageValue {
        if (value != null) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }

        return value;
    }
}

export class SessionStorageProvider extends StorageProvider {
    constructor() {
        super();
    }

    clear(key: string): void {
        sessionStorage.removeItem(key);
    }

    retrieve(key: string): storageValue {
        return sessionStorage.getItem(key);
    }

    store(key: string, value: storageValue): storageValue {
        if (value != null) {
            sessionStorage.setItem(key, value);
        } else {
            sessionStorage.removeItem(key);
        }

        return value;
    }
}

export const STORAGE_TIMESTAMP_FIELD = 'ngx-auth-utils-storage-timestamp';

export class DynamicStorageProvider extends StorageProvider {
    private currentStorage?: StorageProvider;
    private type?: string;

    constructor() {
        super();
        this.initializeOnPreviousStorage();
    }

    public getType(): string | undefined {
        return this.type;
    }

    public setType(type: 'local' | 'session' | 'memory'): void {
        this.type = type;
        const prevStorage = this.currentStorage;

        if (type === 'local') {
            this.currentStorage = new LocalStorageProvider();
        } else if (type === 'session') {
            this.currentStorage = new SessionStorageProvider();
        } else if (type === 'memory') {
            this.currentStorage = new MemoryStorageProvider();
        } else {
            throw new Error('Invalid storage');
        }

        prevStorage?.clear(STORAGE_TIMESTAMP_FIELD);
        this.currentStorage.store(STORAGE_TIMESTAMP_FIELD, new Date().toISOString());
    }

    private initializeOnPreviousStorage(): void {
        if (this.currentStorage != null) {
            return;
        }

        const localTimestamp = this.parseStorageTimestamp(localStorage.getItem(STORAGE_TIMESTAMP_FIELD));
        const sessionTimestamp = this.parseStorageTimestamp(sessionStorage.getItem(STORAGE_TIMESTAMP_FIELD));

        if (localTimestamp != null && sessionTimestamp != null) {
            if (localTimestamp > sessionTimestamp) {
                this.setType('local');
            } else {
                this.setType('session');
            }
        } else if (localTimestamp != null) {
            this.setType('local');
        } else if (sessionTimestamp != null) {
            this.setType('session');
        }
    }

    private parseStorageTimestamp(value: string | null): Date | null {
        if (value == null) {
            return null;
        }

        return new Date(value);
    }

    private getStorage(): StorageProvider {
        if (this.currentStorage == null) {
            throw new Error('Storage not initialized');
        }
        return this.currentStorage;
    }

    clear(key: string): void {
        this.getStorage().clear(key);
    }

    retrieve(key: string): storageValue {
        return this.currentStorage != null ? this.currentStorage.retrieve(key) : null;
    }

    store(key: string, value: storageValue): storageValue {
        return this.getStorage().store(key, value);
    }
}

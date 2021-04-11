export abstract class StorageProvider {
  public abstract store(key: string, value: unknown): any;

  public abstract retrieve(key: string): any;

  public abstract clear(key: string): void;
}

export class MemoryStorageProvider extends StorageProvider {

  private values: Map<string, any> = new Map<string, any>();

  constructor() {
    super();
  }

  clear(key: string): void {
    this.values.delete(key);
  }

  retrieve(key: string): any {
    return this.values.get(key);
  }

  store(key: string, value: unknown): any {
    return this.values.set(key, value);
  }
}

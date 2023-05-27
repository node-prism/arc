import { AdapterConstructorOptions, StorageAdapter } from ".";

export default class LocalStorageAdapter<T> implements StorageAdapter<T> {
  storageKey: string;

  constructor({ storagePath }: AdapterConstructorOptions<T>) {
    this.storageKey = `arc_${storagePath}`;
  }

  read(): { [key: string]: T } {
    try {
      return Object.assign(
        {},
        JSON.parse(
          localStorage.getItem(`arc_${this.storageKey}`) || "{}"
        )
      );
    } catch (e) {
      console.error(`arc: failed to read from key: ${this.storageKey}: ${e}`);
      return {};
    }
  }

  write(data: { [key: string]: T }) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}

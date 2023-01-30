import { StorageAdapter } from ".";

export default class LocalStorageAdapter<T> implements StorageAdapter<T> {
  storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = `arc_${storageKey}`;
  }

  read(): { [key: string]: T } {
    try {
      let data = Object.assign(
        {},
        JSON.parse(
          localStorage.getItem(`arc_${this.storageKey}`) || "{}"
        )
      );
      return data;
    } catch (e) {
      console.error(`arc: failed to read from key: ${this.storageKey}: ${e}`);
      return {};
    }
  }

  write(data: { [key: string]: T }) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}

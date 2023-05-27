export interface AdapterConstructor<T> {
  new ({ storagePath, name, key }: AdapterConstructorOptions<T>): StorageAdapter<T>;
}

export type AdapterConstructorOptions<T> = {
  storagePath: string;
  name?: string;
  key?: string;
}

export interface StorageAdapter<T> {
  read: () => { [key: string]: T };
  write: (data: { [key: string]: T }) => any;
}

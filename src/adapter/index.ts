export interface StorageAdapter<T> {
  read: () => { [key: string]: T };
  write: (data: { [key: string]: T }) => any;
}


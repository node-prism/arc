export { CollectionOptions, QueryOptions, Collection } from "./collection";
export { ShardOptions, ShardedCollection } from "./sharded_collection";
export { AdapterConstructor, AdapterConstructorOptions, StorageAdapter } from "./adapter";
export { default as FSAdapter } from "./adapter/fs";
export { default as EncryptedFSAdapter } from "./adapter/enc_fs";
export { default as LocalStorageAdapter } from "./adapter/localStorage";

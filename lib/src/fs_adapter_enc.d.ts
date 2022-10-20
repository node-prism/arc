import { StorageAdapter } from ".";
import { SimpleFIFO } from "./fs_adapter";
export default class EncryptedFilesystemAdapter<T> implements StorageAdapter<T> {
    storagePath: string;
    name: string;
    filePath: string;
    queue: SimpleFIFO;
    constructor(storagePath: string, name: string);
    prepareStorage(): void;
    read(): {
        [key: string]: T;
    };
    write(data: {
        [key: string]: T;
    }): void;
}

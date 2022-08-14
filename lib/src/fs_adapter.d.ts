import { StorageAdapter } from ".";
declare class SimpleFIFO {
    elements: any[];
    push(...args: any[]): void;
    shift(): any;
    length(): number;
}
export default class FilesystemAdapter<T> implements StorageAdapter<T> {
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
export {};

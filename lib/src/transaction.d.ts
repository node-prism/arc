import { Collection, QueryOptions } from ".";
export declare class Transaction<T> {
    collection: Collection<T>;
    inserted: T[];
    removed: T[];
    updated: {
        documents: T[];
        operations: object;
        options: QueryOptions;
    }[];
    constructor(collection: Collection<T>);
    insert(documents: T[] | T): T[];
    update(query: object, operations: object, options?: QueryOptions): T[];
    remove(query: object, options?: QueryOptions): T[];
    rollback(): void;
    commit(): void;
}

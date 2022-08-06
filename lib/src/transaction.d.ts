import { Collection, QueryOptions } from ".";
declare enum OpType {
    INSERT = "insert",
    UPDATE = "update",
    REMOVE = "remove"
}
interface UpdateOperation<T> {
    documents: T[];
    operations: object;
    options: QueryOptions;
}
export declare class Transaction<T> {
    collection: Collection<T>;
    inserted: T[][];
    removed: T[][];
    updated: UpdateOperation<T>[];
    operations: OpType[];
    constructor(collection: Collection<T>);
    insert(documents: T[] | T): T[];
    update(query: object, operations: object, options?: QueryOptions): T[];
    remove(query: object, options?: QueryOptions): T[];
    rollback(): void;
    /**
     * Finalizes the transaction.
     */
    commit(): void;
}
export {};

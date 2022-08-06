import { Transaction } from "./transaction";
export interface StorageAdapter<T> {
    read: () => Promise<{
        [key: string]: T;
    }>;
    write: (data: {
        [key: string]: T;
    }) => any;
}
export declare type CollectionOptions<T> = Partial<{
    /** When true, automatically syncs to disk when a change is made to the database. */
    autosync: boolean;
    /** When true, automatically adds timestamps to all records. */
    timestamps: boolean;
    /** When true, document ids are integers that increment from 0. */
    integerIds: boolean;
    /** The storage adapter to use. By default, uses a filesystem adapter. */
    adapter: StorageAdapter<T>;
}>;
export declare type QueryOptions = Partial<{
    /** When true, attempts to deeply match the query against documents. */
    deep: boolean;
    /** Specifies the key to return by. */
    returnKey: string;
    /** When true, returns cloned data (not a reference). default true */
    clonedData: boolean;
    /**
     * -1 || 0: descending
     *  1: ascending
     */
    sort: {
        [property: string]: -1 | 0 | 1;
    };
    /**
     * Particularly useful when sorting, `skip` defines the number of documents
     * to ignore from the beginning of the result set.
     */
    skip: number;
    /** Determines the number of documents returned. */
    take: number;
    /**
     * 1: property included in result document
     * 0: property excluded from result document
     */
    project: {
        [property: string]: 1 | 0;
    };
    join: Array<{
        /** The collection to join on. */
        collection: Collection<any>;
        /** The property containing the foreign key(s). */
        from: string;
        /** The property on the joining collection that the foreign key should point to. */
        to: string;
        /** The name of the property to be created while will contain the joined documents. */
        as: string;
        /** QueryOptions that will be applied to the joined collection. */
        options?: QueryOptions;
    }>;
}>;
export declare function defaultQueryOptions(): QueryOptions;
export declare let ID_KEY: string;
export declare let CREATED_AT_KEY: string;
export declare let UPDATED_AT_KEY: string;
export declare type PrivateData = {
    next_id: number;
    id_map: {
        [id: string]: string;
    };
};
export declare type CollectionData = {
    [key: string]: any;
    __private?: PrivateData;
};
export declare class Collection<T> {
    storagePath: string;
    name: string;
    options: CollectionOptions<T>;
    data: CollectionData;
    _transaction: Transaction<T>;
    constructor(storagePath?: string, name?: string, options?: CollectionOptions<T>);
    initializeData(): Promise<void>;
    /**
     * Given objects found by a query, assign `document` directly to these objects.
     * Does not add timestamps or anything else.
     * Used by transaction update rollback.
     */
    assign(id: unknown, document: T): T;
    find(query?: object, options?: QueryOptions): T[];
    update(query: object, operations: object, options?: QueryOptions): T[];
    upsert(query: object, operations: object, options?: QueryOptions): T[];
    remove(query: object, options?: QueryOptions): T[];
    insert(documents: T[] | T): T[];
    merge(id: string, item: T): void;
    sync(): any;
    drop(): void;
    getId(): string;
    nextIntegerId(): number;
    /**
     * Starts a new transaction.
     *
     * @throws {Error} If a transaction is already in progress.
     */
    transaction(): Transaction<T>;
}

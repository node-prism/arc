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
declare class Transaction<T> {
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

interface StorageAdapter<T> {
    read: () => {
        [key: string]: T;
    };
    write: (data: {
        [key: string]: T;
    }) => any;
}
declare type CollectionOptions<T> = Partial<{
    /** When true, automatically syncs to disk when a change is made to the database. */
    autosync: boolean;
    /** When true, automatically adds timestamps to all records. */
    timestamps: boolean;
    /** When true, document ids are integers that increment from 0. */
    integerIds: boolean;
    /** The storage adapter to use. By default, uses a filesystem adapter. */
    adapter: StorageAdapter<T>;
}>;
declare type QueryOptions = Partial<{
    /** When true, attempts to deeply match the query against documents. */
    deep: boolean;
    /** Specifies the key to return by. */
    returnKey: string;
    /** When true, returns cloned data (not a reference). default true */
    clonedData: boolean;
    /** Provide fallback values for null or undefined properties */
    ifNull: Record<string, any>;
    /** Provide fallback values for 'empty' properties ([], {}, "") */
    ifEmpty: Record<string, any>;
    /** Provide fallback values for null, undefined, or 'empty' properties. */
    ifNullOrEmpty: Record<string, any>;
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
        [property: string]: 0 | 1;
    };
    aggregate: {
        [property: string]: Record<"$floor", string> | Record<"$ceil", string> | Record<"$sub", (string | number)[]> | Record<"$mult", (string | number)[]> | Record<"$div", (string | number)[]> | Record<"$add", (string | number)[]> | Record<"$fn", (document: any) => unknown>;
    };
    join: Array<{
        /** The collection to join on. */
        collection: Collection<any>;
        /** The property containing the foreign key(s). */
        from: string;
        /** The property on the joining collection that the foreign key should point to. */
        on: string;
        /** The name of the property to be created while will contain the joined documents. */
        as: string;
        /** QueryOptions that will be applied to the joined collection. */
        options?: QueryOptions;
    }>;
}>;
declare function defaultQueryOptions(): QueryOptions;
declare let ID_KEY: string;
declare let CREATED_AT_KEY: string;
declare let UPDATED_AT_KEY: string;
declare type PrivateData = {
    next_id: number;
    id_map: {
        [id: string]: string;
    };
};
declare type CollectionData = {
    [key: string]: any;
    __private?: PrivateData;
};
declare class Collection<T> {
    storagePath: string;
    name: string;
    options: CollectionOptions<T>;
    data: CollectionData;
    _transaction: Transaction<T>;
    constructor(storagePath?: string, name?: string, options?: CollectionOptions<T>);
    initializeData(): void;
    /**
     * Given objects found by a query, assign `document` directly to these objects.
     * Does not add timestamps or anything else.
     * Used by transaction update rollback.
     */
    assign(id: unknown, document: T): T;
    filter(fn: (document: T) => boolean): T[];
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
    transaction(fn: (transaction: Transaction<T>) => void): void;
}

export { CREATED_AT_KEY, Collection, CollectionData, CollectionOptions, ID_KEY, PrivateData, QueryOptions, StorageAdapter, UPDATED_AT_KEY, defaultQueryOptions };

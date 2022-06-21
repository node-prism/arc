import { CollectionOptions, CollectionData, QueryOptions } from ".";
export declare function applyQueryOptions(data: any, options: QueryOptions): any;
export declare const makeDistinctByKey: (arr: any[], key: string) => any[];
export default function find<T>(data: CollectionData, query: any, options: QueryOptions, collectionOptions: CollectionOptions<T>): T[];

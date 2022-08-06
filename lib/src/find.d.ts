import { CollectionData, CollectionOptions, QueryOptions } from ".";
export default function find<T>(data: CollectionData, query: any, options: QueryOptions, collectionOptions: CollectionOptions<T>): T[];

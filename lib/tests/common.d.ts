import { Collection } from "../src";
export declare function testCollection<T>({ name, integerIds }?: {
    name?: string;
    integerIds?: boolean;
}): Collection<T>;
export declare function testCollectionEncrypted<T>({ name, integerIds }?: {
    name?: string;
    integerIds?: boolean;
}): Collection<T>;
export declare function nrml<T>(results: T[], { keepIds }?: {
    keepIds?: boolean;
}): T[];

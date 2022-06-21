import { Collection } from "../src";
export declare function testCollection<T>({ integerIds }?: {
    integerIds?: boolean;
}): Collection<T>;
export declare function nrml<T>(results: T[], { keepIds }?: {
    keepIds?: boolean;
}): T[];

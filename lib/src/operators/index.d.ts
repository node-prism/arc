import { Collection } from "..";
import { $gt } from "./boolean/gt";
import { $gte } from "./boolean/gte";
import { $lt } from "./boolean/lt";
import { $lte } from "./boolean/lte";
import { $and } from "./boolean/and";
import { $includes } from "./boolean/includes";
import { $in } from "./boolean/in";
export declare const booleanOperators: {
    $gt: typeof $gt;
    $gte: typeof $gte;
    $lt: typeof $lt;
    $lte: typeof $lte;
    $and: typeof $and;
    $includes: typeof $includes;
    $in: typeof $in;
};
export declare function processMutationOperators<T>(source: T[], ops: object, query: object, collection: Collection<T>): T[];

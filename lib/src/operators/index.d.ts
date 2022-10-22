import { Collection } from "..";
import { $gt } from "./boolean/gt";
import { $gte } from "./boolean/gte";
import { $lt } from "./boolean/lt";
import { $lte } from "./boolean/lte";
import { $and } from "./boolean/and";
import { $or } from "./boolean/or";
import { $xor } from "./boolean/xor";
import { $fn } from "./boolean/fn";
import { $re } from "./boolean/re";
import { $includes } from "./boolean/includes";
import { $oneOf } from "./boolean/oneOf";
import { $length } from "./boolean/length";
import { $not } from "./boolean/not";
import { $has } from "./boolean/has";
import { $hasAny } from "./boolean/hasAny";
export declare const booleanOperators: {
    $gt: typeof $gt;
    $gte: typeof $gte;
    $lt: typeof $lt;
    $lte: typeof $lte;
    $and: typeof $and;
    $or: typeof $or;
    $xor: typeof $xor;
    $includes: typeof $includes;
    $oneOf: typeof $oneOf;
    $fn: typeof $fn;
    $re: typeof $re;
    $length: typeof $length;
    $not: typeof $not;
    $has: typeof $has;
    $hasAny: typeof $hasAny;
};
export declare function processMutationOperators<T>(source: T[], ops: object, query: object, collection: Collection<T>): T[];

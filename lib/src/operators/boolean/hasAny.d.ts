/**
 * @example
 * { $hasAny: "a" } <-- source has property "a"
 * { $hasAny: ["a", "b"] } <-- source has properties "a" OR "b"
 *
 * @related
 * $hasAny
 * $not (e.g. { $not: { $has: "a" } })
 */
export declare function $hasAny(source: object, query: object): boolean;

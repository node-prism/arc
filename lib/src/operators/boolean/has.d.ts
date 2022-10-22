/**
 * @example
 * { $has: "a" } <-- source has property "a"
 * { $has: ["a", "b"] } <-- source has properties "a" AND "b"
 *
 * @related
 * $hasAny
 * $not (e.g. { $not: { $has: "a" } })
 */
export declare function $has(source: object, query: object): boolean;

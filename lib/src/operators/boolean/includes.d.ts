/**
 * $includes does a simple .includes().
 *
 * @example
 * { "foo": "bar" }, { "foo": "baz" }
 * find({ "foo": { $includes: "ba" } })
 *
 * { "nums": [1, 2, 3] }, { "nums": [4, 5, 6] }
 * find({ "nums": { $includes: 2 } })
 * find({ "nums": { $includes: [1, 2, 3] } })
 */
export declare function $includes(source: object, query: object): boolean;

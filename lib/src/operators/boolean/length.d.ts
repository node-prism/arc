/**
 * $length asserts the length of an array or string.
 *
 * @example
 * { "foo": [0, 0] }, { "foo": [0, 0, 0] }, { "foo": "abc" }
 * find({ "foo": { $length: 3 } })
 */
export declare function $length(source: object, query: object): boolean;

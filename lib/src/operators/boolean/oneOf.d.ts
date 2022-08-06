/**
 * @example
 * { name: "Jean-Luc", friends: [1, 3, 4] }
 * users.find({ _id: { $oneOf: [1, 3, 4]  } })
 */
export declare function $oneOf(source: object, query: object): boolean;

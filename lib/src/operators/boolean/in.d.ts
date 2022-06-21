/**
 * @example
 * { name: "Jean-Luc", friends: [1, 3, 4] }
 * users.find({ _id: { $in: [1, 3, 4]  } })
 */
export declare function $in(source: object, query: object): boolean;

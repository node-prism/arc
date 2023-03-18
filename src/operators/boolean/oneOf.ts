import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

/**
 * @example
 * { name: "Jean-Luc", friends: [1, 3, 4] }
 * users.find({ _id: { $oneOf: [1, 3, 4]  } })
 * { a: b: { c: 1 } }
 * find({ "a.b.c": { $oneOf: [1, 2] } })
 */
export function $oneOf(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (query[k]["$oneOf"] === undefined) { return; }
      const values = ensureArray(query[k]["$oneOf"]);
      const value = dot.get(source, k);
      matches.push(values.includes(value));
    });
  }

  if (!matches.length) return false;
  if (matches.includes(false)) return false;
  return true;
}

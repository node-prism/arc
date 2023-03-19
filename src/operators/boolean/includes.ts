import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

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
 *
 * find({ "a.b.c": { $includes: 1 } })
 */
export function $includes(source: object, query: object): boolean {
  const matches = Object.entries(query)
    .flatMap(([key, value]) => {
      const includes = ensureArray(value.$includes);
      return includes.map((v) => dot.get(source, key)?.includes(v));
    })
    .filter((match) => match !== undefined);

  return matches.length > 0 && matches.every(Boolean);
}

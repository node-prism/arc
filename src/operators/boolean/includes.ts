import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";

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
export function $includes(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      let qry = query[k]["$includes"];
      qry = ensureArray(qry);

      if (safeHasOwnProperty(source, k)) {
        qry.forEach((q: any) => {
          matches.push(source[k].includes(q));
        });
      }
    });
  }

  if (!matches.length) return false;
  if (matches.length && matches.includes(false)) return false;
  return true;
}

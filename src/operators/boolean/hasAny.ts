import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";

/**
 * @example
 * { $hasAny: "a" } <-- source has property "a"
 * { $hasAny: ["a", "b"] } <-- source has properties "a" OR "b"
 * 
 * @related
 * $hasAny
 * $not (e.g. { $not: { $has: "a" } })
 */
export function $hasAny(source: object, query: object): boolean {
  let match = false;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (k !== "$hasAny") return;

      let qry = query[k];
      qry = ensureArray(qry);

      match = qry.some((q: any) => {
        return safeHasOwnProperty(source, q);
      });
    });
  }

  return match;
}

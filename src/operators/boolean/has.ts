import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";

/**
 * @example
 * { $has: "a" } <-- source has property "a"
 * { $has: ["a", "b"] } <-- source has properties "a" AND "b"
 * 
 * @related
 * $hasAny
 * $not (e.g. { $not: { $has: "a" } })
 */
export function $has(source: object, query: object): boolean {
  let match = false;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (k !== "$has") return;

      let qry = query[k];
      qry = ensureArray(qry);

      match = qry.every((q: any) => {
        return safeHasOwnProperty(source, q);
      });
    });
  }

  return match;
}

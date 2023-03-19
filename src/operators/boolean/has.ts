import { ensureArray, isObject, Ok } from "../../utils";
import dot from "dot-wild";

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
        return dot.get(source, q) !== undefined;
      });
    });
  }

  return match;
}

// export function $has(source: object, query: object): boolean {
//   // @ts-ignore
//   const queryValues = ensureArray(query.$has);
//   return queryValues.every((q: any) => dot.get(source, q) !== undefined);
// }
// export function $has(source: object, query: object): boolean {
//   // @ts-ignore
//   const queryValues = ensureArray(query.$has);
//   return queryValues.every((q: any) => dot.get(source, q) !== undefined) &&
//          Object.keys(source).some((key: string) => queryValues.includes(key));
// }

// export function $has(source: object, query: object): boolean {
//   // @ts-ignore
//   const queryValues = ensureArray(query.$has);
//   const sourceKeys = Object.keys(source);
  
//   return queryValues.every((q: any) => sourceKeys.includes(q)) &&
//          sourceKeys.every((key: string) => queryValues.includes(key) || dot.get(source, key) !== undefined);
// }

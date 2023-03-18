import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

/**
 * @example
 * { $hasAny: "a" } <-- source has property "a"
 * { $hasAny: ["a", "b"] } <-- source has properties "a" OR "b"
 * 
 * @related
 * $has
 * $not
 *   { $not: { $hasAny: "a" } })
 *   { $not: { "a.b.c.d": { $hasAny: "e" } } }
 */
// export function $hasAny(source: object, query: object): boolean {
//   let match = false;

//   if (isObject(query)) {
//     Ok(query).forEach((k) => {
//       if (k !== "$hasAny") return;

//       let qry = query[k];
//       qry = ensureArray(qry);

//       match = qry.some((q: any) => {
//         return dot.get(source, q);
//       });
//     });
//   }

//   return match;
// }

export function $hasAny(source: object, query: object): boolean {
  // @ts-ignore
  const queryValues = ensureArray(query.$hasAny);
  return queryValues.some((q: any) => dot.get(source, q));
}

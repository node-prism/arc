import dot from "dot-wild";
import { ID_KEY } from "../../collection";
import { checkAgainstQuery, returnFound } from "../../return_found";
import { ensureArray, isObject, Ok } from "../../utils";

// export function $or(source: object, query: object): boolean {
//   const matches = [];

//   if (isObject(query)) {
//     Ok(query).forEach((pk) => {
//       if (pk !== "$or") return;

//       let ors = query[pk];
//       ors = ensureArray(ors);
//       ors.forEach((or: object) => {
//         Ok(or).forEach((orKey) => {
//           // case: { num: (n) => n%2===0 }

//           const orKeyValue = dot.get(or, orKey);
//           const sourceOrKeyValue = dot.get(source, orKey);

//           if (
//             typeof orKeyValue === "function" &&
//             sourceOrKeyValue !== undefined
//           ) {
//             matches.push(orKeyValue(sourceOrKeyValue));
//           } else {
//             const match = returnFound(source, or, { deep: true, returnKey: ID_KEY, clonedData: true }, source)
//             matches.push(Boolean(match && match.length));
//           }
//         });
//       });
//     });
//   }

//   if (!matches.length) return false;
//   if (matches.length && matches.includes(true)) return true;
//   return false;
// }

// export function $or(source: object, query: object): boolean {
//   const ors = Ok(query).find((pk) => pk === "$or")?.["$or"] || [];
//   return ors.some((or: object) => {
//     return Ok(or).every((orKey) => {
//       const orKeyValue = dot.get(or, orKey);
//       const sourceOrKeyValue = dot.get(source, orKey);

//       if (typeof orKeyValue === "function" && sourceOrKeyValue !== undefined) {
//         return orKeyValue(sourceOrKeyValue);
//       } else {
//         const match = returnFound(source, or, { deep: true, returnKey: ID_KEY, clonedData: true }, source);
//         return Boolean(match && match.length);
//       }
//     });
//   });
// }

export function $or(source: object, query: object): boolean {
  if (!isObject(query)) return false;
  // @ts-ignore
  if (!query.$or) return false;
  
  // @ts-ignore
  const ors = ensureArray(query.$or);
  for (const or of ors) {
    const matches = [];
    for (const [orKey, orValue] of Object.entries(or)) {
      const sourceOrValue = dot.get(source, orKey);
      if (typeof orValue === "function" && sourceOrValue !== undefined) {
        matches.push(orValue(sourceOrValue));
      } else {
        const match = returnFound(source, or, { deep: true, returnKey: ID_KEY, clonedData: true }, source);
        matches.push(Boolean(match && match.length));
      }
    }
    if (matches.length && matches.includes(true)) return true;
  }
  
  return false;
}
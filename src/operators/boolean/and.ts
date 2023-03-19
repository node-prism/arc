import dot from "dot-wild";
import { ID_KEY } from "../../collection";
import { checkAgainstQuery, returnFound } from "../../return_found";
import { ensureArray, isObject, Ok } from "../../utils";

// export function $and(source: object, query: object): boolean {
//   const matches = [];

//   if (isObject(query)) {
//     Ok(query).forEach((pk) => {
//       if (pk !== "$and") return;

//       let ands = query[pk];
//       ands = ensureArray(ands);
//       ands.forEach((and: object) => {
//         Ok(and).forEach((_andKey) => {
//           // case: { num: (n) => n%2===0 }

//           const andKeyValue = dot.get(and, _andKey);
//           const sourceAndKeyValue = dot.get(source, _andKey);

//           if (
//             typeof andKeyValue === "function" &&
//             sourceAndKeyValue !== undefined
//           ) {
//             matches.push(andKeyValue(sourceAndKeyValue));
//           } else {
//             const match = returnFound(source, and, { deep: true, returnKey: ID_KEY, clonedData: true }, source)
//             matches.push(Boolean(match && match.length));
//           }
//         });
//       });
//     });
//   }

//   if (!matches.length) return false;
//   if (matches.length && matches.includes(false)) return false;
//   return true;
// }

export function $and(source: object, query: object): boolean {
  if (!isObject(query)) {
    return true;
  }

  // @ts-ignore
  const ands = ensureArray(query.$and);
  if (!ands) {
    return true;
  }

  return ands.every((and) => {
    return Object.keys(and).every((key) => {
      const value = and[key];
      const sourceValue = dot.get(source, key);

      if (typeof value === "function") {
        return value(sourceValue);
      } else {
        const match = returnFound(source, { [key]: value }, { deep: true, returnKey: ID_KEY, clonedData: true }, source);
        return Boolean(match && match.length);
      }
    });
  });
}

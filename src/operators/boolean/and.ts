import { checkAgainstQuery } from "../../return_found";
import { ensureArray, isObject, Ok } from "../../utils";

export function $and(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((pk) => {
      if (pk === "$and") {
        let ands = query[pk];
        ands = ensureArray(ands);
        ands.forEach((and: object) => {
          Ok(and).forEach((_andKey) => {
            // case: { num: (n) => n%2===0 }
            if (
              typeof and[_andKey] === "function" &&
              source[_andKey] !== undefined
            ) {
              matches.push(and[_andKey](source[_andKey]));
            } else {
              matches.push(checkAgainstQuery(source, and));
            }
          });
        });
      }
    });
  }

  if (!matches.length) return false;
  if (matches.length && matches.includes(false)) return false;
  return true;
}

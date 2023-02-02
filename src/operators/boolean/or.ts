import dot from "dot-wild";
import { checkAgainstQuery } from "../../return_found";
import { ensureArray, isObject, Ok } from "../../utils";

export function $or(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((pk) => {
      if (pk !== "$or") return;

      let ors = query[pk];
      ors = ensureArray(ors);
      ors.forEach((or: object) => {
        Ok(or).forEach((orKey) => {
          // case: { num: (n) => n%2===0 }

          const orKeyValue = dot.get(or, orKey);
          const sourceOrKeyValue = dot.get(source, orKey);

          if (
            typeof orKeyValue === "function" &&
            sourceOrKeyValue !== undefined
          ) {
            matches.push(orKeyValue(sourceOrKeyValue));
          } else {
            matches.push(checkAgainstQuery(source, or));
          }
        });
      });
    });
  }

  if (!matches.length) return false;
  if (matches.length && matches.includes(true)) return true;
  return false;
}

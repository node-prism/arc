import dot from "dot-wild";
import { checkAgainstQuery } from "../../return_found";
import { ensureArray, isObject, Ok } from "../../utils";

export function $xor(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((pk) => {
      if (pk !== "$xor") return;

      let ors = query[pk];
      ors = ensureArray(ors);

      if (ors.length !== 2) {
        throw new Error(
          `invalid $xor query. expected exactly two values, found ${ors.length}.`
        );
      }

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

  if (matches.length === 2) {
    // return true if exactly one of the matches is true
    return matches.filter((m) => m).length === 1;
  }

  return false;
}

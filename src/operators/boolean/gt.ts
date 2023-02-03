import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

export function $gt(source: object, query: object): boolean {
  let match = false;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      let qry = query[k]["$gt"];
      qry = ensureArray(qry);

      const targetValue = dot.get(source, k);

      if (targetValue !== undefined) {
        qry.forEach((q: any) => {
          if (typeof targetValue === "string" || typeof targetValue === "number") {
            if (targetValue > q) {
              match = true;
            }
          } else if (Array.isArray(targetValue)) {
            if (targetValue.length > q) {
              match = true;
            }
          }
        });
      }
    });
  }

  return match;
}

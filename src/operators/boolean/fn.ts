import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

export function $fn(source: object, query: object): boolean {
  let match = undefined;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (isObject(query[k])) {
        const targetValue = dot.get(source, k);
        if (targetValue === undefined) return;

        Ok(query[k]).forEach((j) => {
          if (j === "$fn") {
            match = true;
            ensureArray(query[k][j]).forEach((fn) => {
              if (!fn(targetValue)) match = false;
            });
          }
        });
      }
    });
  }

  if (match !== undefined) return match;

  return false;
}

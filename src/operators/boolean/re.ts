import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

export function $re(source: object, query: object): boolean {
  let match = undefined;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (isObject(query[k])) {

        const targetValue = dot.get(source, k);

        if (targetValue === undefined) return;
        Ok(query[k]).forEach((j) => {
          if (j === "$re") {
            match = true;
            ensureArray(query[k][j]).forEach((re: RegExp) => {
              if (!re.test(targetValue)) match = false;
            });
          }
        });
      }
    });
  }

  if (match !== undefined) return match;
  return false;
}

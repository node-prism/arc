import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

export function $re(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (isObject(query[k])) {
        const targetValue = dot.get(source, k);
        if (targetValue !== undefined) {
          Ok(query[k]).forEach((j) => {
            if (j === "$re") {
              matches.push(
                ensureArray(query[k][j]).every((re: RegExp) =>
                  re.test(targetValue)
                )
              );
            }
          });
        }
      }
    });
  }

  if (!matches.length) return false;
  if (matches.length && matches.includes(true)) return true;
  return false;
}

import dot from "dot-wild";
import { ensureArray, isObject, Ok } from "../../utils";

export function $re(source: object, query: object): boolean {
  if (!isObject(query)) return false;

  return Ok(query).some(k => {
    const targetValue = dot.get(source, k);
    if (isObject(query[k]) && targetValue !== undefined && query[k].$re) {
      return ensureArray(query[k].$re).every((re: RegExp) => re.test(targetValue));
    }
    return false;
  });
}

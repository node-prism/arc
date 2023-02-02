import dot from "dot-wild";
import { isObject, Ok } from "../../utils";

/**
 * $length asserts the length of an array or string.
 *
 * @example
 * { "foo": [0, 0] }, { "foo": [0, 0, 0] }, { "foo": "abc" }
 * find({ "foo": { $length: 3 } })
 */
export function $length(source: object, query: object): boolean {
  let matched = false;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      const qry = query[k]["$length"];
      const targetValue = dot.get(source, k);

      if (targetValue !== undefined) {
        if (Array.isArray(targetValue) || typeof targetValue === "string") {
          if (targetValue.length === qry) {
            matched = true;
          }
        }
      }
    });
  }

  return matched;
}

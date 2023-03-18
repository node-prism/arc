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
  if (!isObject(query)) {
    return false;
  }

  return Object.entries(query).some(([k, qry]) => {
    const targetValue = dot.get(source, k);

    return (
      targetValue !== undefined &&
      (Array.isArray(targetValue) || typeof targetValue === "string") &&
      targetValue.length === qry.$length
    );
  });
}

import { isObject, Ok, safeHasOwnProperty } from "../../utils";
/**
 * $length asserts the length of an array or string.
 *
 * @example
 * { "foo": [0, 0] }, { "foo": [0, 0, 0] }, { "foo": "abc" }
 * find({ "foo": { $length: 3 } })
 */
export function $length(source, query) {
    let matched = false;
    if (isObject(query)) {
        Ok(query).forEach((k) => {
            const qry = query[k]["$length"];
            if (safeHasOwnProperty(source, k)) {
                if (Array.isArray(source[k]) || typeof source[k] === "string") {
                    if (source[k].length === qry) {
                        matched = true;
                    }
                }
            }
        });
    }
    return matched;
}

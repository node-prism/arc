import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";
/**
 * @example
 * { name: "Jean-Luc", friends: [1, 3, 4] }
 * users.find({ _id: { $oneOf: [1, 3, 4]  } })
 */
export function $oneOf(source, query) {
    let matches = [];
    if (isObject(query)) {
        Ok(query).forEach((k) => {
            let qry = query[k]["$oneOf"];
            qry = ensureArray(qry);
            if (safeHasOwnProperty(source, k)) {
                matches.push(qry.includes(source[k]));
            }
        });
    }
    if (!matches.length)
        return false;
    if (matches.length && matches.includes(false))
        return false;
    return true;
}

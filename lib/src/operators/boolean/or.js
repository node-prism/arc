import { checkAgainstQuery } from "../../return_found";
import { ensureArray, isObject, Ok } from "../../utils";
export function $or(source, query) {
    let matches = [];
    if (isObject(query)) {
        Ok(query).forEach((pk) => {
            if (pk === "$or") {
                let ors = query[pk];
                ors = ensureArray(ors);
                ors.forEach((or) => {
                    Ok(or).forEach((orKey) => {
                        // case: { num: (n) => n%2===0 }
                        if (typeof or[orKey] === "function" &&
                            source[orKey] !== undefined) {
                            matches.push(or[orKey](source[orKey]));
                        }
                        else {
                            matches.push(checkAgainstQuery(source, or));
                        }
                    });
                });
            }
        });
    }
    if (!matches.length)
        return false;
    if (matches.length && matches.includes(true))
        return true;
    return false;
}

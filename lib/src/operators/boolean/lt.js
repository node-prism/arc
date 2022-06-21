import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";
export function $lt(source, query) {
    let match = false;
    if (isObject(query)) {
        Ok(query).forEach((k) => {
            let qry = query[k]["$lt"];
            qry = ensureArray(qry);
            if (safeHasOwnProperty(source, k)) {
                qry.forEach((q) => {
                    if (source[k] < q) {
                        match = true;
                    }
                });
            }
        });
    }
    return match;
}

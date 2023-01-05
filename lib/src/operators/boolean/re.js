import { ensureArray, isObject, Ok } from "../../utils";
export function $re(source, query) {
    let match = undefined;
    if (isObject(query)) {
        Ok(query).forEach((k) => {
            if (isObject(query[k])) {
                if (source[k] === undefined)
                    return;
                Ok(query[k]).forEach((j) => {
                    if (j === "$re") {
                        match = true;
                        ensureArray(query[k][j]).forEach((re) => {
                            if (!re.test(source[k]))
                                match = false;
                        });
                    }
                });
            }
        });
    }
    if (match !== undefined)
        return match;
    return false;
}

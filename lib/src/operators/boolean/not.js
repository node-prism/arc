import { checkAgainstQuery } from "../../return_found";
import { Ok, isObject, safeHasOwnProperty, ensureArray } from "../../utils";
export function $not(source, query) {
    const matches = [];
    if (isObject(query)) {
        Ok(query).forEach((pk) => {
            if (pk === "$not") {
                let nots = query[pk];
                nots = ensureArray(nots);
                nots.forEach((not) => {
                    if (!Ok(not).every((notKey) => safeHasOwnProperty(source, notKey))) {
                        matches.push(false);
                        return;
                    }
                    matches.push(!checkAgainstQuery(source, not));
                });
            }
        });
    }
    return matches.filter(Boolean).length > 0;
}

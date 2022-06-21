import _ from "lodash";
import { checkAgainstQuery } from "./return_found";
import { isEmptyObject, isObject, Ok } from "./utils";
export function appendProps(source, query, newProps, merge = false) {
    if (source === undefined)
        return undefined;
    const processObject = (item) => {
        if (!isObject(item))
            return item;
        let clone = { ...item };
        if (checkAgainstQuery(clone, query)) {
            if (!merge) {
                clone = { ...clone, ...newProps };
            }
            else {
                clone = _.merge(clone, newProps);
            }
        }
        Ok(clone).forEach((key) => {
            if (isObject(clone[key]) || Array.isArray(clone[key])) {
                clone = {
                    ...clone,
                    [key]: appendProps(clone[key], query, newProps),
                };
            }
        });
        return clone;
    };
    if ((Array.isArray(source) || isObject(source)) && !isEmptyObject(query) && !isEmptyObject(newProps)) {
        return !Array.isArray(source) ? processObject(source) : source.map((item) => processObject(item));
    }
    return source;
}

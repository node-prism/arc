import _ from "lodash";
import { defaultQueryOptions, ID_KEY } from ".";
import { applyQueryOptions } from "./query_options";
import { returnFound } from "./return_found";
import { ensureArray, isObject, Ov } from "./utils";
const makeDistinctByKey = (arr, key) => {
    let map = new Map();
    let val;
    arr = ensureArray(arr);
    let unique = arr.filter((el) => {
        if (el === undefined)
            return;
        val = map.get(el[key]);
        if (val) {
            if (el[key] != val) {
                map.delete(el[key]);
                map.set(el[key], el[key]);
                return true;
            }
            else {
                return false;
            }
        }
        map.set(el[key], el[key]);
        return true;
    });
    return unique;
};
export default function find(data, query, options, collectionOptions) {
    options = { ...defaultQueryOptions(), ...options };
    query = ensureArray(query);
    // remove any empty objects from the query.
    query = query.filter((q) => Object.keys(q).length > 0);
    // if there's no query, return all data.
    if (!query.length) {
        if (options.clonedData) {
            let distinctCloned = [];
            for (const obj of [...Ov(data)]) {
                distinctCloned.push(_.cloneDeep(obj));
            }
            return distinctCloned;
        }
        let d = [...Ov(data)];
        let mutated = applyQueryOptions(d, options);
        return mutated;
    }
    // we have a query
    let res = [];
    for (const q of query) {
        let r = [];
        if (q[ID_KEY] && !isObject(q[ID_KEY]) && !collectionOptions.integerIds) {
            r.push(data[q[ID_KEY]]);
        }
        else if (q[ID_KEY] && !isObject(q[ID_KEY]) && collectionOptions.integerIds) {
            let f = data.__private.id_map[q[ID_KEY]];
            // If we have `f`, it's a uuid.
            if (f)
                r.push(data[f]);
        }
        else {
            r = returnFound([...Ov(data)], q, options, null);
            // r = returnFound(data, q);
            if (r === undefined)
                r = [];
            r = ensureArray(r);
        }
        res.push(...r);
    }
    res = applyQueryOptions(res, options);
    let distinct = makeDistinctByKey(res, ID_KEY);
    if (!options.clonedData) {
        return distinct;
    }
    let cloned = [];
    for (const obj of distinct)
        cloned.push(_.cloneDeep(obj));
    return cloned;
}

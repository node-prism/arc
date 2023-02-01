import _ from "lodash";
import {
  CollectionData, CollectionOptions, defaultQueryOptions,
  ID_KEY,
  QueryOptions
} from "./collection";
import { applyQueryOptions } from "./query_options";
import { returnFound } from "./return_found";
import { ensureArray, isObject, Ov } from "./utils";

const makeDistinctByKey = (arr: any[], key: string) => {
  const map = new Map();
  let val: any;
  arr = ensureArray(arr);
  return arr.filter((el) => {
    if (el === undefined) return;
    val = map.get(el[key]);
    if (val) {
      if (el[key] != val) {
        map.delete(el[key]);
        map.set(el[key], el[key]);
        return true;
      } else {
        return false;
      }
    }
    map.set(el[key], el[key]);
    return true;
  });
};

export default function find<T>(
  data: CollectionData,
  query: any,
  options: QueryOptions,
  collectionOptions: CollectionOptions<T>
): T[] {
  options = { ...defaultQueryOptions(), ...options };
  query = ensureArray(query);

  // remove any empty objects from the query.
  query = query.filter((q: object) => Object.keys(q).length > 0);

  // if there's no query, return all data.
  if (!query.length) {
    if (options.clonedData) {
      const out = [];

      for (const key in data) {
        if (key === "__private") continue;
        out.push(_.cloneDeep(data[key]));
      }

      return out;
    }

    return applyQueryOptions([...Ov(data)], options);
  }

  // we have a query
  let res = [];
  for (const q of query) {
    let r = [];
    if (q[ID_KEY] && !isObject(q[ID_KEY]) && !collectionOptions.integerIds) {
      r.push(data[q[ID_KEY]]);
    } else if (q[ID_KEY] && !isObject(q[ID_KEY]) && collectionOptions.integerIds) {
      const f = data.__private.id_map[q[ID_KEY]];
      // If we have `f`, it's a uuid.
      if (f) r.push(data[f])
    } else {
      r = returnFound([...Ov(data)], q, options, null);
      if (r === undefined) r = [];
      r = ensureArray(r);
    }

    res.push(...r);
  }

  const distinct = makeDistinctByKey(res, ID_KEY);
  res = applyQueryOptions(distinct, options);

  if (!options.clonedData) return res;

  const cloned = [];
  for (const obj of res) cloned.push(_.cloneDeep(obj));
  return cloned;
}

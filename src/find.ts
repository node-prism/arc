import _ from "lodash";
import dot from "dot-wild";
import {
  Collection,
  CollectionData,
  CollectionOptions,
  defaultQueryOptions,
  ID_KEY,
  QueryOptions,
  stripBooleanModifiers,
} from "./collection";
import { applyQueryOptions } from "./query_options";
import { returnFound } from "./return_found";
import { ensureArray, isObject, Ok, Ov } from "./utils";

const makeDistinctByKey = (arr: any[], key: string) => {
  const map = new Map();
  let val: any;
  arr = ensureArray(arr);
  return arr.filter((el) => {
    if (el === undefined) return;
    val = map.get(el[key]);
    if (val !== undefined) {
      return false;
    }
    map.set(el[key], true);
    return true;
  });
};

export default function find<T>(
  data: CollectionData,
  query: any,
  options: QueryOptions,
  collectionOptions: CollectionOptions<T>,
  collection: Collection<T>
): T[] {
  options = { ...defaultQueryOptions(), ...options };
  query = ensureArray(query);

  // remove any empty objects from the query.
  query = query.filter((q: object) => Ok(q).length > 0);

  // if there's no query, return all data.
  if (!query.length) {
    if (options.clonedData) {
      const out = [];

      for (const key in data) {
        if (key === "internal") continue;
        out.push(_.cloneDeep(data[key]));
      }

      return applyQueryOptions(out, options);
    }

    return applyQueryOptions([...Ov(data)], options);
  }

  const withoutPrivate = [...Ov(data)].slice(1);
  let res = [];

  for (const q of query) {
    let r = [];
    if (q[ID_KEY] && !isObject(q[ID_KEY]) && !collectionOptions.integerIds) {
      r.push(data[q[ID_KEY]]);
    } else if (
      q[ID_KEY] &&
      !isObject(q[ID_KEY]) &&
      collectionOptions.integerIds
    ) {
      const f = data.internal.id_map[q[ID_KEY]];
      // If we have `f`, it's a cuid.
      if (f) r.push(data[f]);
    } else {
      const strippedQuery = stripBooleanModifiers(_.cloneDeep(q));
      const flattened = Object.fromEntries(
        Object.entries(dot.flatten(strippedQuery)).map(([k, v]) => [
          k.replace(/\\./g, "."),
          v,
        ])
      );

      if (Ok(flattened).some((key) => collection.indices[key])) {
        Ok(collection.indices).forEach((key) => {
          const queryPropertyValue = key.includes(".")
            ? flattened[key]
            : q[key];
          if (queryPropertyValue) {
            const cuids =
              data.internal.index.valuesToId?.[key]?.[queryPropertyValue];

            if (cuids) {
              const sourceItems = cuids?.map((cuid) => data[cuid]);
              r.push(
                ...returnFound(sourceItems, q, options, collectionOptions)
              );
            } else {
              r.push(...returnFound(withoutPrivate, q, options, collection));
            }
          }
        });
      } else {
        r = returnFound(withoutPrivate, q, options, null);
        if (r === undefined) r = [];
        r = ensureArray(r);
      }
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

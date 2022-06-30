import _ from "lodash";
import {
  CollectionOptions,
  CollectionData,
  defaultQueryOptions,
  ID_KEY,
  QueryOptions,
} from ".";
import { returnFound } from "./return_found";
import { ensureArray, isObject, Ok, Ov } from "./utils";

enum ProjectionMode {
  Explicit = 0,
  ImplicitExclusion = 1,
  ImplicitInclusion = 2,
}

const getSortFunctions = (keys: string[]) =>
  keys.map((key) => (item: any) => item[key]);

const getSortDirections = (nums: number[]) =>
  nums.map((num) => num === 1 ? "asc" : "desc");

export function applyQueryOptions(data: any[], options: QueryOptions): any {
  if (options.project) {
    // What is the projection mode?
    // 1. Implicit exclusion: { a: 1, b: 1 }
    // 2. Implicit inclusion: { a: 0, b: 0 }
    // 3. Explicit: { a: 0, b: 1 }
    const projectionTotal = Object.keys(options.project).reduce(
      (acc, key) => acc + options.project[key],
      0
    );

    const projectionMode =
      projectionTotal === Object.keys(options.project).length
        ? ProjectionMode.ImplicitExclusion
        : projectionTotal === 0
        ? ProjectionMode.ImplicitInclusion
        : ProjectionMode.Explicit;

    // Implicitly include ID_KEY when it's not explicitly excluded.
    if (options.project[ID_KEY] === undefined) {
      options.project[ID_KEY] = 1;
    }

    if (projectionMode === ProjectionMode.ImplicitExclusion) {
      // data = _.map(data, (item) => _.pick(item, Ok(options.project)));
      data = data.map((item) => _.pick(item, Ok(options.project)));
    } else if (projectionMode === ProjectionMode.ImplicitInclusion) {
      // data = _.map(data, (item) => _.omit(item, Ok(options.project)));
      data = data.map((item) => _.omit(item, Ok(options.project)));
    } else if (projectionMode === ProjectionMode.Explicit) {
      const omit = Object.keys(options.project).filter((key) => options.project[key] === 0);
      data = data.map((item) => _.omit(item, omit));
    }
  }

  if (options.sort) {
    data = _.orderBy(
      data,
      getSortFunctions(Ok(options.sort)),
      getSortDirections(Ov(options.sort))
    );
  }

  if (options.skip && typeof options.skip === "number") {
    data = data.slice(options.skip);
  }

  if (options.take && typeof options.take === "number") {
    data = data.slice(0, options.take);
  }

  return data;
}

export const makeDistinctByKey = (arr: any[], key: string) => {
  let map = new Map();
  let val: any;
  arr = ensureArray(arr);
  let unique = arr.filter((el) => {
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
  return unique;
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
    if (q[ID_KEY] && !isObject(q[ID_KEY])) {
      r.push(data[q[ID_KEY]]);
    } else if (q["id"] && collectionOptions.integerIds) {
      let f = data.__private.id_map[q["id"]];
      // If we have `f`, it's a uuid.
      if (f) r.push(data[f])
    } else {
      r = returnFound([...Ov(data)], q, options, null);
      // r = returnFound(data, q);
      if (r === undefined) r = [];
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
  for (const obj of distinct) cloned.push(_.cloneDeep(obj));
  return cloned;
}

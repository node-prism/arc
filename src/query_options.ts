import dot from "dot-wild";
import _ from "lodash";
import { QueryOptions } from "./collection";
import { ensureArray, Ok, Ov } from "./utils";

enum ProjectionMode {
  Explicit = 0,
  ImplicitExclusion = 1,
  ImplicitInclusion = 2,
}

const getSortFunctions = (keys: string[]) =>
  keys.map((key) => (item: any) => item[key]);

const getSortDirections = (nums: number[]) =>
  nums.map((num) => num === 1 ? "asc" : "desc");

function applyAggregation(data: any[], options: QueryOptions): any[] {
  const ops = {
    $floor: (item: object, str: string) => {
      const prop = dot.get(item, str);
      if (typeof prop === "number") {
        return Math.floor(prop);
      }
      return 0;
    },
    $ceil: (item: object, str: string) => {
      const prop = dot.get(item, str);
      if (typeof prop === "number") {
        return Math.ceil(prop);
      }
      return 0;
    },
    $sub: (item: object, arr: (string|number)[]) => {
      let res = undefined;
      for (const a of arr) {
        if (typeof a === "number") {
          if (res === undefined) {
            res = a;
          } else {
            res -= a;
          }
        } else if (res === undefined) {
          res = Number(dot.get(item, a) ?? 0);
        } else {
          res -= Number(dot.get(item, a) ?? 0);
        }
      }
      return res;
    },
    $add: (item: object, arr: (string|number)[]) =>
      arr.reduce((acc, val) =>
        typeof val === 'number'
          ? (acc === undefined ? val : Number(acc) + val)
          : (
              acc === undefined
                ? Number(dot.get(item, val) ?? 0)
                : Number(acc) + Number(dot.get(item, val) ?? 0)
            )
      , undefined),
    $mult: (item: object, arr: (string|number)[]) => {
      return arr.reduce((res, a) => {
        if (typeof a === "number") {
          return Number(res) * a;
        } else {
          return Number(res) * (Number(dot.get(item, a)) || 1);
        }
      }, 1);
    },
    $div: (item: object, arr: (string|number)[]) => {
      return arr.reduce((res: number | undefined, a: string | number) => {
        const val = typeof a === 'number' ? a : Number(dot.get(item, a) ?? 1);
        return res === undefined ? val : res / val;
      }, undefined);
    },
    $fn: (item: object, fn: (i: any) => unknown) => {
      return fn(item);
    },
  };

  Ok(options.aggregate).forEach((key) => {
    if (typeof options.aggregate[key] !== "object") return;
    Ok(options.aggregate[key]).forEach((operation) => {
      if (operation[0] !== "$") return;
      if (!ops[operation]) return;

      data = data.map((item) => {
        item[key] = ops[operation](item, options.aggregate[key][operation]);
        return item;
      });
    });
  });

  return data;
}

export function applyQueryOptions(data: any[], options: QueryOptions): any {
  if (options.aggregate) {
    data = applyAggregation(data, options);
  }

  // Apply projection after aggregation so that we have the opportunity to remove
  // any intermediate properties that were used strictly in aggregation and should not
  // be included in the result set.
  if (options.project) {
    // What is the projection mode?
    // 1. Implicit exclusion: { a: 1, b: 1 }
    // 2. Implicit inclusion: { a: 0, b: 0 }
    // 3. Explicit: { a: 0, b: 1 }
    const projectionTotal = Object.keys(options.project).reduce((acc, key) => {
      if (typeof options.project[key] === "number" && typeof acc === "number") {
        return acc + options.project[key];
      }
    }, 0);

    const projectionMode =
      projectionTotal === Object.keys(options.project).length
        ? ProjectionMode.ImplicitExclusion
        : projectionTotal === 0
        ? ProjectionMode.ImplicitInclusion
        : ProjectionMode.Explicit;

    if (projectionMode === ProjectionMode.ImplicitExclusion) {
      data = data.map((item) => _.pick(item, Ok(options.project)));
    } else if (projectionMode === ProjectionMode.ImplicitInclusion) {
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

  function joinData(data: any[], joinOptions: any[]) {
    return joinOptions.reduce((acc, join) => {
      if (!join.collection) throw new Error("Missing required field in join: collection");
      if (!join.from) throw new Error("Missing required field in join: from");
      if (!join.on) throw new Error("Missing required field in join: on");
      if (!join.as) throw new Error("Missing required field in join: as");
  
      const qo = join.options || {};
      const db = join.collection;
      const tmp = db.createId();
  
      const asDotStar = join.as.includes(".") && join.as.includes("*");
  
      return acc.map((item) => {
        if (!asDotStar) item = dot.set(item, join.as, ensureArray(dot.get(item, join.as)));
        item[tmp] = [];
        const from = join.from.includes(".") ? dot.get(item, join.from) : item[join.from];
        if (from === undefined) return item;
        item = dot.set(item, join.as, []);
  
        if (Array.isArray(from)) {
          from.forEach((key: unknown, index: number) => {
            const query = { [`${join.on}`]: key };
            if (asDotStar) {
              item = dot.set(item, join.as.replaceAll("*", index.toString()), db.find(query, qo)[0]);
            } else {
              item[tmp] = item[tmp].concat(db.find(query, qo));
            }
          });
  
          if (!asDotStar) {
            item = dot.set(item, join.as, dot.get(item, join.as).concat(item[tmp]));
          }
  
          delete item[tmp];
  
          return item;
        }
  
        const query = { [`${join.on}`]: from };
  
        if (!asDotStar) {
          item[tmp] = db.find(query, qo);
          item = dot.set(item, join.as, dot.get(item, join.as).concat(item[tmp]));
        }
  
        delete item[tmp];
  
        return item;
      });
    }, data);
  }

  if (options.join) {
    data = joinData(data, options.join);
  }

  function ifNull(item: any, opts: Record<string, any>) {
    for (const key in opts) {
      const itemValue = dot.get(item, key);
      if (itemValue === null || itemValue === undefined) {
        if (typeof opts[key] === "function") {
          item = dot.set(item, key, opts[key](item));
        } else {
          item = dot.set(item, key, opts[key]);
        }
      }
    }

    return item;
  }

  function ifEmpty(item: any, opts: Record<string, any>) {
    const emptyCheckers = {
      array: (value: any) => Array.isArray(value) && value.length === 0,
      string: (value: any) => typeof value === "string" && value.trim().length === 0,
      object: (value: any) => typeof value === "object" && Object.keys(value).length === 0,
    };
  
    return Object.entries(opts).reduce((result, [key, value]) => {
      const itemValue = dot.get(item, key);
      const isEmpty = Object.values(emptyCheckers).some((checker) => checker(itemValue));
      if (isEmpty) {
        const newValue = typeof value === "function" ? value(item) : value;
        return dot.set(result, key, newValue);
      }
      return result;
    }, item);
  }
  

  if (options.ifNull) {
    data = data.map((item) => ifNull(item, options.ifNull));
  }

  if (options.ifEmpty) {
    data = data.map((item) => ifEmpty(item, options.ifEmpty));
  }

  if (options.ifNullOrEmpty) {
    return data
      .map((item) => ifNull(item, options.ifNullOrEmpty))
      .map((item) => ifEmpty(item, options.ifNullOrEmpty));
  }

  return data;
}

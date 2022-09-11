import cuid from "cuid";
import _ from "lodash";
import { ID_KEY, QueryOptions } from ".";
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

const stripSign = (str: string) => str[0] === "$" ? str.slice(1) : str;

function applyProjectionAggregation(data: any[], options: QueryOptions): any[] {
  const ops = {
    $floor: (item: object, str: string) => {
      if (!str.startsWith("$")) return;
      const stripped = str.slice(1);
      if (Ok(item).includes(stripped)) {
        return Math.floor(item[stripped]);
      }
      return 0;
    },
    $ceil: (item: object, str: string) => {
      if (!str.startsWith("$")) return;
      const stripped = str.slice(1);
      if (Ok(item).includes(stripped)) {
        return Math.ceil(item[stripped]);
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
          res = Number(item?.[stripSign(a)] ?? 0);
        } else {
          res -= Number(item?.[stripSign(a)] ?? 0);
        }
      }
      return res;
    },
    $add: (item: object, arr: (string|number)[]) => {
      let res = undefined;
      for (const a of arr) {
        if (typeof a === "number") {
          if (res === undefined) {
            res = a;
          } else {
            res += a;
          }
        } else if (res === undefined) {
          res = Number(item?.[stripSign(a)] ?? 0);
        } else {
          res += Number(item?.[stripSign(a)] ?? 0);
        }
      }
      return res;
    },
    $mult: (item: object, arr: (string|number)[]) => {
      let res = 1;
      for (const el of arr) {
        if (typeof el === "number") {
          res *= el;
        } else {
          res *= Number(item?.[stripSign(el)] ?? 1);
        }
      }
      return res;
    },
    $div: (item: object, arr: (string|number)[]) => {
      let res = undefined;
      for (const el of arr) {
        if (typeof el === "number") {
          if (res === undefined) {
            res = el;
          } else {
            res /= el;
          }
        } else if (res === undefined) {
          res = Number(item?.[stripSign(el)] ?? 1);
        } else {
          res /= Number(item?.[stripSign(el)] ?? 1);
        }
      }
      return res;
    }
  };

  Ok(options.project).forEach((key) => {
    if (typeof options.project[key] !== "object") return;
    Ok(options.project[key]).forEach((operation) => {
      if (operation[0] !== "$") return;
      if (!ops[operation]) return;

      data = data.map((item) => {
        item[key] = ops[operation](item, options.project[key][operation]);
        return item;
      });
    });
  });

  return data;
}

export function applyQueryOptions(data: any[], options: QueryOptions): any {
  if (options.project) {
    // What is the projection mode?
    // 1. Implicit exclusion: { a: 1, b: 1 }
    // 2. Implicit inclusion: { a: 0, b: 0 }
    // 3. Explicit: { a: 0, b: 1 }
    const projectionTotal = Object.keys(options.project).reduce((acc, key) => {
      if (typeof options.project[key] === "number" && typeof acc === "number") {
        // @ts-ignore
        return acc + options.project[key];
      }
    }, 0);

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
      data = data.map((item) => _.pick(item, Ok(options.project)));
    } else if (projectionMode === ProjectionMode.ImplicitInclusion) {
      data = data.map((item) => _.omit(item, Ok(options.project)));
    } else if (projectionMode === ProjectionMode.Explicit) {
      const omit = Object.keys(options.project).filter((key) => options.project[key] === 0);
      data = data.map((item) => _.omit(item, omit));
    }

    // After removing unneeded fields, apply aggregation operations.
    data = applyProjectionAggregation(data, options);
  }

  if (options.ifNull) {
    data = data.map((item) => {
      for (const key in options.ifNull) {
        if (item[key] === null || item[key] === undefined) {
          item[key] = options.ifNull[key];
       }
      }
      return item;
    });
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

  if (options.join && Array.isArray(options.join)) {
    options.join.forEach((join) => {
      const qo = join?.options || {};
      const db = join.collection;
      const tmp = cuid();
      data = data.map((item) => {
        item[join.as] = ensureArray(item[join.as]);
        item[tmp] = [];

        if (item[join.from] === undefined) return item;

        if (Array.isArray(item[join.from])) {
          item[join.from].forEach((key: unknown) => {
            const query = { [`${join.on}`]: key };
            item[tmp] = item[tmp].concat(
              db.find(query, qo)
            );
          });

          item[join.as] = item[tmp];
          delete item[tmp];

          return item;
        }

        const query = { [`${join.on}`]: item[join.from] };

        item[tmp] = db.find(query, qo);
        item[join.as] = item[tmp];
        delete item[tmp];

        return item;
      });
    });
  }

  return data;
}

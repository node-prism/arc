import _ from "lodash";
import { checkAgainstQuery } from "./return_found";
import { isEmptyObject, isObject, Ok } from "./utils";

export function appendProps(source: any, query: object, newProps: any, merge = false) {
  if (source === undefined) return undefined;

  const processObject = (item: any) => {
    if (!isObject(item)) return item;

    const clone = _.cloneDeep(item);
    if (checkAgainstQuery(clone, query)) {
      if (!merge) {
        Object.assign(clone, newProps);
      } else {
        _.merge(clone, newProps);
      }
    }

    for (const key of Object.keys(clone)) {
      if (isObject(clone[key]) || Array.isArray(clone[key])) {
        clone[key] = appendProps(clone[key], query, newProps);
      }
    }

    return clone;
  };

  if ((Array.isArray(source) || isObject(source)) && !isEmptyObject(query) && !isEmptyObject(newProps)) {
    return Array.isArray(source) ? source.map(processObject) : processObject(source);
  }

  return source;
}
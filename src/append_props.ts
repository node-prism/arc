import _ from "lodash";
import { checkAgainstQuery } from "./return_found";
import { isEmptyObject, isObject, Ok } from "./utils";

/**
 * Appends newProps to objects and arrays within source if they match the query.
 * @param source - object or array of objects to append properties to
 * @param query - object with properties to match against
 * @param newProps - properties to append to matching objects
 * @param merge - whether to merge matching objects with newProps instead of replacing
 * @returns source with newProps appended to matching objects
 */
export function appendProps(source: any, query: object, newProps: any, merge = false) {
  // If source is undefined, return undefined
  if (source === undefined) return undefined;

  /**
   * Recursively processes objects to append newProps to matching objects
   * @param item - object or array to process
   * @returns object or array with newProps appended to matching objects
   */
  const processObject = (item: any) => {
    // If item is not an object or array, return it as is
    if (!isObject(item)) return item;

    // Clone the item to avoid modifying the original
    const clone = _.cloneDeep(item);
    
    // If the clone matches the query, append or merge newProps
    if (checkAgainstQuery(clone, query)) {
      if (!merge) {
        Object.assign(clone, newProps);
      } else {
        _.merge(clone, newProps);
      }
    }

    // Recursively process child objects and arrays
    for (const key of Ok(clone)) {
      if (isObject(clone[key]) || Array.isArray(clone[key])) {
        clone[key] = processObject(clone[key]);
      }
    }

    return clone;
  };

  // If source is an array or object and query and newProps are not empty, process source
  if ((Array.isArray(source) || isObject(source)) && !isEmptyObject(query) && !isEmptyObject(newProps)) {
    return Array.isArray(source) ? source.map(processObject) : processObject(source);
  }

  // Otherwise, return source as is
  return source;
}

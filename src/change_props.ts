import _ from "lodash";
import { checkAgainstQuery } from "./return_found";
import { isEmptyObject, isObject, Ok, safeHasOwnProperty } from "./utils";

/**
 * Recursively replaces properties of a source object or array based on a query object.
 *
 * @param source - The object or array to process.
 * @param query - The properties to match.
 * @param replaceProps - The replacement properties.
 * @param createNewProperties - Whether to create new properties if they don't exist.
 * @returns The processed object or array.
 */
export const changeProps = <T>(
  source: T,
  query: Partial<T>,
  replaceProps: Partial<T>,
  createNewProperties = false
): T | undefined => {
  if (!source) return undefined;

  // helper function to process objects and arrays recursively
  const processObject = (item: any) => {
    // if item is not an object, return item
    if (!isObject(item)) return item;

    // create a clone of the item
    const itemClone = _.cloneDeep(item);

    // loop through replaceProps object keys
    for (const key of Ok(replaceProps)) {
      // if itemClone matches query and createNewProperties is true or the key already exists in itemClone
      if (checkAgainstQuery(itemClone, query) &&
          (createNewProperties || safeHasOwnProperty(itemClone, key))) {
        // update the itemClone key with the new value from replaceProps
        itemClone[key] = replaceProps[key];
      }
    }

    // loop through itemClone keys
    for (const key of Ok(itemClone)) {
      // if the value of the key is an object or an array, call processObject recursively
      if (isObject(itemClone[key]) || Array.isArray(itemClone[key])) {
        itemClone[key] = changeProps(
          itemClone[key],
          query,
          replaceProps,
          createNewProperties
        );
      }
    }

    // return the updated itemClone
    return itemClone;
  };

  // if source is an object and both query and replaceProps are not empty objects, call processObject
  if (isObject(source) && !isEmptyObject(query) && !isEmptyObject(replaceProps)) {
    return processObject(source);
  // if source is an array and both query and replaceProps are not empty objects, map through the array and call processObject on each item
  } else if (Array.isArray(source) && !isEmptyObject(query) && !isEmptyObject(replaceProps)) {
    return source.map(processObject) as unknown as T;
  // otherwise, return the original source
  } else {
    return source;
  }
};

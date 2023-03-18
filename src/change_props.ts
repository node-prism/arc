import { checkAgainstQuery } from "./return_found";
import { isEmptyObject, isObject, Ok, safeHasOwnProperty } from "./utils";

export const changeProps = (
  source: any,
  query: object,
  replaceProps: { [x: string]: any },
  createNewProperties = false
) => {
  if (source === undefined) return undefined;

  const processObject = (item: any) => {
    if (!isObject(item)) return item;

    const itemClone = { ...item };

    for (const key of Object.keys(replaceProps)) {
      if (checkAgainstQuery(itemClone, query) &&
          (createNewProperties || safeHasOwnProperty(itemClone, key))) {
        itemClone[key] = replaceProps[key];
      }
    }

    for (const key of Object.keys(itemClone)) {
      if (isObject(itemClone[key]) || Array.isArray(itemClone[key])) {
        itemClone[key] = changeProps(
          itemClone[key],
          query,
          replaceProps,
          createNewProperties
        );
      }
    }

    return itemClone;
  };

  if (
    (Array.isArray(source) || isObject(source)) &&
    !isEmptyObject(query) &&
    !isEmptyObject(replaceProps)
  ) {
    return Array.isArray(source)
      ? source.map(processObject)
      : processObject(source);
  }

  return source;
};

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

    let itemClone = { ...item };

    if (checkAgainstQuery(itemClone, query)) {
      Ok(replaceProps).forEach((key) => {
        if (createNewProperties) {
          itemClone = {
            ...itemClone,
            [key]: replaceProps[key],
          };
        } else if (safeHasOwnProperty(itemClone, key)) {
          itemClone = {
            ...itemClone,
           [key]: replaceProps[key],
          };
        }
      });
    }

    Ok(itemClone).forEach((key) => {
      if (isObject(itemClone[key]) || Array.isArray(itemClone[key])) {
        itemClone = {
          ...itemClone,
          [key]: changeProps(
            itemClone[key],
            query,
            replaceProps,
            createNewProperties
          ),
        };
      }
    });

    return itemClone;
  };

  if (
    (Array.isArray(source) || isObject(source)) &&
    !isEmptyObject(query) &&
    !isEmptyObject(replaceProps)
  ) {
    return !Array.isArray(source)
      ? processObject(source)
      : source.map((item) => processObject(item));
  }

  return source;
};

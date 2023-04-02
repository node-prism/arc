import dot from "dot-wild";
import { ID_KEY } from "../../collection";
import { returnFound } from "../../return_found";
import { ensureArray, isObject } from "../../utils";

export function $and(source: object, query: object): boolean {
  if (!isObject(query)) {
    return true;
  }

  // @ts-ignore
  const ands = ensureArray(query.$and);
  if (!ands) {
    return true;
  }

  return ands.every((and) => {
    return Object.keys(and).every((key) => {
      const value = and[key];

      if (typeof value === "function") {
        return value(dot.get(source, key));
      } else {
        const match = returnFound(source, { [key]: value }, { deep: true, returnKey: ID_KEY, clonedData: true }, source);
        return Boolean(match && match.length);
      }
    });
  });
}

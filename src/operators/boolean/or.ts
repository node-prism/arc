import dot from "dot-wild";
import { ID_KEY } from "../../collection";
import { returnFound } from "../../return_found";
import { ensureArray, isObject } from "../../utils";

export function $or(source: object, query: object): boolean {
  if (!isObject(query)) return false;
  // @ts-ignore
  if (!query.$or) return false;
  
  // @ts-ignore
  const ors = ensureArray(query.$or);
  for (const or of ors) {
    const matches = [];
    for (const [orKey, orValue] of Object.entries(or)) {
      const sourceOrValue = dot.get(source, orKey);
      if (typeof orValue === "function" && sourceOrValue !== undefined) {
        matches.push(orValue(sourceOrValue));
      } else {
        const match = returnFound(source, or, { deep: true, returnKey: ID_KEY, clonedData: true }, source);
        matches.push(Boolean(match && match.length));
      }
    }
    if (matches.length && matches.includes(true)) return true;
  }
  
  return false;
}
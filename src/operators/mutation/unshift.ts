import dot from "dot-wild";
import { Collection } from "../..";
import { ensureArray, isObject } from "../../utils";

// { $unshift: { b: 2, c: 3 } }
// { $unshift: { b: [2, 3] } }
// { $unshift: { "a.b.c": 2 }}
// { $unshift: { "a.b.c": [2, 3] }}
export function $unshift<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  const mods = ensureArray(modifiers);
  
  return mods.reduce((acc, mod) => {
    if (isObject(mod)) {
      Object.keys(mod).forEach((key) => {
        acc = acc.map((doc: T) => {
          const original = dot.get(doc, key);
          if (original !== undefined) {
            const value = mod[key];
            const newValue = Array.isArray(value) ? value.concat(original) : [value].concat(original);
            return dot.set(doc, key, newValue);
          }
          return doc;
        });
      });
    }
    return acc;
  }, source);
}

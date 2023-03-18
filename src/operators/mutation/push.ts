import dot from "dot-wild";
import { Collection } from "../..";
import { ensureArray, isObject } from "../../utils";

// { $push: { b: 2, c: 3 } }
// { $push: { b: [2, 3] } }
// { $push: { "a.b.c": 2 }}
// { $push: { "a.b.c": [2, 3] }}
export function $push<T>(source: T[], modifiers: any, query: object, collection: Collection<T>): T[] {
  const mods = ensureArray(modifiers);
  
  return mods.reduce((acc, mod) => {
    if (isObject(mod)) {
      return Object.keys(mod).reduce((docs, key) => {
        return docs.map((doc) => {
          const original = dot.get(doc, key);
          const value = mod[key];
          if (original !== undefined) {
            const newValue = Array.isArray(value) ? original.concat(value) : original.concat([value]);
            return dot.set(doc, key, newValue);
          }
          return doc;
        });
      }, acc);
    }
    return acc;
  }, source);
}



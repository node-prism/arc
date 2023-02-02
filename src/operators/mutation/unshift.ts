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
  mods.forEach((mod) => {
    if (isObject(mod)) {
      Object.keys(mod).forEach((key) => {
        source = source.map((document) => {
          if (dot.get(document, key) !== undefined) {
            const original = dot.get(document, key); // [5, 7]
            const value = mod[key];
            if (Array.isArray(value)) {
              const newValue = value.concat(original);
              document = dot.set(document, key, newValue);
            } else {
              const newValue = [value].concat(original);
              document = dot.set(document, key, newValue);
            }
          }
          return document;
        });
      });
    }
  });

  return source;
}

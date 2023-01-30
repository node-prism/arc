import dot from "dot-wild";
import { Collection } from "../..";
import { appendProps } from "../../append_props";
import { returnFound } from "../../return_found";
import { ensureArray, isObject, safeHasOwnProperty } from "../../utils";

// { $push: { b: 2, c: 3 } }
// { $push: { b: [2, 3] } }
// { $push: { "a.b.c": 2 }}
// { $push: { "a.b.c": [2, 3] }}
export function $push<T>(
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
              const newValue = original.concat(value);
              document = dot.set(document, key, newValue);
            } else {
              const newValue = original.concat([value]);
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


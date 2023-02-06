import dot from "dot-wild";
import { Collection } from "../..";
import { changeProps } from "../../change_props";
import { ensureArray, isObject, Ok } from "../../utils";

export function $set<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  const mods = ensureArray(modifiers);

  mods.forEach((mod) => {
    if (!isObject(mod)) {
      const flattened = dot.flatten(query);

      Object.keys(flattened).forEach((key) => {
        source = source.map((doc: T) => dot.set(doc, key, mod));
      });

      return;
    }

    if (isObject(mod)) {
      Object.keys(mod).forEach((key) => {
        source = source.map((doc: T) => dot.set(doc, key, mod[key]));
      });

      return;
    }

    source = changeProps(source, query, mod, true);
  });

  return source;
}

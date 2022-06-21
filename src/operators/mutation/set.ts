import { Collection } from "../..";
import { changeProps } from "../../change_props";
import { ensureArray, isObject, Ok } from "../../utils";

export function $set<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  let mods = ensureArray(modifiers);

  mods.forEach((mod) => {
    if (!isObject(mod) && !Array.isArray(mod)) {
      let obj = {};

      Ok(query).forEach((key) => {
        obj[key] = mod;
      });

      source = changeProps(source, query, obj, true);
    } else {
      source = changeProps(source, query, mod, true);
    }
  })

  return source;
}

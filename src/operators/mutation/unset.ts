import _ from "lodash";
import { Collection } from "../..";
import { ensureArray } from "../../utils";

export function $unset<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  const mods = ensureArray(modifiers);

  mods.forEach((mod) => {
    // { $unset: ["a", "b.c.d"] }
    if (Array.isArray(mod)) {
      return $unset(source, mod, query, collection);
    }

    // { $unset: "a" } or { $unset: "a.b.c" }
    source = source.map((document) => {
      return _.set<T>(document as any, mod, undefined);
    });
  });

  return source;
}

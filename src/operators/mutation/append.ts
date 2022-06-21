import { Collection } from "../..";
import { appendProps } from "../../append_props";
import { ensureArray } from "../../utils";

export function $append<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  let mods = ensureArray(modifiers);

  mods.forEach((mod) => {
    source = appendProps(source, query, mod);
  });

  return source;
}

import { Collection } from "../..";
import { appendProps } from "../../append_props";
import { ensureArray } from "../../utils";

export function $merge<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  const mods = ensureArray(modifiers);

  mods.forEach((mod) => {
    source = appendProps(source, query, mod, true);
  });

  return source;
}

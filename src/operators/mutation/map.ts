import { Collection } from "../..";
import { appendProps } from "../../append_props";
import { ensureArray } from "../../utils";

export function $map<T>(
  source: T[],
  mapImpl: (document: T, index: number, source: T[]) => T,
  query: object,
  collection: Collection<T>
): T[] {
  if (typeof mapImpl !== "function") {
    throw new Error("$map expected a function, e.g. { $map: (doc) => doc }");
  }

  return source.map((document, index, source) => {
    return mapImpl(document, index, source);
  });
}


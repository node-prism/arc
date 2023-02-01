import dot from "dot-wild";
import { Collection, ID_KEY } from "../../collection";
import { isFunction, isObject } from "../../utils";

export function $filter<T>(
  source: T[],
  filterImpl: (document: T, index: number, source: T[]) => T | { [key: string]: (document: T, index: number, source: T[]) => any },
  query: object,
  collection: Collection<T>
): T[] {
  if (isFunction(filterImpl)) {
    return source.filter((document, index, source) => {
      if (filterImpl(document, index, source)) {
        return true;
      }

      if (document[ID_KEY]) {
        collection.remove({ [ID_KEY]: document[ID_KEY] });
        return false;
      }

      return false;
    });
  }

  // { $filter: { anArray: (doc) => doc > 5 } }
  if (isObject(filterImpl)) {
    return source.map((document) => {
      Object.keys(filterImpl).forEach((key) => {
        const value = dot.get(document, key);
        if (!Array.isArray(value)) {
          throw new Error(`$filter when providing an object to filter on, the key being operated on in the source document must be an array: ${key} was not an array`);
        }

        const filtered = value.filter((document, index, source) => {
          return filterImpl[key](document, index, source);
        });

        document = dot.set(document, key, filtered);
      });

      return document;
    });
  }

  throw new Error("$filter expected either a function, e.g. { $filter: (doc) => doc }, or an array path with a function key, e.g. { $filter: { anArray: (doc) => doc } }");
}


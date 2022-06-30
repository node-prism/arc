import { Collection, CREATED_AT_KEY, ID_KEY, UPDATED_AT_KEY } from "../src";

export function testCollection<T>({ integerIds = false } = {}): Collection<T> {
  const collection = new Collection<T>(".test", "test", {
    autosync: false,
    integerIds,
  });
  collection.drop();

  // Adding some items to ensure that result sets correctly
  // ignore unmatched queries in all cases.
  // @ts-ignore
  collection.insert({ xxx: "xxx" });
  // @ts-ignore
  collection.insert({ yyy: "yyy" });
  // @ts-ignore
  collection.insert({ zzz: "zzz" });

  return collection;
}

export function testCollection2<T>({ integerIds = false } = {}): Collection<T> {
  const collection = new Collection<T>(".test", "test2", {
    autosync: false,
    integerIds,
  });
  collection.drop();

  // Adding some items to ensure that result sets correctly
  // ignore unmatched queries in all cases.
  // @ts-ignore
  collection.insert({ xxx: "xxx" });
  // @ts-ignore
  collection.insert({ yyy: "yyy" });
  // @ts-ignore
  collection.insert({ zzz: "zzz" });

  return collection;
}

export function nrml<T>(results: T[], { keepIds = false } = {}): T[] {
  // Remove all the _id fields, and
  // remove all the `_created_at` and `_updated_at` fields.
  return results.map((result) => {
    if (!keepIds) {
      delete result[ID_KEY];
    }

    delete result[CREATED_AT_KEY];
    delete result[UPDATED_AT_KEY];
    return result;
  });
}

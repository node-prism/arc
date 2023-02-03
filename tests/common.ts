import { Collection, CREATED_AT_KEY, ID_KEY, UPDATED_AT_KEY } from "../src/collection";
import EncryptedFSAdapter from "../src/adapter/fs";

const getCollection = <T>({ name = "test", integerIds = false, populate = true, timestamps = true }): Collection<T> => {
  const collection = new Collection<T>(".test", name, {
    autosync: false,
    integerIds,
    timestamps,
  });
  collection.drop();

  if (populate) {
    // Adding some items to ensure that result sets correctly
    // ignore unmatched queries in all cases.
    // @ts-ignore
    collection.insert({ xxx: "xxx" });
    // @ts-ignore
    collection.insert({ yyy: "yyy" });
    // @ts-ignore
    collection.insert({ zzz: "zzz" });
  }

  return collection;
};

const getEncryptedCollection = <T>({ name = "test", integerIds = false }): Collection<T> => { 
  const collection = new Collection<T>(".test", name, {
    autosync: false,
    integerIds,
    adapter: new EncryptedFSAdapter(".test", name),
  });

  return collection;
};

export function testCollection<T>({ name = "test", integerIds = false, populate = true, timestamps = true } = {}): Collection<T> {
  return getCollection({ name, integerIds, populate, timestamps });
}

export function testCollectionEncrypted<T>({ name = "test", integerIds = false } = {}): Collection<T> {
  return getEncryptedCollection({ name, integerIds });
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
  }); }

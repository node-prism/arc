import { Collection, CREATED_AT_KEY, ID_KEY, UPDATED_AT_KEY } from "../src";
import EncryptedFilesystemAdapter from "../src/fs_adapter_enc";
const getCollection = ({ name = "test", integerIds = false }) => {
    const collection = new Collection(".test", name, {
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
};
const getEncryptedCollection = ({ name = "test", integerIds = false }) => {
    const collection = new Collection(".test", name, {
        autosync: false,
        integerIds,
        adapter: new EncryptedFilesystemAdapter(".test", name),
    });
    return collection;
};
export function testCollection({ name = "test", integerIds = false } = {}) {
    return getCollection({ name, integerIds });
}
export function testCollectionEncrypted({ name = "test", integerIds = false } = {}) {
    return getEncryptedCollection({ name, integerIds });
}
export function nrml(results, { keepIds = false } = {}) {
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

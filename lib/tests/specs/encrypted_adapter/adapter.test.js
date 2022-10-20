import { testSuite, expect } from "manten";
import { nrml, testCollectionEncrypted } from "../../common";
export default testSuite(async ({ test }) => {
    test("can write", () => {
        const collection = testCollectionEncrypted({
            name: "enc",
        });
        collection.drop();
        collection.insert({ a: 1 });
        collection.insert({ a: 2 });
        collection.insert({ a: 3 });
        collection.sync();
        expect(nrml(collection.find({ a: 1 }))).toEqual([{ a: 1 }]);
    });
    test("can read", () => {
        const collection = testCollectionEncrypted({
            name: "enc",
        });
        const found = nrml(collection.find({ a: { $gt: 0 } }));
        expect(found).toEqual([
            { a: 1 },
            { a: 2 },
            { a: 3 },
        ]);
    });
});

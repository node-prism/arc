import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";
export default testSuite(async ({ describe }) => {
    describe("$merge", ({ test }) => {
        test("shallow selector, deep-root update", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 5 } });
            collection.update({ a: 1 }, { $merge: { b: { d: 6 } } });
            const found = nrml(collection.find({ d: 6 }));
            expect(found).toEqual([{ a: 1, b: { c: 5, d: 6 } }]);
        });
        test("deep-root selector, deep-root update", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 5 } });
            collection.update({ a: 1, b: { c: 5 } }, { $merge: { b: { d: 6 } } });
            const found = nrml(collection.find({ d: 6 }));
            expect(found).toEqual([{ a: 1, b: { c: 5, d: 6 } }]);
        });
        test("overwrites existing properties", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 5 } });
            collection.update({ a: 1, b: { c: 5 } }, { $merge: { a: 2, b: { d: 6 } } });
            const found = nrml(collection.find({ d: 6 }));
            expect(found).toEqual([{ a: 2, b: { c: 5, d: 6 } }]);
        });
        test("deep selector merges deeply", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 5 } });
            collection.update({ c: 5 }, { $merge: { a: 2 } });
            const found = nrml(collection.find({ a: 2 }));
            expect(found).toEqual([{ a: 1, b: { c: 5, a: 2 } }]);
        });
    });
});

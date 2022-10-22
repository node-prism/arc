import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";
export default testSuite(async ({ describe }) => {
    describe("ifNull", ({ test }) => {
        test("adds missing properties", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: 1, c: 1 });
            collection.insert({ a: 2, b: 2, c: 2 });
            const found = nrml(collection.find({ a: { $gt: 0 } }, { ifNull: { d: 5 } }));
            expect(found).toEqual([{ a: 1, b: 1, c: 1, d: 5 }, { a: 2, b: 2, c: 2, d: 5 }]);
        });
        test("doesn't overwrite properties", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: 1, c: 1 });
            collection.insert({ a: 2, b: 2, c: 2 });
            const found = nrml(collection.find({ a: { $gt: 0 } }, { ifNull: { c: 5 } }));
            expect(found).toEqual([{ a: 1, b: 1, c: 1 }, { a: 2, b: 2, c: 2 }]);
        });
        test("works when the new value is a complex object", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: 1, c: 1 });
            collection.insert({ a: 2, b: 2, c: 2 });
            const found = nrml(collection.find({ a: { $gt: 0 } }, { ifNull: { d: { e: 5 } } }));
            expect(found).toEqual([{ a: 1, b: 1, c: 1, d: { e: 5 } }, { a: 2, b: 2, c: 2, d: { e: 5 } }]);
        });
        test("works when the new value is a null value", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: 1, c: 1 });
            collection.insert({ a: 2, b: 2, c: 2 });
            const found = nrml(collection.find({ a: { $gt: 0 } }, { ifNull: { d: null } }));
            expect(found).toEqual([{ a: 1, b: 1, c: 1, d: null }, { a: 2, b: 2, c: 2, d: null }]);
        });
        test("ifnull receives a function which is passed the document", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: 1, c: 1 });
            collection.insert({ a: 2, b: 2, c: 2 });
            const found = nrml(collection.find({ a: { $gt: 0 } }, { ifNull: { d: (doc) => doc.a } }));
            expect(found).toEqual([{ a: 1, b: 1, c: 1, d: 1 }, { a: 2, b: 2, c: 2, d: 2 }]);
        });
    });
});

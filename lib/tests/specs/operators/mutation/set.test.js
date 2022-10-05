import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";
export default testSuite(async ({ describe }) => {
    describe("$set", ({ test }) => {
        test("works", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.update({ a: 2 }, { $set: { b: 3 } });
            const found = nrml(collection.find({ a: 2 }));
            expect(found).toEqual([{ a: 2, b: 3 }]);
        });
        test("works deeply", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 5 } });
            collection.update({ c: 5 }, { $set: { d: 6 } });
            const found = nrml(collection.find({ d: 6 }));
            expect(found).toEqual([{ a: 1, b: { c: 5, d: 6 } }]);
        });
        test("will create deep objects", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.update({ a: 1 }, { $set: { b: { c: 5 } } });
            const found = nrml(collection.find({ b: { c: 5 } }));
            expect(found).toEqual([{ a: 1, b: { c: 5 } }]);
        });
        test("does not merge objects, instead overwrites", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 5 } });
            collection.update({ a: 1 }, { $set: { b: { d: 6 } } });
            const found = nrml(collection.find({ a: 1 }));
            expect(found).toEqual([{ a: 1, b: { d: 6 } }]);
        });
        test("shorthand behavior", () => {
            const collection = testCollection();
            collection.insert({ a: 1, b: { c: 1 } });
            collection.insert({ a: 2, b: { c: 2 } });
            collection.update({ a: 1 }, { $set: 11 });
            const found = nrml(collection.find({ a: 11 }));
            expect(found).toEqual([{ a: 11, b: { c: 1 } }]);
        });
    });
});

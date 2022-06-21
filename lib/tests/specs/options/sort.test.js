import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";
export default testSuite(async ({ describe }) => {
    describe("sort", ({ test }) => {
        test("ascending", () => {
            const collection = testCollection();
            collection.insert({ a: 2 });
            collection.insert({ a: 1 });
            collection.insert({ a: 3 });
            const found = nrml(collection.find({ a: { $lt: 5 } }, { sort: { a: 1 } }));
            expect(found).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
        });
        test("ascending update results", () => {
            const collection = testCollection();
            collection.insert({ a: 2 });
            collection.insert({ a: 1 });
            collection.insert({ a: 3 });
            const found = nrml(collection.update({ a: { $lt: 10 } }, { $inc: 5 }, { sort: { a: 1 } }));
            expect(found).toEqual([{ a: 6 }, { a: 7 }, { a: 8 }]);
        });
        test("descending with -1", () => {
            const collection = testCollection();
            collection.insert({ a: 2 });
            collection.insert({ a: 1 });
            collection.insert({ a: 3 });
            const found = nrml(collection.find({ a: { $lt: 5 } }, { sort: { a: -1 } }));
            expect(found).toEqual([{ a: 3 }, { a: 2 }, { a: 1 }]);
        });
        test("descending with 0", () => {
            const collection = testCollection();
            collection.insert({ a: 2 });
            collection.insert({ a: 1 });
            collection.insert({ a: 3 });
            const found = nrml(collection.find({ a: { $lt: 5 } }, { sort: { a: 0 } }));
            expect(found).toEqual([{ a: 3 }, { a: 2 }, { a: 1 }]);
        });
        test("more than one property, asc and desc, numeric and alphanumeric", () => {
            const collection = testCollection();
            collection.insert({ name: "Deanna Troi", age: 28 });
            collection.insert({ name: "Worf", age: 24 });
            collection.insert({ name: "Xorf", age: 24 });
            collection.insert({ name: "Zorf", age: 24 });
            collection.insert({ name: "Jean-Luc Picard", age: 59 });
            collection.insert({ name: "William Riker", age: 29 });
            const found = nrml(collection.find({ age: { $gt: 1 } }, { sort: { age: 1, name: -1 } }));
            expect(found).toEqual([
                { name: "Zorf", age: 24 },
                { name: "Xorf", age: 24 },
                { name: "Worf", age: 24 },
                { name: "Deanna Troi", age: 28 },
                { name: "William Riker", age: 29 },
                { name: "Jean-Luc Picard", age: 59 },
            ]);
        });
    });
});

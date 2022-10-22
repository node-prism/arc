import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";
export default testSuite(async ({ describe }) => {
    describe("$has", ({ test }) => {
        test("works", () => {
            const collection = testCollection();
            collection.insert([{ a: 2 }, { b: 4 }, { c: 5 }, { a: 6 }]);
            const found = nrml(collection.find({ $has: "a" }));
            expect(found).toEqual([{ a: 2 }, { a: 6 }]);
        });
        test("works with more than one property", () => {
            const collection = testCollection();
            collection.insert([{ a: 2, b: 1 }, { b: 4 }, { a: 5 }, { a: 6, b: 3 }]);
            const found = nrml(collection.find({ $has: ["a", "b"] }));
            expect(found).toEqual([{ a: 2, b: 1 }, { a: 6, b: 3 }]);
        });
        test("works with $not", () => {
            const collection = testCollection();
            collection.insert([{ a: 2 }, { b: 4 }, { c: 5 }, { a: 6 }]);
            const found = nrml(collection.find({ $not: { $has: "a" } }));
            expect(found).toEqual([
                { xxx: "xxx" },
                { yyy: "yyy" },
                { zzz: "zzz" },
                { b: 4 }, { c: 5 }
            ]);
        });
    });
});

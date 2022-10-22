import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";
export default testSuite(async ({ describe }) => {
    describe("$not", ({ test }) => {
        test("works", () => {
            const collection = testCollection();
            collection.insert([
                { a: 1, b: 2, c: 3 },
                { a: 2, b: 2, c: 3 },
            ]);
            const found = nrml(collection.find({ $not: { a: 1 } }));
            expect(found).toEqual([
                { xxx: "xxx" },
                { yyy: "yyy" },
                { zzz: "zzz" },
                { a: 2, b: 2, c: 3 }
            ]);
        });
        test("works with $and", () => {
            const collection = testCollection();
            collection.insert([
                { a: 1, b: 2, c: 3 },
                { a: 2, b: 2, c: 3 },
                { a: 3, b: 2, c: 3 },
            ]);
            const found = nrml(collection.find({ $and: [{ $not: { a: 1 } }, { $not: { a: 2 } }] }));
            expect(found).toEqual([
                { xxx: "xxx" },
                { yyy: "yyy" },
                { zzz: "zzz" },
                { a: 3, b: 2, c: 3 }
            ]);
        });
        test("works with other mods", () => {
            const collection = testCollection();
            collection.insert([
                { a: 1, b: 2, c: 3 },
                { a: 2, b: 2, c: 3 },
                { a: 3, b: 2, c: 3 },
            ]);
            const found = nrml(collection.find({ $not: { a: { $lte: 2 } } }));
            expect(found).toEqual([
                { xxx: "xxx" },
                { yyy: "yyy" },
                { zzz: "zzz" },
                { a: 3, b: 2, c: 3 }
            ]);
        });
        test("works with $and", () => {
            const collection = testCollection();
            collection.insert([
                { a: 1, b: 2, c: 3 },
                { a: 2, b: 2, c: 3 },
                { a: 3, b: 2, c: 3 },
                { a: 5, b: 2, c: 3 },
                { a: 7, b: 2, c: 3 },
            ]);
            const found = nrml(collection.find({ $and: [{ $not: { a: { $lte: 2 } } }, { $not: { a: { $gte: 5 } } }] }));
            expect(found).toEqual([
                { xxx: "xxx" },
                { yyy: "yyy" },
                { zzz: "zzz" },
                { a: 3, b: 2, c: 3 }
            ]);
        });
        test("expects all provided cases to be true (does not behave as $or)", () => {
            const collection = testCollection();
            collection.insert([
                { a: 1, b: 2, c: 3 },
                { a: 2, b: 2, c: 3 },
                { a: 3, b: 3, c: 3 },
            ]);
            const found = nrml(collection.find({ $not: { a: 1, b: 2 } }));
            expect(found).toEqual([
                { xxx: "xxx" },
                { yyy: "yyy" },
                { zzz: "zzz" },
                { a: 2, b: 2, c: 3 },
                { a: 3, b: 3, c: 3 }, // <-- matches because a is not 1 AND b is not 2
            ]);
        });
    });
});

import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";
export default testSuite(async ({ describe }) => {
    describe("$or", ({ test }) => {
        test("works", () => {
            const collection = testCollection();
            collection.insert([
                { a: 1, b: 1, c: 1 },
                { a: 1, b: 1, c: 2 },
                { a: 1, b: 2, c: 3 },
                { a: 2, b: 2, c: 3 },
            ]);
            const found = nrml(collection.find({ $or: [{ a: 1 }, { c: 2 }] }));
            expect(found).toEqual([
                { a: 1, b: 1, c: 1 },
                { a: 1, b: 1, c: 2 },
                { a: 1, b: 2, c: 3 },
            ]);
        });
        test("nested operators", () => {
            const collection = testCollection();
            collection.insert([
                { foo: "bar", num: 5 },
                { foo: "bee", num: 8 },
                { foo: "baz", num: 10 },
                { foo: "boo", num: 20 },
            ]);
            const found = nrml(collection.find({ $or: [{ foo: { $includes: "ba" } }, { num: { $lt: 9 } }] }));
            expect(found).toEqual([
                { foo: "bar", num: 5 },
                { foo: "bee", num: 8 },
                { foo: "baz", num: 10 },
            ]);
        });
    });
});

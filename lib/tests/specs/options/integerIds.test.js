import { testSuite, expect } from "manten";
import { ID_KEY } from "../../../src";
import { nrml, testCollection } from "../../common";
export default testSuite(async ({ describe }) => {
    describe("integerIds", ({ test }) => {
        test("works", () => {
            const collection = testCollection({ integerIds: true });
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const found = nrml(collection.find({ a: { $lt: 5 } }), { keepIds: true });
            // these start at 3 because testCollection adds 3 documents.
            expect(found).toEqual([
                { a: 1, [ID_KEY]: 3 },
                { a: 2, [ID_KEY]: 4 },
                { a: 3, [ID_KEY]: 5 },
            ]);
        });
    });
});

import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$not", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 1, c: 1 },
        { a: 1, b: 1, c: 1 },
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $not: { a: 1 } }));
      expect(found).toEqual([{ a: 2, b: 2, c: 3 }]);
    });
  });
});

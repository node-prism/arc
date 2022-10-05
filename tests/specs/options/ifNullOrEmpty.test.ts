import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("ifNullOrEmpty", ({ test }) => {
    test("adds missing properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2, d: [] });
      const found = nrml(collection.find({ a: { $gt: 0 } }, { ifNullOrEmpty: { d: 5 } }));
      expect(found).toEqual([{ a: 1, b: 1, c: 1, d: 5 }, { a: 2, b: 2, c: 2, d: 5 }]);
    });
  });
});


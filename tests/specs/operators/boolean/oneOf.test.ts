import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$oneOf", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.insert({ a: 3 });
      const found = nrml(collection.find({ a: { $oneOf: [2, 3] } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ a: 2 }, { a: 3 }]);
    });
  });
});

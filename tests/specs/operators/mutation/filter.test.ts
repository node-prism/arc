import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$filter", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      const filterfn = (doc: any) => doc.a === 1;
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.insert({ a: 3 });
      collection.update({ $has: "a" }, { $filter: filterfn });
      const found = nrml(collection.find({ $has: "a" }));
      expect(found).toEqual([{ a: 1 }]);
    });

    test("works against a nested array", () => {
      const collection = testCollection();
      collection.insert({ a: [1, 2, 3, 4, 5] });
      collection.update({ $has: "a" }, { $filter: { a: (doc: any) => doc > 3 } });
      const found = nrml(collection.find({ $has: "a" }));
      expect(found).toEqual([{ a: [4, 5] }]);
    });
  });
});


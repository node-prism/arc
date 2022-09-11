import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("filter", ({ test }) => {

    test("works", () => {
      const collection = testCollection<{a: number}>();
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.insert({ a: 3 });
      const found = nrml(collection.filter((doc) => doc.a > 1));
      expect(found).toEqual([{ a: 2 }, { a: 3 }]);
    });

    test("works with nested properties", () => {
      const collection = testCollection<{a: {b: number}}>();
      collection.insert({ a: { b: 1 } });
      collection.insert({ a: { b: 2 } });
      collection.insert({ a: { b: 3 } });
      const found = nrml(collection.filter((doc) => doc.a.b > 1));
      expect(found).toEqual([{ a: { b: 2 } }, { a: { b: 3 } }]);
    });

  });
});

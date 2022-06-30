import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("skip", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: { $gt: 0 } }, { skip: 1 }));
      expect(found).toEqual([{ a: 2, b: 2, c: 2 }, { a: 3, b: 3, c: 3 }]);
    });
  });

  describe("take", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: { $gt: 0 } }, { take: 1 }));
      expect(found).toEqual([{ a: 1, b: 1, c: 1 }]);
    });
  });

  describe("skip take", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: { $gt: 0 } }, { skip: 1, take: 1 }));
      expect(found).toEqual([{ a: 2, b: 2, c: 2 }]);
    });
  });
});

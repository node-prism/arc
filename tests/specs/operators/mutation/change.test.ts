import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$change", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.update({ a: 2 }, { $change: { a: 3 } });
      const found = nrml(collection.find({ a: 3 }));
      expect(found).toEqual([{ a: 3 }]);
    });
    test("works deeply", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ c: 5 }, { $change: { c: 6 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 6 } }]);
    });
    test("doesn't create new properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $change: { b: 1 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1 }]);
    });
  });
});

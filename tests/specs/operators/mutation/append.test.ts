import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$append", ({ test }) => {
    test("an object", () => {
      const collection = testCollection();
      collection.insert({ a: [1, 2, 3] });
      collection.update({ a: { $includes: 2 } }, { $append: { b: [4, 5, 6] } });
      const found = nrml(collection.find({ b: { $includes: 5 } }));
      expect(found).toEqual([{ a: [1, 2, 3], b: [4, 5, 6] }]);
    });
    test("an array, deeply", () => {
      const collection = testCollection();
      collection.insert({ a: { b: [1, 2, 3] } });
      collection.update({ b: { $includes: 2 } }, { $append: { c: [4, 5, 6] } });
      const found = nrml(collection.find({ c: { $includes: 5 } }));
      expect(found).toEqual([{ a: { b: [1, 2, 3], c: [4, 5, 6] } }]);
    });
    // this does not preserve c: 5, because this is NOT an object merge.
    // use $merge for this type of behavior.
    test("shallow selector, deep update", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $append: { b: { d: 6 } } });
      const found = nrml(collection.find({ d: 6 }));
      expect(found).toEqual([{ a: 1, b: { d: 6 } }]);
    });
    test("deep selector, deep update", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ c: 5 }, { $append: { d: 6 } });
      const found = nrml(collection.find({ d: 6 }));
      expect(found).toEqual([{ a: 1, b: { c: 5, d: 6 } }]);
    });
  });
});

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

    test("works with dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert({ a: { b: 1 } });
      collection.insert({ a: { b: 2 } });
      collection.insert({ a: { b: 3 } });
      const found = nrml(collection.find({ "a.b": { $oneOf: [2, 3] } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ a: { b: 2 } }, { a: { b: 3 } }]);
    });

    test("works deeply without dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert({ a: { b: { c: 1 } } });
      collection.insert({ a: { b: { c: 2 } } });
      collection.insert({ a: { b: { c: 3 } } });
      const found = nrml(collection.find({ a: { b: { c: { $oneOf: [2, 3] } } } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ a: { b: { c: 2 } } }, { a: { b: { c: 3 } } }]);
    });
  });
});

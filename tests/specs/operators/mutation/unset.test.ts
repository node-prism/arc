import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$unset", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 2, c: 3 });
      collection.update({ a: 1 }, { $unset: "c" });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: 2 }]);
    });

    test("dot notation", () => {
      const collection = testCollection();
      collection.insert({ a: { b: { c: 1, d: 2, e: 3 } } });
      collection.update({ e: 3 }, { $unset: "a.b.c" });
      const found = nrml(collection.find({ e: 3 }));
      expect(found).toEqual([{ a: { b: { d: 2, e: 3 } } }]);
    });

    test("array", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: 2 }, e: 3 });
      collection.update({ a: 1 }, { $unset: ["e", "b.c"] });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { d: 2 } }]);
    });

    test("array, nested query", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: 2 }, e: 3 });
      collection.update({ b: { d: 2 } }, { $unset: "b.d" });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1 }, e: 3 }]);
    });
  });
});

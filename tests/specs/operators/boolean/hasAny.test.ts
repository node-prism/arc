import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$hasAny", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert([{ a: 2 }, { b: 4 }, { c: 5 }, { a: 6 }]);
      const found = nrml(collection.find({ $hasAny: "a" }));
      expect(found).toEqual([{ a: 2 }, { a: 6 }]);
    });

    test("works with more than one property", () => {
      const collection = testCollection();
      collection.insert([{ a: 2, b: 1 }, { b: 4 }, { a: 5 }, { a: 6, b: 3 }, { c: 5 }]);
      const found = nrml(collection.find({ $hasAny: ["a", "b"] }));
      expect(found).toEqual([{ a: 2, b: 1 }, { b: 4 }, { a: 5 }, { a: 6, b: 3 }]);
    });

    test("works with $not", () => {
      const collection = testCollection();
      collection.insert([{ a: 2 }, { b: 4 }, { c: 5 }, { a: 6 }]);
      const found = nrml(collection.find({ $not: { $hasAny: ["a", "b"] } }));
      expect(found).toEqual([
        { xxx: "xxx" },
        { yyy: "yyy" },
        { zzz: "zzz" },
        { c: 5 }
      ]);
    });

    test("works with dot notation", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: 2 } }, { b: 4 }, { c: 5 }, { a: { b: 6 } }]);
      const found = nrml(collection.find({ $hasAny: "a.b" }));
      expect(found).toEqual([{ a: { b: 2 } }, { a: { b: 6 } }]);
    });

    test("works with leading dot notation to narrowly scope $hasAny", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: { c: { d: 2 } } } },
        { b: 4 },
        { c: 5 },
        { a: { b: { c: { e: 6 } } } }
      ]);
      const found = nrml(collection.find({ "a.b.c": { $hasAny: "d"} }));
      expect(found).toEqual([{ a: { b: { c: { d: 2 } } } }]);
    });
  });
});

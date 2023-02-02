import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$and", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 1, c: 1 },
        { a: 1, b: 1, c: 1 },
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $and: [{ a: 1 }, { b: 2 }] }));
      expect(found).toEqual([{ a: 1, b: 2, c: 3 }]);
    });

    test("nested operators", () => {
      const collection = testCollection();
      collection.insert([
        { foo: "bar", num: 5 },
        { foo: "baz", num: 10 },
        { foo: "boo", num: 20 },
      ]);
      const found = nrml(collection.find({ $and: [{ foo: { $includes: "ba" } }, { num: { $gt: 9 } }] }));
      expect(found).toEqual([{ foo: "baz", num: 10 }]);
    });

    test("deep selectors", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: { c: 1, d: 1 } } },
        { a: { b: { c: 1, d: 1 } } },
        { a: { b: { c: 1, d: 3 } } },
      ]);
      const found = nrml(collection.find({ $and: [{ a: { b: { c: 1 } } }, { a: { b: { d: 3 } } }] }));
      expect(found).toEqual([{ a: { b: { c: 1, d: 3 } } }]);
    });

    test("shallow and deep selectors", () => {
      const collection = testCollection();
      collection.insert([{ a: 15, b: 1 }, { a: 15, b: { c: { d: 100 } } }]);
      const found = nrml(collection.find({ $and: [{ a: 15 }, { b: { c: { d: 100 } } }] }));
      expect(found).toEqual([{ a: 15, b: { c: { d: 100 } } }]);
    });

    test("functions as conditions", () => {
      const collection = testCollection();
      collection.insert([
        { foo: "bar", num: 5 },
        { foo: "baz", num: 10 },
        { foo: "bazzz", num: 20 },
      ]);
      const found = nrml(collection.find({ $and: [{ foo: { $includes: "ba" } }, { num: { $gt: 9 } }, { num: (v: number) => v % 10 === 0 }] }));
      expect(found).toEqual([{ foo: "baz", num: 10 }, { foo: "bazzz", num: 20 }]);
    });

    test("and matches while respecting other query parameters", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, num: 5 },
        { a: 2, num: 10 },
        { a: 3, num: 20 },
      ]);
      const found = nrml(collection.find({ a: 2, $and: [{ num: { $gt: 0 } }, { num: { $lt: 100 } }]  }));
      expect(found).toEqual([{ a: 2, num: 10 }]);
    });

    test("works with dot notation", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: 1, c: 1 }, d: 1 },
        { a: { b: 1, c: 1 }, d: 1 },
        { a: { b: 1, c: 3 }, d: 3 },
      ]);
      const found = nrml(collection.find({ $and: [{ "a.b": 1 }, { "a.c": 3 }] }));
      expect(found).toEqual([{ a: { b: 1, c: 3 }, d: 3 }]);
    });
  });
});

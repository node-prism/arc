import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$not", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $not: { a: 1 } }));
      expect(found).toEqual([
        { xxx: "xxx" },
        { yyy: "yyy" },
        { zzz: "zzz" },
        { a: 2, b: 2, c: 3 }
      ]);
    });
    test("works with $and", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
        { a: 3, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $and: [{ $not: { a: 1 } }, { $not: { a: 2 }}] }));
      expect(found).toEqual([
        { xxx: "xxx" },
        { yyy: "yyy" },
        { zzz: "zzz" },
        { a: 3, b: 2, c: 3 }
      ]);
    });
    test("works with other mods", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
        { a: 3, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $not: { a: { $lte: 2 }}}));
      expect(found).toEqual([
        { xxx: "xxx" },
        { yyy: "yyy" },
        { zzz: "zzz" },
        { a: 3, b: 2, c: 3 }
      ]);
    });
    test("works with $and", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
        { a: 3, b: 2, c: 3 },
        { a: 5, b: 2, c: 3 },
        { a: 7, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $and: [{ $not: { a: { $lte: 2 }}}, { $not: { a: { $gte: 5 }}}] }));
      expect(found).toEqual([
        { xxx: "xxx" },
        { yyy: "yyy" },
        { zzz: "zzz" },
        { a: 3, b: 2, c: 3 }
      ]);
    });
    test("expects all provided cases to be true (does not behave as $or)", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
        { a: 3, b: 3, c: 3 },
      ]);
      const found = nrml(collection.find({ $not: { a: 1, b: 2 }}));
      expect(found).toEqual([
        { xxx: "xxx" },
        { yyy: "yyy" },
        { zzz: "zzz" },
        { a: 2, b: 2, c: 3 }, // <-- matches because a is not 1
        { a: 3, b: 3, c: 3 }, // <-- matches because a is not 1 AND b is not 2
      ]);
    });

    test("works with dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: 1 } }, { a: { b: 2 } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b": 1 }}));
      expect(found).toEqual([
        { a: { b: 2 } },
      ]);
    });

    test("works with leading properties", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: 1 } }, { a: { b: 2 } }
      ]);
      const found = nrml(collection.find({ a: { $not: { b: 1 }}}));
      expect(found).toEqual([
        { a: { b: 2 } },
      ]);
    });

    test("works with leading properties very deeply", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: 1 } } } }, { a: { b: { c: { d: 2 } } } }
      ]);
      const found = nrml(collection.find({ a: { b: { c: { $not: { d: 1 }}}}}));
      expect(found).toEqual([
        { a: { b: { c: { d: 2 } } } },
      ]);
    });

    test("works with $includes -> $not: { $includes: ... }", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: [1, 2, 3] }, { a: [2, 3, 4] }
      ]);
      const found = nrml(collection.find({ $not: { a: { $includes: 1 } } }));
      expect(found).toEqual([
        { a: [2, 3, 4] },
      ]);
    });

    test("works with $includes, deeply", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: [1, 2, 3] } }, { a: { b: [2, 3, 4] } }
      ]);
      const found = nrml(collection.find({ $not: { a: { b: { $includes: 1 } } } }));
      expect(found).toEqual([{ a: { b: [2, 3, 4] } }]);
    });

    test("works with $includes, very deeply", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: [1, 2, 3] } } } }, { a: { b: { c: { d: [2, 3, 4] } } } }
      ]);
      const found = nrml(collection.find({ $not: { a: { b: { c: { d: { $includes: 1 } } } } } }));
      expect(found).toEqual([{ a: { b: { c: { d: [2, 3, 4] } } } }]);
    });

    test("works with $includes, deep, using dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: [1, 2, 3] } }, { a: { b: [2, 3, 4] } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b": { $includes: 1 } } }));
      expect(found).toEqual([{ a: { b: [2, 3, 4] } }]);
    });

    test("works with $includes, infinitely deep, using dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: [1, 2, 3] } } } }, { a: { b: { c: { d: [2, 3, 4] } } } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b.c.d": { $includes: 1 } } }));
      expect(found).toEqual([{ a: { b: { c: { d: [2, 3, 4] } } } }]);
    });

    test("works with $oneOf, infinitely deep, using dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: 1 } } } }, { a: { b: { c: { d: 2 } } } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b.c.d": { $oneOf: [1, 2] } } }));
      expect(found).toEqual([]);

      const found2 = nrml(collection.find({ $not: { "a.b.c.d": { $oneOf: [1, 3] } } }));
      expect(found2).toEqual([{ a: { b: { c: { d: 2 } } } }]);
    });

    test("works with $oneOf, infinitely deep, not dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: 1 } } } }, { a: { b: { c: { d: 2 } } } }
      ]);
      const found = nrml(collection.find({ $not: { a: { b: { c: { d: { $oneOf: [1, 2] } } } } } }));
      expect(found).toEqual([]);

      const found2 = nrml(collection.find({ $not: { a: { b: { c: { d: { $oneOf: [1, 3] } } } } } }));
      expect(found2).toEqual([{ a: { b: { c: { d: 2 } } } }]);
    });

    test("works with $length, infinitely deep, using dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: [1, 2, 3] } } } }, { a: { b: { c: { d: [2, 3, 4, 5] } } } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b.c.d": { $length: 3 } } }));
      expect(found).toEqual([{ a: { b: { c: { d: [2, 3, 4, 5] } } } }]);
    });

    test("works with $hasAny, infinitely deep, using dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { d: { foo: "foo", bar: "bar", baz: "baz" } } } } },
        { a: { b: { c: { d: { foo: "foo", bar: "bar" } } } } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b.c.d": { $hasAny: ["foo", "bar"] } } }));
      expect(found).toEqual([]);

      const found2 = nrml(collection.find({ $not: { "a.b.c.d": { $hasAny: ["baz"] } } }));
      expect(found2).toEqual([{ a: { b: { c: { d: { foo: "foo", bar: "bar" } } } } }]);
    });

    test("works with $has, infinitely deep, using dot notation", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
      { a: { b: { c: { d: { foo: "foo", bar: "bar", baz: "baz" } } } } },
      { a: { b: { c: { d: { foo: "foo", bar: "bar" } } } } }
      ]);
      const found = nrml(collection.find({ $not: { "a.b.c.d": { $has: ["foo", "bar"] } } }));
      expect(found).toEqual([]);

      const found2 = nrml(collection.find({ $not: { "a.b.c.d": { $has: ["baz"] } } }));
      expect(found2).toEqual([{ a: { b: { c: { d: { foo: "foo", bar: "bar" } } } } }]);
    });
  });
});

import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$xor", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: 1, c: 1 },
        { a: 1, b: 2, c: 2 }, // not included because a is 1 and b is 2, which matches the query exactly
        { a: 2, b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $xor: [{ a: 1 }, { b: 2 }] }));
      expect(found).toEqual([
        { a: 1, b: 1, c: 1 }, // <-- a was 1, but but was not 2
        { a: 2, b: 2, c: 3 }, // <-- a was not 1, but b was 2
      ]);
    });

    test("with nested operators", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1 },
        { b: 2 },
        { c: 3 },
        { a: 1, b: 2 }, // not included, because both properties exist in the query
        { a: 1, c: 3 },
        { b: 2, c: 3 },
      ]);
      const found = nrml(collection.find({ $xor: [{ $has: "a" }, { $has: "b" }] }));
      expect(found).toEqual([
        { a: 1 }, // <-- only has "a"
        { b: 2 }, // <-- only has "b"
        { a: 1, c: 3 }, // <-- only has "a"
        { b: 2, c: 3 }, // <-- only has "b"
      ]);
    });

    test("nested operators", () => {
      const collection = testCollection();
      collection.insert([
        { foo: "bar", num: 5 }, // not included, because properties both match the query
        { foo: "bee", num: 8 },
        { foo: "baz", num: 10 },
        { foo: "boo", num: 20 }, // not included, because neither property matches the query
      ]);
      const found = nrml(collection.find({ $xor: [{ foo: { $includes: "ba" } }, { num: { $lt: 9 } }] }));
      expect(found).toEqual([
        { foo: "bee", num: 8 }, // <-- foo does not include "ba", but num is less than 9
        { foo: "baz", num: 10 }, // <-- foo includes "ba", but num is not less than 9
      ]);
    });

    test("nested operators, dot notation, implicitly and explicitly deep", () => {
      const collection = testCollection({ populate: false });
      collection.insert([
        { a: { b: { c: { foo: "bar", num: 5 } } } }, // not included, because properties both match the query
        { a: { b: { c: { foo: "bee", num: 8 } } } },
        { a: { b: { c: { foo: "baz", num: 10 } } } },
        { a: { b: { c: { foo: "boo", num: 20 } } } }, // not included, because neither property matches the query
      ]);
      const found = nrml(collection.find({ $xor: [{ "a.b.c.foo": { $includes: "ba" } }, { num: { $lt: 9 } }] }));
      expect(found).toEqual([
        { a: { b: { c: { foo: "bee", num: 8 } } } }, // <-- foo does not include "ba", but num is less than 9
        { a: { b: { c: { foo: "baz", num: 10 } } } }, // <-- foo includes "ba", but num is not less than 9
      ]);
    });

    test("throws when given anything other than 2 parameters", () => {
      const collection = testCollection();
      expect(() => collection.find({ $xor: [{ a: 1 }, { b: 2 }, { c: 3 }] })).toThrow();
      expect(() => collection.find({ $xor: [{ a: 1 }] })).toThrow();
    });
  });
});

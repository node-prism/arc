import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("find", ({ test }) => {

    test("no results should return an empty array", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.insert({ a: 3 });
      const found = nrml(collection.find({ a: 4 }));
      expect(found).toEqual([]);
    });

    test("empty find returns everything", () => {
      const collection = testCollection();
      collection.remove({ xxx: "xxx" });
      collection.remove({ yyy: "yyy" });
      collection.remove({ zzz: "zzz" });
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.insert({ a: 3 });
      const found = nrml(collection.find({}));
      expect(found).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
    });

    test("simple find", () => {
      const collection = testCollection();
      collection.insert({ foo: "bar" });
      collection.insert({ foo: "baz" });
      collection.insert({ foo: "boo" });
      const found = nrml(collection.find({ foo: "bar" }));
      expect(found).toEqual([{ foo: "bar" }]);
    });

    test("simple find - deep false", () => {
      const collection = testCollection();
      collection.insert({ foo: { bar: "bar" } });
      collection.insert({ foo: { bar: "baz" } });
      collection.insert({ foo: { bar: "boo" } });
      const found = nrml(collection.find({ bar: { $includes: "ba" } }, { deep: false }));
      expect(found).toEqual([]);
    });

    test("simple find - deep true", () => {
      const collection = testCollection();
      collection.insert({ foo: { bar: "baz" } });
      collection.insert({ foo: { bar: "boo" } });
      collection.insert({ foo: { bar: "baz" } });
      const found = nrml(collection.find({ foo: { bar: "baz" } }));
      expect(found).toEqual([{ foo: { bar: "baz" } }, { foo: { bar: "baz" } }]);
    });

    test("normal match if deep is false but toplevel matches", () => {
      const collection = testCollection();
      collection.insert({ foo: { bar: "bar" } });
      collection.insert({ foo: { bar: "baz" } });
      collection.insert({ foo: { bar: "boo" } });
      const found = nrml(collection.find({ foo: { bar: "bar" } }, { deep: false }));
      expect(found).toEqual([{ foo: { bar: "bar" } }]);
    });

    test("multilevel results", () => {
      const collection = testCollection();
      collection.insert({ bar: "baz" });
      collection.insert({ foo: { bar: "boo" } });
      collection.insert({ foo: { bar: "baz" } });
      const found = nrml(collection.find({ foo: { bar: "baz" } }));
      expect(found).toEqual([{ bar: "baz" }, { foo: { bar: "baz" } }]);
    });

    test("array literal", () => {
      const collection = testCollection();
      collection.insert({ foo: ["bar", "baz"] });
      collection.insert({ foo: ["bar", "boo"] });
      collection.insert({ foo: ["bar", "baz"] });
      const found = nrml(collection.find({ foo: ["bar", "baz"] }));
      expect(found).toEqual([{ foo: ["bar", "baz"] }, { foo: ["bar", "baz"] }]);
    });

    test("array literal should exclude items that don't match the exact array", () => {
      const collection = testCollection();
      collection.insert({ foo: ["bar", 1] });
      collection.insert({ foo: ["bar", 2] });
      collection.insert({ foo: ["bar", 2, 2] });
      collection.insert({ foo: ["bar", 3] });
      collection.insert({ a: { b: { foo: ["bar", 2] } } });
      const found = nrml(collection.find({ foo: ["bar", 2] }));
      expect(found).toEqual([{ foo: ["bar", 2] }, { a: { b: { foo: ["bar", 2] } } }]);
    });

    test("find array using object syntax", () => {
      const collection = testCollection();
      collection.insert({ a: { b: [ {c: 1}, {c: 2}, {c: 3} ] } });
      const found = nrml(collection.find({ b: { c: 2 } }));
      expect(found).toEqual([{ a: { b: [ {c: 1}, {c: 2}, {c: 3} ] } }]);
    });

    test("multiple queries, multiple results", () => {
      const collection = testCollection();
      collection.insert({ x: { a: 1 } });
      collection.insert({ y: { b: 1 } });
      const found = nrml(collection.find([{ a: 1 }, { b: 1 }]));
      expect(found).toEqual([{ x: { a: 1 } }, { y: { b: 1 } }]);
    });

    test("really deep specificity", () => {
      const collection = testCollection();
      collection.insert({ a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: 1 } } } } } } } } } } });
      const found = nrml(collection.find({ a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: 1 } } } } } } } } } } }));
      expect(found).toEqual([{ a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: 1 } } } } } } } } } } }]);
    });

  });
});

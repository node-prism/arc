import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$includes", ({ test }) => {
    test("simple string", () => {
      const collection = testCollection();
      collection.insert({ foo: "bar" });
      collection.insert({ foo: "baz" });
      collection.insert({ foo: "boo" });
      const found = nrml(collection.find({ foo: { $includes: "ba" } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ foo: "bar" }, { foo: "baz" }]);
    });

    test("simple string deep", () => {
      const collection = testCollection();
      collection.insert({ a: { b: { foo: "bar" } } });
      collection.insert({ a: { b: { foo: "baz" } } });
      collection.insert({ a: { b: { foo: "boo" } } });
      const found = nrml(collection.find({ a: { b: { foo: { $includes: "ba" } } } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ a: { b: { foo: "bar" } } }, { a: { b: { foo: "baz" } } }]);
    });

    test("simple array", () => {
      const collection = testCollection();
      collection.insert({ foo: [1, 2, 3] });
      collection.insert({ foo: [1, 2, 4] });
      collection.insert({ foo: [5, 6, 7] });
      const found = nrml(collection.find({ foo: { $includes: 2 } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ foo: [1, 2, 3] }, { foo: [1, 2, 4] }]);
    });

    test("simply array deep", () => {
      const collection = testCollection();
      collection.insert({ a: { b: [1, 2, 3] }});
      collection.insert({ a: { b: [1, 2, 4] }});
      collection.insert({ a: { b: [5, 6, 7] }});
      const found = nrml(collection.find({ a: { b: { $includes: 2 } } }));
      expect(found.length).toEqual(2);
      expect(found).toEqual([{ a: { b: [1, 2, 3] } }, { a: { b: [1, 2, 4] } }]);
    });

    test("includes array", () => {
      const collection = testCollection();
      collection.insert({ a: { b: [1, 2, 3] }});
      collection.insert({ a: { b: [1, 2, 4] }});
      collection.insert({ a: { b: [5, 6, 7] }});
      const found = nrml(collection.find({ a: { b: { $includes: [1, 2] } } }));
      expect(found).toEqual([{ a: { b: [1, 2, 3] } }, { a: { b: [1, 2, 4] } }]);
    });
  });
});

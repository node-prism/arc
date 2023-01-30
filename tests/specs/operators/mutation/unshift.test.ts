import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$unshift", ({ test }) => {

    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: [1] });
      collection.update({ a: 1 }, { $unshift: { b: 2 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: [2, 1] }]);
    });

    test("unshift more than one value", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: [1] });
      collection.update({ a: 1 }, { $unshift: { b: [2, 3] } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: [2, 3, 1] }]);
    });

    test("unshift with dot notation", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: [1, 2]} });
      collection.update({ c: 1 }, { $unshift: { "b.d": [3, 4] } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1, d: [3, 4, 1, 2] } }]);
    });

    test("unshift with dot notation, multiple unshifts", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: [1, 2]}, e: { c: 1, d: [1, 2] } });
      collection.update({ c: 1 }, { $unshift: { "b.d": [3, 4], "e.d": [3, 4] } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1, d: [3, 4, 1, 2] }, e: { c: 1, d: [3, 4, 1, 2] } }]);
    });

    test("unshift an object to an array of objects", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: [{ name: "a" }] });
      collection.update({ a: 1 }, { $unshift: { b: { name: "b" } } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: [{ name: "b" }, { name: "a" }] }]);
    });

    test("unshift with dot notation, an object to an array of objects", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: [{ name: "a" }] } });
      collection.update({ c: 1 }, { $unshift: { "b.d": { name: "b" } } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1, d: [{ name: "b" }, { name: "a" }] } }]);
    });

    test("unshift does not create the target array if it doesn't exist", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $unshift: { b: 1 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1 }]);
    });

    test("unshift with dot notation does not create the target array if it does not exist", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $unshift: { "b.c": 1 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1 }]);
    });

  });
});


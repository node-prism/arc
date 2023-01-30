import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$push", ({ test }) => {

    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: [1] });
      collection.update({ a: 1 }, { $push: { b: 2 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: [1, 2] }]);
    });

    test("push more than one value", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: [1] });
      collection.update({ a: 1 }, { $push: { b: [2, 3] } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: [1, 2, 3] }]);
    });

    test("push with dot notation", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: [1, 2]} });
      collection.update({ c: 1 }, { $push: { "b.d": [3, 4] } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1, d: [1, 2, 3, 4] } }]);
    });

    test("push with dot notation, multiple pushes", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: [1, 2]}, e: { c: 1, d: [1, 2] } });
      collection.update({ c: 1 }, { $push: { "b.d": [3, 4], "e.d": [3, 4] } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1, d: [1, 2, 3, 4] }, e: { c: 1, d: [1, 2, 3, 4] } }]);
    });

    test("push an object to an array of objects", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: [{ name: "a" }] });
      collection.update({ a: 1 }, { $push: { b: { name: "b" } } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: [{ name: "a" }, { name: "b" }] }]);
    });

    test("push with dot notation, an object to an array of objects", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 1, d: [{ name: "a" }] } });
      collection.update({ c: 1 }, { $push: { "b.d": { name: "b" } } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: 1, d: [{ name: "a" }, { name: "b" }] } }]);
    });

    test("push does not create the target array if it doesn't exist", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $push: { b: 1 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1 }]);
    });

    test("push with dot notation does not create the target array if it does not exist", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $push: { "b.c": 1 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1 }]);
    });

  });
});


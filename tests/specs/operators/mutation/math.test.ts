import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$inc", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $inc: { a: 5 } });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 6, b: { c: 5 } }]);
    });

    test("works, syntax 2", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $inc: 5 });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 6, b: { c: 5 } }]);
    });

    test("increments all properties in query", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 2 });
      collection.update({ a: 1, b: 2 }, { $inc: 5 });
      const found = nrml(collection.find({ a: 6 }));
      expect(found).toEqual([{ a: 6, b: 7 }]);
    });

    test("implcitly creates properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $inc: { b: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: 5 }]);
    });

    test("syntax 2 increments multiple properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 2, c: 3 });
      collection.update({ a: 1, b: 2, c: 3 }, { $inc: 5 });
      const found = nrml(collection.find({ a: 6, b: 7, c: 8 }));
      expect(found).toEqual([{ a: 6, b: 7, c: 8 }]);
    });

    test("deep selector, deep increment", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1, e: 1 } } });
      collection.update({ d: 1 }, { $inc: { d: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 6, e: 1 } } }]);
    });

    test("deep selector, deep increment, syntax 2", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1, e: 1 } } });
      collection.update({ d: 1 }, { $inc: 5 });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 6, e: 1 } } }]);
    });

    test("deep selector, implicitly creates properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1 } } });
      collection.update({ d: 1 }, { $inc: { e: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 1, e: 5 } } }]);
    });
  });

  describe("$dec", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $dec: { a: 5 } });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: -4, b: { c: 5 } }]);
    });

    test("works, syntax 2", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $dec: 5 });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: -4, b: { c: 5 } }]);
    });

    test("implicitly creates properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $dec: { b: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: -5 }]);
    });
  });

  describe("$mult", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ a: 5, b: { c: 5 } });
      collection.update({ a: 5 }, { $mult: { a: 5 } });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 25, b: { c: 5 } }]);
    });

    test("works, syntax 2", () => {
      const collection = testCollection();
      collection.insert({ a: 5, b: { c: 5 } });
      collection.update({ a: 5 }, { $mult: 5 });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 25, b: { c: 5 } }]);
    });

    test("implicitly creates properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $mult: { b: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: 5 }]);
    });

    test("deep selector, implicitly creates properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1 } } });
      collection.update({ d: 1 }, { $inc: { e: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 1, e: 5 } } }]);
    });
  });
});

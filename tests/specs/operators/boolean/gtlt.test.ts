import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {

  describe("$gt", ({ test }) => {

    test("works", () => {
      const collection = testCollection();
      collection.insert([{ a: 2 }, { a: 4 }, { a: 5 }, { a: 6 }]);
      const found = nrml(collection.find({ a: { $gt: 4 } }));
      expect(found).toEqual([{ a: 5 }, { a: 6 }]);
    });

    test("works with strings", () => {
      const collection = testCollection();
      collection.insert([{ a: "a" }, { a: "b" }, { a: "c" }, { a: "d" }]);
      const found = nrml(collection.find({ a: { $gt: "b" } }));
      expect(found).toEqual([{ a: "c" }, { a: "d" }]);
    });

    test("works with array lengths", () => {
      const collection = testCollection();
      collection.insert([{ a: [1, 2] }, { a: [1, 2, 3] }, { a: [1, 2, 3, 4] }]);
      const found = nrml(collection.find({ a: { $gt: 3 } }));
      expect(found).toEqual([{ a: [1, 2, 3, 4] }]);
    });

    test("works with deeply nested properties using dot notation", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: { c: 2 } } }, { a: { b: { c: 4 } } }, { a: { b: { c: 5 } } }, { a: { b: { c: 6 } } }]);
      const found = nrml(collection.find({ "a.b.c": { $gt: 4 } }));
      expect(found).toEqual([{ a: { b: { c: 5 } } }, { a: { b: { c: 6 } } }]);
    });

  });
  
  describe("$lt", ({ test }) => {

    test("works", () => {
      const collection = testCollection();
      collection.insert([{ a: 2 }, { a: 4 }, { a: 5 }, { a: 6 }]);
      const found = nrml(collection.find({ a: { $lt: 4 } }));
      expect(found).toEqual([{ a: 2 }]);
    });

    test("works with strings", () => {
      const collection = testCollection();
      collection.insert([{ a: "a" }, { a: "b" }, { a: "c" }, { a: "d" }]);
      const found = nrml(collection.find({ a: { $lt: "b" } }));
      expect(found).toEqual([{ a: "a" }]);
    });

    test("works with array lengths", () => {
      const collection = testCollection();
      collection.insert([{ a: [1, 2] }, { a: [1, 2, 3] }, { a: [1, 2, 3, 4] }]);
      const found = nrml(collection.find({ a: { $lt: 3 } }));
      expect(found).toEqual([{ a: [1, 2] }]);
    });

    test("works with deeply nested properties using dot notation", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: { c: 2 } } }, { a: { b: { c: 4 } } }, { a: { b: { c: 5 } } }, { a: { b: { c: 6 } } }]);
      const found = nrml(collection.find({ "a.b.c": { $lt: 4 } }));
      expect(found).toEqual([{ a: { b: { c: 2 } } }]);
    });

  });

  describe("$gte", ({ test }) => {

    test("works", () => {
      const collection = testCollection();
      collection.insert([{ a: 2 }, { a: 4 }, { a: 5 }, { a: 6 }]);
      const found = nrml(collection.find({ a: { $gte: 4 } }));
      expect(found).toEqual([{ a: 4 }, { a: 5 }, { a: 6 }]);
    });

    test("works with strings", () => {
      const collection = testCollection();
      collection.insert([{ a: "a" }, { a: "b" }, { a: "c" }, { a: "d" }]);
      const found = nrml(collection.find({ a: { $gte: "b" } }));
      expect(found).toEqual([{ a: "b" }, { a: "c" }, { a: "d" }]);
    });

    test("works with array lengths", () => {
      const collection = testCollection();
      collection.insert([{ a: [1, 2] }, { a: [1, 2, 3] }, { a: [1, 2, 3, 4] }]);
      const found = nrml(collection.find({ a: { $gte: 3 } }));
      expect(found).toEqual([{ a: [1, 2, 3] }, { a: [1, 2, 3, 4] }]);
    });

    test("works with deeply nested properties using dot notation", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: { c: 2 } } }, { a: { b: { c: 4 } } }, { a: { b: { c: 5 } } }, { a: { b: { c: 6 } } }]);
      const found = nrml(collection.find({ "a.b.c": { $gte: 4 } }));
      expect(found).toEqual([{ a: { b: { c: 4 } } }, { a: { b: { c: 5 } } }, { a: { b: { c: 6 } } }]);
    });

  });

  describe("$lte", ({ test }) => {

    test("works", () => {
      const collection = testCollection();
      collection.insert([{ a: 2 }, { a: 4 }, { a: 5 }, { a: 6 }]);
      const found = nrml(collection.find({ a: { $lte: 4 } }));
      expect(found).toEqual([{ a: 2 }, { a: 4 }]);
    });

    test("works with strings", () => {
      const collection = testCollection();
      collection.insert([{ a: "a" }, { a: "b" }, { a: "c" }, { a: "d" }]);
      const found = nrml(collection.find({ a: { $lte: "b" } }));
      expect(found).toEqual([{ a: "a" }, { a: "b" }]);
    });

    test("works with array lengths", () => {
      const collection = testCollection();
      collection.insert([{ a: [1, 2] }, { a: [1, 2, 3] }, { a: [1, 2, 3, 4] }]);
      const found = nrml(collection.find({ a: { $lte: 3 } }));
      expect(found).toEqual([{ a: [1, 2] }, { a: [1, 2, 3] }]);
    });

    test("works with deeply nested properties using dot notation", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } },
        { a: { b: { c: 3 } } },
        { a: { b: { c: 4 } } },
      ]);
      const found = nrml(collection.find({ "a.b.c": { $lte: 2 } }));
      expect(found).toEqual([
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } },
      ]);
    });

  });

});

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

    test("arrays", () => {
      const collection = testCollection();
      collection.insert({ a: { b: [1, 2, 3] } });
      collection.update({ a: { b: [1, 2, 3] } }, { $inc: 5 });
      const found = nrml(collection.find({ b: [6,7,8] }));
      expect(found).toEqual([{ a: { b: [6, 7, 8] } }]);
    });

    test("works, syntax 2", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $inc: 5 });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 6, b: { c: 5 } }]);
    });

    test("increments only the properties defined in query", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 2, c: 3 });
      collection.update({ a: 1, b: 2 }, { $inc: 5 });
      const found = nrml(collection.find({ a: 6 }));
      expect(found).toEqual([{ a: 6, b: 7, c: 3 }]);
    });

    test("implcitly creates properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.update({ a: 1 }, { $inc: { b: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: 5 }]);
    });

    test("syntax 2 increments properties specified in query", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 2, c: 3 });
      collection.update({ a: 1, b: 2, c: 3 }, { $inc: 5 });
      const found = nrml(collection.find({ a: 6, b: 7, c: 8 }));
      expect(found).toEqual([{ a: 6, b: 7, c: 8 }]);
    });

    test("deep selector, shallow and deep increment", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1, e: 1 } } });
      collection.update({ d: 1 }, { $inc: { f: 5, "b.c.d": 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 6, e: 1 } }, f: 5 }]);
    });

    test("deep selector, shallow increment, syntax 2", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1, e: 1 } } });
      collection.update({ d: 1 }, { $inc: 5 });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 1, e: 1 } }, d: 5 }]);
    });

    test("deep selector, implicitly create shallow properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1 } } });
      collection.update({ d: 1 }, { $inc: { e: 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 1 } }, e: 5 }]);
    });

    test("deep selector, implicitly create deep properties", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: { c: { d: 1 } } });
      collection.update({ d: 1 }, { $inc: { "b.c.e": 5 } });
      const found = nrml(collection.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: { c: { d: 1, e: 5 } } }]);
    });

    test("updates keys specified in query, even when using other mods", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: { c: 2 }},
        { a: 1, b: { c: 2 }},
        { a: 1, b: { c: 2 }},
      ]);
      collection.update({ b: { c: { $gt: 0 }}}, { $inc: 5 });
      const found = nrml(collection.find({ c: 7 }));
      expect(found).toEqual([
        { a: 1, b: { c: 7 }},
        { a: 1, b: { c: 7 }},
        { a: 1, b: { c: 7 }},
      ]);
    });

    test("updates keys specified in query, even when using other mods - dot notation", () => {
      const collection = testCollection();
      collection.insert([
        { a: 1, b: { c: 2 }},
        { a: 1, b: { c: 2 }},
        { a: 1, b: { c: 2 }},
      ]);
      collection.update({ "b.c": { $gt: 0 } }, { $inc: 5 });
      const found = nrml(collection.find({ c: 7 }));
      expect(found).toEqual([
        { a: 1, b: { c: 7 }},
        { a: 1, b: { c: 7 }},
        { a: 1, b: { c: 7 }},
      ]);
    });

    test("update keys specified in query when the query is an object", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } },
      ]);
      collection.update({ a: { b: { c: 1 } } }, { $inc: 5 });
      const found = nrml(collection.find({ c: 6 }));
      expect(found).toEqual([{ a: { b: { c: 6 } } }]);
    });

    test("update keys specified in query - dot notation", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: { c: 1 } } },
        { a: { b: { c: 2 } } },
      ]);
      collection.update({ "a.b.c": 1 }, { $inc: 5 });
      const found = nrml(collection.find({ c: 6 }));
      expect(found).toEqual([{ a: { b: { c: 6 } } }]);
    });

    test("update keys specified in query, mix of object and dot notation", () => {
      const collection = testCollection();
      collection.insert([
        { a: { b: { c: 1, d: 2 } } },
        { a: { b: { c: 2, d: 3 } } },
      ]);
      collection.update({ a: { b: { c: 1 } }, "a.b.d": 2 }, { $inc: 5 });
      const found = nrml(collection.find({ c: 6 }));
      expect(found).toEqual([{ a: { b: { c: 6, d: 7 } } }]);
    })
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
      expect(found).toEqual([{ a: 1, b: { c: { d: 1 } }, e: 5 }]);
    });
  });

  describe("special behavior with $has and $hasAny", ({ test }) => {

    test("$has single property", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: 1, c: 1 } }, { a: 1 }]);
      collection.update({ a: { $has: "b" }}, { $inc: 5 });
      const found = nrml(collection.find({ b: 6, c: 1 }));
      expect(found).toEqual([{ a: { b: 6, c: 1 } }]);
    });

    test("$has array", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: 1, c: 1 } }, { a: 1 }]);
      collection.update({ a: { $has: ["b", "c"] }}, { $inc: 5 });
      const found = nrml(collection.find({ b: 6, c: 6 }));
      expect(found).toEqual([{ a: { b: 6, c: 6 } }]);
    });

    test("$hasAny, with one property missing", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: 1 } }, { a: 1 }]);
      collection.update({ a: { $hasAny: ["b", "c"] }}, { $inc: 5 });
      const found = nrml(collection.find({ b: 6 }));
      expect(found).toEqual([{ a: { b: 6 } }]);
    });

    test("$hasAny, updates all specified properties", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: 1, c: 1 } }, { a: 1 }]);
      collection.update({ a: { $hasAny: ["b", "c"] }}, { $inc: 5 });
      const found = nrml(collection.find({ b: 6, c: 6 }));
      expect(found).toEqual([{ a: { b: 6, c: 6 } }]);
    });

    test("$hasAny single property, dot notation", () => {
      const collection = testCollection();
      collection.insert([{ a: { b: { c: 1 } } }, { a: 1 }]);
      collection.update({ "a.b": { $hasAny: "c" }}, { $inc: 5 });
      const found = nrml(collection.find({ c: 6 }));
      expect(found).toEqual([{ a: { b: { c: 6 } } }]);
    });

    test("$has real world test", () => {
      const collection = testCollection();
      collection.insert([
        { planet: { name: "Earth", population: 1 } },
        { planet: { name: "Mars" }},
      ]);
      collection.update({ planet: { name: { $includes: "a" }, $has: "population" } }, { $inc: { "planet.population": 1 } });
      const found = nrml(collection.find({ name: { $includes: "a" }}));
      expect(found).toEqual([
        { planet: { name: "Earth", population: 2 }},
        { planet: { name: "Mars" }},
      ]);
    });

  });
});

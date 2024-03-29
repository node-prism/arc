import { testSuite, expect } from "manten";
import { CREATED_AT_KEY, ID_KEY, UPDATED_AT_KEY } from "../../../src/collection";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("project", ({ test }) => {
    test("implicit exclusion", () => {
      const collection = testCollection({ timestamps: false });
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = collection.find({ a: 1 }, { project: { b: 1 } });
      expect(found).toEqual([{ b: 1 }]);
    });

    test("implicit inclusion", () => {
      const collection = testCollection({ timestamps: false });
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = collection.find({ a: 1 }, { project: { b: 0 } });
      const id = found[0][ID_KEY];
      expect(id).toBeDefined();
      expect(found).toEqual([{ _id: id, a: 1, c: 1 }]);
    });

    test("implicit inclusion - _id implicitly included", () => {
      const collection = testCollection({ timestamps: false });
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const foundWithId = collection.find({ a: 1 }, { project: { b: 0 } });
      const id = foundWithId[0][ID_KEY];
      expect(id).toBeDefined();
      expect(foundWithId).toEqual([{ _id: id, a: 1, c: 1 }]);
    });

    test("explicit", () => {
      const collection = testCollection({ timestamps: false });
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: 1 }, { project: { b: 1, c: 0 } }));
      expect(found).toEqual([{ a: 1, b: 1 }]);
    });

    test("explicit - ID_KEY implicitly included", () => {
      const collection = testCollection({ timestamps: false });
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const foundWithId = collection.find(
        { a: 1 },
        {
          project: {
            b: 1,
            c: 0,
            _created_at: 0,
            _updated_at: 0,
          },
        }
      );
      const id = foundWithId[0][ID_KEY];
      expect(id).toBeDefined();
      expect(foundWithId).toEqual([{ _id: id, a: 1, b: 1 }]);
    });

    test("empty query respects projection", () => {
      const collection = testCollection({ timestamps: false });
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });

      const found = collection.find({}, { project: { b: 1 } });

      for (const doc of found) {
        expect(doc[ID_KEY]).toBeUndefined();
        expect(doc[CREATED_AT_KEY]).toBeUndefined();
        expect(doc[UPDATED_AT_KEY]).toBeUndefined();
      }
    });

    describe("aggregation", ({ test }) => {
      test("$floor, $ceil, $sub, $add, $mult, $div", () => {
        const collection = testCollection({ timestamps: false });
        collection.insert({ a: 1, b: 1, c: 5.6 });
        collection.insert({ a: 2, b: 2, c: 2 });
        collection.insert({ a: 3, b: 3, c: 3 });

        const found = collection.find(
          { a: 1 },
          {
            aggregate: {
              flooredC: { $floor: "c" },
              ceiledC: { $ceil: "c" },
              subbed1: { $sub: ["c", "a"] },
              subbed2: { $sub: [15, "flooredC", 0, 1] },
              mult1: { $mult: ["c", 2, "subbed2"] },
              div1: { $div: ["subbed2", 2, "a", 2] },
              add1: { $add: ["c", 2, "subbed2"] },
            },
            project: {
              b: 0,
              _created_at: 0,
              _updated_at: 0,
              _id: 0,
            },
          }
        );

        expect(found).toEqual([{
          a: 1,
          c: 5.6,
          flooredC: 5,
          ceiledC: 6,
          subbed1: 4.6,
          subbed2: 9,
          mult1: 100.8,
          div1: 2.25,
          add1: 16.6,
        }]);
      });

      test("more realistic use-case", () => {
        const collection = testCollection({ timestamps: false });
        collection.insert({ math: 72, english: 82, science: 92 });
        collection.insert({ math: 60, english: 70, science: 80 });
        collection.insert({ math: 90, english: 72, science: 84 });

        const found = nrml(collection.find(
          { $has: ["math", "english", "science"] },
          {
            aggregate: {
              total: { $add: ["math", "english", "science"] },
              average: { $div: ["total", 3] },
            },
          }
        ));

        expect(found).toEqual([
          { math: 72, english: 82, science: 92, total: 246, average: 82 },
          { math: 60, english: 70, science: 80, total: 210, average: 70 },
          { math: 90, english: 72, science: 84, total: 246, average: 82 },
        ]);
      });

      test("remove intermediate aggregation properties with projection", () => {
        const collection = testCollection();
        collection.insert({ math: 72, english: 82, science: 92 });
        collection.insert({ math: 60, english: 70, science: 80 });
        collection.insert({ math: 90, english: 72, science: 84 });

        const found = nrml(collection.find(
          { $has: ["math", "english", "science"] },
          {
            aggregate: {
              total: { $add: ["math", "english", "science"] }, // <-- projected out
              average: { $div: ["total", 3] },
            },
            project: {
              math: 1,
              english: 1,
              science: 1,
              average: 1,
            },
          }
        ));

        expect(found).toEqual([
          { math: 72, english: 82, science: 92, average: 82 },
          { math: 60, english: 70, science: 80, average: 70 },
          { math: 90, english: 72, science: 84, average: 82 },
        ]);
      });

      test("accessing properties with dot notation", () => {
        const collection = testCollection();
        collection.insert({ a: { b: { c: 1 } } });
        collection.insert({ a: { b: { c: 2 } } });
        collection.insert({ a: { b: { c: 3 } } });

        const found = collection.find(
          { a: { b: { c: 1 } } },
          {
            aggregate: {
              d: { $add: ["a.b.c", 1] },
            },
            project: {
              a: 0,
              _created_at: 0,
              _updated_at: 0,
              _id: 0,
            },
          }
        );

        expect(found).toEqual([{ d: 2 }]);
      });

      test("$fn", () => {
        const collection = testCollection();
        collection.insert({ first: "John", last: "Doe" });
        collection.insert({ first: "Jane", last: "Doe" });

        const found = nrml(collection.find(
          { $has: ["first", "last"] },
          {
            aggregate: {
              fullName: { $fn: (doc) => `${doc.first} ${doc.last}` },
            },
          }
        ));

        expect(found).toEqual([
          { first: "John", last: "Doe", fullName: "John Doe" },
          { first: "Jane", last: "Doe", fullName: "Jane Doe" },
        ]);
      });
    });

  });
});

import { testSuite, expect } from "manten";
import {CREATED_AT_KEY, ID_KEY, UPDATED_AT_KEY} from "../../../src";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("project", ({ test }) => {
    test("implicit exclusion", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: 1 }, { project: { b: 1 } }));
      expect(found).toEqual([{ b: 1 }]);
    });

    test("implicit exclusion - ID_KEY implicitly included", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const foundWithId = collection.find({ a: 1 }, { project: { b: 1 } });
      const id = foundWithId[0][ID_KEY];
      expect(foundWithId).toEqual([{ [`${ID_KEY}`]: id, b: 1 }]);
    });

    test("implicit inclusion", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: 1 }, { project: { b: 0 } }));
      expect(found).toEqual([{ a: 1, c: 1 }]);
    });

    test("implicit inclusion - ID_KEY implicitly included", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const foundWithId = collection.find({ a: 1 }, { project: { b: 0 } });
      const id = foundWithId[0][ID_KEY];
      delete foundWithId[0][CREATED_AT_KEY];
      delete foundWithId[0][UPDATED_AT_KEY];
      expect(foundWithId).toEqual([{ [`${ID_KEY}`]: id, a: 1, c: 1 }]);
    });

    test("explicit", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const found = nrml(collection.find({ a: 1 }, { project: { b: 1, c: 0 } }));
      expect(found).toEqual([{ a: 1, b: 1 }]);
    });

    test("explicit - ID_KEY implicitly included", () => {
      const collection = testCollection();
      collection.insert({ a: 1, b: 1, c: 1 });
      collection.insert({ a: 2, b: 2, c: 2 });
      collection.insert({ a: 3, b: 3, c: 3 });
      const foundWithId = collection.find({ a: 1 }, { project: { b: 1, c: 0 } });
      const id = foundWithId[0][ID_KEY];
      delete foundWithId[0][CREATED_AT_KEY];
      delete foundWithId[0][UPDATED_AT_KEY];
      expect(foundWithId).toEqual([{ [`${ID_KEY}`]: id, a: 1, b: 1 }]);
    });
  });
});

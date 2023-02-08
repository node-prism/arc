import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("remove", ({ test }) => {
    test("it works", () => {
      const collection = testCollection();
      collection.insert({ a: 1 });
      collection.insert({ a: 2 });
      collection.insert({ a: 3 });
      const removed = nrml(collection.remove({ a: 2 }));
      const found = nrml(collection.find({ a: { $lt: 5 } }));
      expect(removed).toEqual([{ a: 2 }]);
      expect(found).toEqual([{ a: 1 }, { a: 3 }]);
    });
    test("normalizes internal id_map", () => {
      const collection = testCollection({ integerIds: true });
      collection.insert({ a: 1 });
      expect(collection.data["internal"]["id_map"][3]).toBeDefined();
      collection.remove({ a: 1 });
      expect(collection.data["internal"]["id_map"][3]).toBeUndefined();
    });
  });
});

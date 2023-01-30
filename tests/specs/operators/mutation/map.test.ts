import { expect, testSuite } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$map", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      const mapfn = (doc: any) => ({ ...doc, c: 5 });
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $map: mapfn });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 1, b: { c: 5 }, c: 5 }]);
    });

    test("works with other operators", () => {
      const collection = testCollection();
      const mapfn = (doc: any) => ({ ...doc, c: 5 });
      collection.insert({ a: 1, b: { c: 5 } });
      collection.update({ a: 1 }, { $map: mapfn, $unset: "b" });
      const found = nrml(collection.find({ c: 5 }));
      expect(found).toEqual([{ a: 1, c: 5 }]);
    });
  });
});


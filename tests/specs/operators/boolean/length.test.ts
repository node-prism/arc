import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$length", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert({ foo: [0, 0] });
      collection.insert({ foo: [0, 0, 0] });
      collection.insert({ foo: [0, 0, 0] });
      collection.insert({ foo: "abc" });
      collection.insert({ foo: "abcd" });
      const found = nrml(collection.find({ foo: { $length: 3 } }));
      expect(found).toEqual([{ foo: [0, 0, 0] }, { foo: [0, 0, 0] }, { foo: "abc" }]);
    });
  });
});

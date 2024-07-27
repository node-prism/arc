import { expect, testSuite } from "manten";
import { Collection } from "../../../src";
import { nrml } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("from", ({ test }) => {
    test("works", () => {
      const data = [
        { a: 1, b: 2, c: 3 },
        { a: 2, b: 2, c: 3 },
      ];
      const c = Collection.from(data);
      const found = nrml(c.find({ a: 1 }));
      expect(found).toEqual([{ a: 1, b: 2, c: 3 }]);
    });
  });
});

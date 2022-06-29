import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../../common";

export default testSuite(async ({ describe }) => {
  describe("$re", ({ test }) => {
    test("works", () => {
      const collection = testCollection();
      collection.insert([
        { ip: "192.168.0.1" },
        { ip: "192.168.0.254" },
        { ip: "19216801" }
      ]);
      const ip = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
      const found = nrml(collection.find({ ip: { $re: ip } }));
      expect(found).toEqual([ { ip: "192.168.0.1" }, { ip: "192.168.0.254" } ]);
    });
  });
});

import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("from", async ({ runTestSuite }) => {
    runTestSuite(import("./from.test.js"));
  });
});

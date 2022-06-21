import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("query options", async ({ runTestSuite }) => {
    runTestSuite(import("./sort.test.js"));
    runTestSuite(import("./integerIds.test.js"));
  });
});

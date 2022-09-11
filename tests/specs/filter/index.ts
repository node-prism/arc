import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("filter", async ({ runTestSuite }) => {
    runTestSuite(import("./basic.test.js"));
  });
});

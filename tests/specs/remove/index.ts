import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("removing", async ({ runTestSuite }) => {
    runTestSuite(import("./basic.test.js"));
  });
});

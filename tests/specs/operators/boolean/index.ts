import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("boolean", async ({ runTestSuite }) => {
    runTestSuite(import("./has.test.js"));
  });
});

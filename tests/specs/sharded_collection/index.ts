import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("sharded collection", async ({ runTestSuite }) => {
    runTestSuite(import("./basic.test.js"));
  });
});

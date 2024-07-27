import { testSuite } from "manten";


export default testSuite(async ({ describe }) => {
  describe("utils", async ({ runTestSuite }) => {
    runTestSuite(import("./changeProps.test.js"));
    runTestSuite(import("./appendProps.test.js"));
    runTestSuite(import("./returnFound.test.js"));
  });
});

import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("boolean", async ({ runTestSuite }) => {
    runTestSuite(import("./includes.test.js"));
    runTestSuite(import("./and.test.js"));
    runTestSuite(import("./or.test.js"));
    runTestSuite(import("./xor.test.js"));
    runTestSuite(import("./fn.test.js"));
    runTestSuite(import("./re.test.js"));
    runTestSuite(import("./oneOf.test.js"));
    runTestSuite(import("./length.test.js"));
    runTestSuite(import("./not.test.js"));
    runTestSuite(import("./has.test.js"));
    runTestSuite(import("./hasAny.test.js"));
    runTestSuite(import("./gtlt.test.js"));
  });
});

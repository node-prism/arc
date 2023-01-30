import {testSuite} from "manten";

export default testSuite(async ({ describe }) => {
  describe("mutation", async ({ runTestSuite }) => {
    runTestSuite(import("./set.test.js"));
    runTestSuite(import("./unset.test.js"));
    runTestSuite(import("./change.test.js"));
    runTestSuite(import("./merge.test.js"));
    runTestSuite(import("./math.test.js"));
    runTestSuite(import("./map.test.js"));
    runTestSuite(import("./push.test.js"));
    runTestSuite(import("./unshift.test.js"));
    runTestSuite(import("./filter.test.js"));
  });
});

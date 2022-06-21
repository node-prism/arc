import { testSuite } from "manten";
export default testSuite(async ({ describe }) => {
    describe("mutation", async ({ runTestSuite }) => {
        runTestSuite(import("./append.test.js"));
        runTestSuite(import("./set.test.js"));
        runTestSuite(import("./change.test.js"));
        runTestSuite(import("./merge.test.js"));
        runTestSuite(import("./math.test.js"));
    });
});

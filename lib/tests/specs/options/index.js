import { testSuite } from "manten";
export default testSuite(async ({ describe }) => {
    describe("query options", async ({ runTestSuite }) => {
        runTestSuite(import("./sort.test.js"));
        runTestSuite(import("./integerIds.test.js"));
        runTestSuite(import("./project.test.js"));
        runTestSuite(import("./skip_take.test.js"));
        runTestSuite(import("./join.test.js"));
        runTestSuite(import("./ifNull.test.js"));
        runTestSuite(import("./ifEmpty.test.js"));
        runTestSuite(import("./ifNullOrEmpty.test.js"));
    });
});

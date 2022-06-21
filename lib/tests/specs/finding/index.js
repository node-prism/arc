import { testSuite } from "manten";
export default testSuite(async ({ describe }) => {
    describe("finding", async ({ runTestSuite }) => {
        runTestSuite(import("./basic.test.js"));
    });
});

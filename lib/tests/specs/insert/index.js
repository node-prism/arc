import { testSuite } from "manten";
export default testSuite(async ({ describe }) => {
    describe("insert", async ({ runTestSuite }) => {
        runTestSuite(import("./basic.test.js"));
    });
});

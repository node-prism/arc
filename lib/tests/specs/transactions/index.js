import { testSuite } from "manten";
export default testSuite(async ({ runTestSuite }) => {
    runTestSuite(import("./basic.test.js"));
});

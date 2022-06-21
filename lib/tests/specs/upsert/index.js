import { testSuite } from "manten";
export default testSuite(async ({ runTestSuite }) => {
    runTestSuite(import("./upsert.test.js"));
});

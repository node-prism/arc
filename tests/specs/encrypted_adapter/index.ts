import { testSuite } from "manten";

export default testSuite(async ({ runTestSuite }) => {
  runTestSuite(import("./adapter.test.js"));
});

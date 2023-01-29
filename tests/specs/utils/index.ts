import { testSuite } from "manten";

export default testSuite(async ({ runTestSuite }) => {
  runTestSuite(import("./stripBooleanModifiers.test.js"));
});


import { describe } from "manten";

await describe("find", async ({ runTestSuite }) => {
  runTestSuite(import("./specs/finding"));
});

await describe("options", async ({ runTestSuite }) => {
  runTestSuite(import("./specs/options"));
});

await describe("update", async ({ describe }) => {
  await describe("operators", ({ runTestSuite }) => {
    runTestSuite(import("./specs/operators/boolean"));
    runTestSuite(import("./specs/operators/mutation"));
  });
});

await describe("upsert", ({ runTestSuite }) => {
  runTestSuite(import("./specs/upsert"));
});

await describe("transactions", ({ runTestSuite }) => {
  runTestSuite(import("./specs/transactions"));
});

import { describe } from "manten";

await describe("find", async ({ runTestSuite }) => {
  runTestSuite(import("./specs/finding"));
});

await describe("filter", async ({ runTestSuite }) => {
  runTestSuite(import("./specs/filter"));
});

await describe("insert", async ({ runTestSuite }) => {
  runTestSuite(import("./specs/insert"));
});

await describe("options", async ({ runTestSuite }) => {
  runTestSuite(import("./specs/options"));
});

await describe("operators", ({ runTestSuite }) => {
  runTestSuite(import("./specs/operators/boolean"));
  runTestSuite(import("./specs/operators/mutation"));
});

await describe("upsert", ({ runTestSuite }) => {
  runTestSuite(import("./specs/upsert"));
});

await describe("transactions", ({ runTestSuite }) => {
  runTestSuite(import("./specs/transactions"));
});

await describe("remove", ({ runTestSuite }) => {
  runTestSuite(import("./specs/remove"));
});

await describe("encrypted adapter", ({ runTestSuite }) => {
  runTestSuite(import("./specs/encrypted_adapter"));
});

import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";
export default testSuite(async ({ describe }) => {
    describe("insert", ({ test }) => {
        test("insert one", () => {
            const collection = testCollection();
            collection.insert({ foo: "bar" });
            const found = nrml(collection.find({ foo: "bar" }));
            expect(found).toEqual([{ foo: "bar" }]);
        });
        test("insert multiple", () => {
            const collection = testCollection();
            collection.insert([{ foo: "bar" }, { foo: "baz" }, { foo: "boo" }]);
            const found = nrml(collection.find({ foo: { $includes: "b" } }));
            expect(found).toEqual([{ foo: "bar" }, { foo: "baz" }, { foo: "boo" }]);
        });
        test("can insert emojis", () => {
            const collection = testCollection();
            collection.insert({ foo: "👍" });
            const found = nrml(collection.find({ foo: "👍" }));
            expect(found).toEqual([{ foo: "👍" }]);
        });
    });
});

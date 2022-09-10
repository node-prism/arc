import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";

export default testSuite(async ({ test, describe }) => {
  test("works", () => {
    const collection = testCollection();
    collection.upsert({ name: "Jean-Luc" }, { $set: { title: "Captain" } });
    const found = nrml(collection.find({ name: "Jean-Luc" }));
    expect(found).toEqual([{ name: "Jean-Luc", title: "Captain" }]);
  });

  test("works - pre-existing document", () => {
    const collection = testCollection();
    collection.insert({ animal: "dog" });
    collection.insert({ animal: "cat" });
    collection.upsert({ animal: "dog" }, { $set: { name: "scooby" } });
    const found = nrml(collection.find({ animal: "dog" }));
    expect(found).toEqual([{ animal: "dog", name: "scooby" }]);
  });

  describe("strip boolean modifiers before insertion", ({ test }) => {
    test("ex 1", () => {
      const collection = testCollection();
      // the idea is that we don't want the created document to be { name: "Jean-Luc", age: { $gt: 40 }, title: "Captain" },
      // but rather { name: "Jean-Luc", title: "Captain" }
      collection.upsert({ name: "Jean-Luc", age: { $gt: 40 } }, { $set: { title: "Captain" } });
      const found = nrml(collection.find({ name: "Jean-Luc" }));
      expect(found).toEqual([{ name: "Jean-Luc", title: "Captain" }]);
    });
    test("ex 2", () => {
      const collection = testCollection();
      collection.upsert({ name: "Jean-Luc", age: { asdf: 1, $gt: 40 } }, { $set: { title: "Captain" } });
      const found = nrml(collection.find({ name: "Jean-Luc" }));
      expect(found).toEqual([{ name: "Jean-Luc", age: { asdf: 1 }, title: "Captain" }]);
    });
    test("ex 3", () => {
      const collection = testCollection();
      collection.upsert({ name: "Jean-Luc", age: { $gt: 40, foo: { $lt: 40, bar: "baz" } }, title: "Captain" }, { $set: { title: "Captain" } });
      const found = nrml(collection.find({ name: "Jean-Luc" }));
      expect(found).toEqual([{ name: "Jean-Luc", title: "Captain", age: { foo: { bar: "baz" } } }]);
    });
  });

});

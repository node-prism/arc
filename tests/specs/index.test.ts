import { expect, testSuite } from "manten";
import FSAdapter from "../../src/adapter/fs";
import { Collection } from "../../src/collection";

const getCollection = () => {
  const collection = new Collection({
    autosync: false,
    integerIds: false,
    adapter: new FSAdapter({ storagePath: ".test", name: "index" }),
  });
  collection.drop();
  return collection;
};

export default testSuite(async ({ describe }) => {
  describe("index", ({ test }) => {
    test("createIndex throws if the key has a numeric property", () => {
      const collection = getCollection();
      expect(() => collection.createIndex({ key: "0" })).toThrow();
      expect(() => collection.createIndex({ key: "a.0" })).toThrow();
      expect(() => collection.createIndex({ key: "a.0.b" })).toThrow();
    });

    test("can create and remove", () => {
      const collection = getCollection();
      collection.createIndex({ key: "name" });

      expect(collection.indices["name"]).toBeDefined();
      expect(collection.indices["name"].unique).toBe(false);

      collection.removeIndex("name");

      expect(collection.indices["name"]).toBeUndefined();

      collection.createIndex({ key: "name", unique: true });

      expect(collection.indices["name"]).toBeDefined();
      expect(collection.indices["name"].unique).toBe(true);
    });

    test("indexes are tracked properly", () => {
      const collection = getCollection();
      collection.createIndex({ key: "person.email" });
      collection.createIndex({ key: "person.name" });

      collection.insert({ person: { name: "Alice", email: "alice@alice.com", } });
      collection.insert({ person: { name: "Bob", email: "bob@bob.com", } });

      const alice = collection.find({ "person.name": "Alice" });
      const bob = collection.find({ "person.name": "Bob" });

      expect(collection.data.internal.index.valuesToId["person.name"]["Alice"]).toEqual([(alice[0] as any)._id]);
      expect(collection.data.internal.index.valuesToId["person.email"]["alice@alice.com"]).toEqual([(alice[0] as any)._id]);
      expect(collection.data.internal.index.valuesToId["person.name"]["Bob"]).toEqual([(bob[0] as any)._id]);
      expect(collection.data.internal.index.valuesToId["person.email"]["bob@bob.com"]).toEqual([(bob[0] as any)._id]);

      expect(collection.data.internal.index.idToValues[(alice[0] as any)._id]["person.name"]).toEqual("Alice");
      expect(collection.data.internal.index.idToValues[(alice[0] as any)._id]["person.email"]).toEqual("alice@alice.com");
      expect(collection.data.internal.index.idToValues[(bob[0] as any)._id]["person.name"]).toEqual("Bob");
      expect(collection.data.internal.index.idToValues[(bob[0] as any)._id]["person.email"]).toEqual("bob@bob.com");

      collection.update({ person: { name: "Alice" } }, { $merge: { person: { email: "a@a.com" }}});

      expect(collection.data.internal.index.valuesToId["person.email"]["a@a.com"]).toEqual([(alice[0] as any)._id]);
      expect(collection.data.internal.index.idToValues[(alice[0] as any)._id]["person.email"]).toEqual("a@a.com");

      // no more documents have this email value, so the tracked index key should be removed.
      expect(collection.data.internal.index.valuesToId["person.email"]["alice@alice.com"]).toBeUndefined();
      // the person.name index should still be there.
      expect(collection.data.internal.index.valuesToId["person.name"]["Alice"]).toEqual([(alice[0] as any)._id]);

      collection.remove({ person: { name: "Alice" } });

      expect(collection.data.internal.index.valuesToId["person.name"]["Alice"]).toBeUndefined();
      expect(collection.data.internal.index.valuesToId["person.email"]["a@a.com"]).toBeUndefined();
      expect(collection.data.internal.index.idToValues[(alice[0] as any)._id]).toBeUndefined();

      collection.sync();
    });
  });
});

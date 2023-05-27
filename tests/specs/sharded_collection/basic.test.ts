import { testSuite, expect } from "manten";
import { getShardedCollection } from "../../common";

export default testSuite(async ({ describe }) => {
  describe("sharding", ({ test }) => {

    test("works", () => {
      const c = getShardedCollection();

      const docs = [];

      for (let i = 0; i < 250; i++) {
        docs.push({ key: i });
      }

      c.insert(docs);

      expect(Object.keys(c.shards).length).toEqual(3);
      expect(Object.keys(c.shards).every((shardId) => Object.keys(c.shards[shardId].data).length === 85));

      const found = c.find({ key: 1 });
      expect(found.length).toEqual(1);

      c.drop();
      c.sync();
    });

  });

});

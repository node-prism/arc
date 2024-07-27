import { expect, testSuite } from "manten";
import { returnFound } from "../../../src/return_found";

export default testSuite(async ({ describe }) => {
  describe("returnFound", ({ test }) => {
    test("should return undefined for undefined source", () => {
      expect(returnFound(undefined, {}, { returnKey: "id" })).toBeUndefined();
    });

    test("should ignore internal properties", () => {
      const source = { id: 1, internal: true };
      const query = {};
      const options = { returnKey: "id" };
      expect(returnFound(source, query, options)).toEqual([{ id: 1 }]);
    });

    test("should return the document if it matches the query", () => {
      const source = [{ id: 1, name: "Test" }];
      const query = { name: "Test" };
      const options = { returnKey: "id", deep: false };
      expect(returnFound(source, query, options)).toEqual([
        { id: 1, name: "Test" },
      ]);
    });

    test("should return undefined if no items match the query", () => {
      const source = [{ id: 1, name: "Test" }];
      const query = { name: "Not Found" };
      const options = { returnKey: "id" };
      expect(returnFound(source, query, options)).toBeUndefined();
    });

    test("should handle nested objects with deep search in dot notation", () => {
      const source = [{ id: 1, details: { name: "Nested" } }];
      const query = { "details.name": "Nested" };
      const options = { returnKey: "id", deep: true };
      expect(returnFound(source, query, options)).toEqual([
        { id: 1, details: { name: "Nested" } },
      ]);
    });

    test("should handle nested objects with deep search without dot notation", () => {
      const source = [{ id: 1, details: { name: "Nested" } }];
      const query = { details: { name: "Nested" } };
      const options = { returnKey: "id", deep: true };
      expect(returnFound(source, query, options)).toEqual([
        { id: 1, details: { name: "Nested" } },
      ]);
    });

    test("should handle nested objects with deep search without dot notation or a fully-qualified path", () => {
      const source = [{ id: 1, details: { name: "Nested" } }];
      const query = { name: "Nested" };
      const options = { returnKey: "id", deep: true };
      expect(returnFound(source, query, options)).toEqual([
        { id: 1, details: { name: "Nested" } },
      ]);
    });

    test("should return unique items based on returnKey", () => {
      const source = [
        { id: 1, name: "Duplicate" },
        { id: 1, name: "Duplicate" },
      ];
      const query = { name: "Duplicate" };
      const options = { returnKey: "id" };
      expect(returnFound(source, query, options)).toEqual([
        { id: 1, name: "Duplicate" },
      ]);
    });

    test("should return concatenated results for array items", () => {
      const source = [{ id: 1, items: [{ name: "Item1" }, { name: "Item2" }] }];
      const query = { items: { name: "Item1" } };
      const options = { returnKey: "id", deep: true };
      expect(returnFound(source, query, options)).toEqual([
        { id: 1, items: [{ name: "Item1" }, { name: "Item2" }] },
      ]);
    });
  });
});

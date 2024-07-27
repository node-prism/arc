import { expect, testSuite } from "manten";
import { appendProps } from "../../../src/append_props";

export default testSuite(async ({ describe }) => {
  describe("appendProps", ({ test }) => {
    test("should append newProps to an object that matches the query", () => {
      const source = { id: 1, name: "John" };
      const query = { id: 1 };
      const newProps = { age: 30 };
      const result = appendProps(source, query, newProps);
      expect(result).toEqual({ id: 1, name: "John", age: 30 });
    });

    test("should append newProps to objects in an array that match the query", () => {
      const source = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ];
      const query = { id: 1 };
      const newProps = { age: 30 };
      const result = appendProps(source, query, newProps);
      expect(result).toEqual([
        { id: 1, name: "John", age: 30 },
        { id: 2, name: "Jane" },
      ]);
    });

    test("should merge newProps with matching objects when merge is true", () => {
      const source = { id: 1, name: "John" };
      const query = { id: 1 };
      const newProps = { name: "Jonathan", age: 30 };
      const result = appendProps(source, query, newProps, true);
      expect(result).toEqual({ id: 1, name: "Jonathan", age: 30 });
    });

    test("should not modify non-matching objects", () => {
      const source = { id: 2, name: "Jane" };
      const query = { id: 1 };
      const newProps = { age: 30 };
      const result = appendProps(source, query, newProps);
      expect(result).toEqual({ id: 2, name: "Jane" });
    });

    test("should return undefined if source is undefined", () => {
      const result = appendProps(undefined, {}, {});
      expect(result).toBeUndefined();
    });

    test("should not modify the source if query does not match", () => {
      const source = { id: 1, name: "John" };
      const query = { id: 2 };
      const newProps = { age: 30 };
      const result = appendProps(source, query, newProps);
      expect(result).toEqual({ id: 1, name: "John" });
    });

    test("should handle nested objects", () => {
      const source = { id: 1, name: "John", address: { city: "CityA" } };
      const query = { city: "CityA" };
      const newProps = { postalCode: "12345" };
      const result = appendProps(source, query, newProps);
      expect(result).toEqual({
        id: 1,
        name: "John",
        address: { city: "CityA", postalCode: "12345" },
      });
    });
  });
});

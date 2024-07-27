import { expect, testSuite } from "manten";
import { changeProps } from "../../../src/change_props";

export default testSuite(async ({ describe }) => {
  describe("changeProps", ({ test }) => {
    test("should return undefined for null source", () => {
      expect(changeProps(null, {}, {})).toBeUndefined();
    });

    test("should not modify the source object if query does not match", () => {
      const source = { name: "John", age: 30 };
      const query = { name: "Jane" };
      const replaceProps = { age: 25 };
      expect(changeProps(source, query, replaceProps)).toEqual(source);
    });

    test("should modify the source object if query matches", () => {
      const source = { name: "John", age: 30 };
      const query = { name: "John" };
      const replaceProps = { age: 25 };
      expect(changeProps(source, query, replaceProps)).toEqual({
        name: "John",
        age: 25,
      });
    });

    test("should add new properties if createNewProperties is true", () => {
      const source = { name: "John" };
      const query = { name: "John" };
      const replaceProps = { age: 30 };
      expect(changeProps(source, query, replaceProps as any, true)).toEqual({
        name: "John",
        age: 30,
      });
    });

    test("should not add new properties if createNewProperties is false", () => {
      const source = { name: "John" };
      const query = { name: "John" };
      const replaceProps = { age: 30 };
      expect(changeProps(source, query, replaceProps as any)).toEqual({
        name: "John",
      });
    });

    test("should process arrays", () => {
      const source = [
        { name: "John", age: 30 },
        { name: "Jane", age: 28 },
      ];
      const query = { name: "John" };
      const replaceProps = { age: 25 };
      expect(changeProps(source, query as any, replaceProps as any)).toEqual([
        { name: "John", age: 25 },
        { name: "Jane", age: 28 },
      ]);
    });

    test("should handle nested structures, merging existing objects", () => {
      const source = [
        {
          name: "John",
          age: 30,
          address: {
            city: "New York",
            foo: "bar",
          },
        },
      ];
      const query = { city: "New York" };
      const replaceProps = { city: "Los Angeles" };
      expect(
        changeProps(source, query as any, replaceProps as any)
      ).toEqual([
        {
          name: "John",
          age: 30,
          address: {
            city: "Los Angeles",
            foo: "bar",
          },
        },
      ]);
    });

    test("should handle nested structures, overwriting existing objects", () => {
      const source = [
        {
          name: "John",
          age: 30,
          address: {
            city: "New York",
            foo: "bar",
          },
        },
      ];
      const query = { address: { city: "New York" } };
      const replaceProps = { address: { city: "Los Angeles" } };
      expect(
        changeProps(source, query as any, replaceProps as any)
      ).toEqual([
        {
          name: "John",
          age: 30,
          address: {
            city: "Los Angeles",
          },
        },
      ]);
    });
  });
});

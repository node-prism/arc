import { testSuite, expect } from "manten";
import { stripBooleanModifiers } from "../../../src/collection";

export default testSuite(async ({ test }) => {
  test("should strip boolean modifiers", () => {
    const query = { name: "A", title: { $oneOf: ["Captain", "Commander"] } };
    const stripped = stripBooleanModifiers(query);
    expect(stripped).toEqual({ name: "A" });
  });

  test("should strip multiple boolean modifers", () => {
    const query = {
      name: "A",
      title: {
        $oneOf: ["Captain", "Commander"],
        $not: { $has: "Lieutenant" },
      },
      age: { $gt: 30 },
    };
    const stripped = stripBooleanModifiers(query);
    expect(stripped).toEqual({ name: "A" });
  });

  test("should strip boolean modifiers, preserving other keys", () => {
    const query = {
      name: "A",
      title: {
        $oneOf: ["Captain", "Commander"],
        $not: { $has: "Lieutenant" },
        thing: "C",
      },
      age: { $gt: 30 },
      other: "B",
    };
    const stripped = stripBooleanModifiers(query);
    expect(stripped).toEqual({ name: "A", title: { thing: "C" }, other: "B" });
  });
});

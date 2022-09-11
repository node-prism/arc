import { Ok, isObject, safeHasOwnProperty } from "../../utils";

export function $not(source: object, query: object): boolean {
  const matches = [];

  if (query["$not"]) {
    if (isObject(query["$not"])) {
      Ok(query["$not"]).forEach((k) => {
        if (!safeHasOwnProperty(source, k)) return;
        matches.push(source[k] !== query["$not"][k]);
      });
    }
  }

  return matches.filter(Boolean).length > 0;
}
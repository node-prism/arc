import dot from "dot-wild";
import { ID_KEY } from "../../collection";
import { returnFound } from "../../return_found";
import { ensureArray, isObject } from "../../utils";

export function $xor(source: object, query: object): boolean {
  if (!isObject(query)) {
    return false;
  }

  // @ts-ignore
  const xorQueries = ensureArray(query.$xor);

  if (xorQueries.length !== 2) {
    throw new Error(
      `invalid $xor query. expected exactly two values, found ${xorQueries.length}.`
    );
  }

  const matches = xorQueries.map((orQuery) => {
    return Object.entries(orQuery).map(([key, value]) => {
      const targetValue = dot.get(source, key) ?? source[key];

      if (typeof value === "function") {
        return targetValue !== undefined && value(targetValue);
      } else {
        const match = returnFound(source, orQuery, {
          deep: true,
          returnKey: ID_KEY,
          clonedData: true
        }, source);
        return Boolean(match && match.length);
      }
    });
  });

  return matches.flat().filter((m) => m).length === 1;
}


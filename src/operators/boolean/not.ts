import { ID_KEY } from "../../collection";
import { returnFound } from "../../return_found";
import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";

export function $not(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((key) => {
      if (key !== "$not") return;

      if (!isObject(query[key])) {
        throw new Error(`$not operator requires an object as its value, received: ${query[key]}`);
      }

      const nots = ensureArray(query[key]);
      matches.push(
        nots.every((not) => {
          if (isObject(not)) {
            const found = returnFound(source, not, { deep: true, returnKey: ID_KEY, clonedData: true }, source);

            if (found && found.length) {
              return false;
            }

            return true;
          }
          return safeHasOwnProperty(source, not)
        })
      );
    });
  }

  return matches.every((m) => !m) || false;
}

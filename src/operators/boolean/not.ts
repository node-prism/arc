import { checkAgainstQuery } from "../../return_found";
import { Ok, isObject, safeHasOwnProperty, ensureArray } from "../../utils";

export function $not(source: object, query: object): boolean {
  const matches = [];

  if (isObject(query)) {
    Ok(query).forEach((pk) => {
      if (pk === "$not") {
        let nots = query[pk];
        nots = ensureArray(nots);
        nots.forEach((not: object) => {
          if (!Ok(not).every((notKey) => safeHasOwnProperty(source, notKey))) {
            matches.push(false);
            return;
          }

          matches.push(!checkAgainstQuery(source, not));
        });
      }
    });
  }

  return matches.filter(Boolean).length > 0;
}

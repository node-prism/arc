import { ensureArray, isObject, Ok, safeHasOwnProperty } from "../../utils";

export function $has(source: object, query: object): boolean {
  let match = false;

  if (isObject(query)) {
    Ok(query).forEach((k) => {
      if (k !== "$has") return;

      let qry = query[k];
      qry = ensureArray(qry);

      match = qry.every((q: any) => {
        return safeHasOwnProperty(source, q);
      });
    });
  }

  return match;
}
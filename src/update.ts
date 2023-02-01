import dot from "dot-wild";
import {
  Collection,
  CollectionOptions,
  CollectionData,
  defaultQueryOptions,
  QueryOptions,
  ID_KEY,
  UPDATED_AT_KEY,
} from ".";
import { processMutationOperators } from "./operators";
import { applyQueryOptions } from "./query_options";
import { returnFound } from "./return_found";
import { ensureArray, Ov, safeHasOwnProperty } from "./utils";

export function update<T>(
  data: CollectionData,
  query: any,
  operations: object,
  options: QueryOptions,
  collectionOptions: CollectionOptions<T>,
  collection: Collection<T>
): T[] {
  options = { ...defaultQueryOptions(), ...options };
  query = ensureArray(query);

  const mutated = [];

  for (const q of query) {
    let itemsToMutate = [];
    itemsToMutate = returnFound([...Ov(data)], q, options, null);
    itemsToMutate = ensureArray(itemsToMutate);

    mutated.push(...processMutationOperators(itemsToMutate, operations, q, collection));
  }

  /**
   * If the returnKey is the default (_id), then the mutated items
   * should be toplevel documents, meaning they'll have `_created_at`
   * and `_updated_at` properties.
   *
   * This is where mutated items have their `_updated_at` properties updated.
   */
  if (options.returnKey === ID_KEY && collectionOptions.timestamps) {
    mutated.forEach((item) => {

      let cuid: string;

      if (collectionOptions.integerIds) {
        let intid = item[ID_KEY];
        cuid = data.__private.id_map[intid];
      } else {
        cuid = item[ID_KEY];
      }

      Object.keys(collection.indices).forEach((key) => {
        if (dot.get(item, key)) {
          const oldValue = data.__private.index.cuidToValues[cuid][key];
          const newValue = dot.get(item, key);

          if (oldValue !== newValue) {
            data.__private.index.valuesToCuid[key][newValue] = data.__private.index.valuesToCuid[key][newValue] || [];
            data.__private.index.valuesToCuid[key][newValue].push(cuid);
            data.__private.index.valuesToCuid[key][oldValue] = data.__private.index.valuesToCuid[key][oldValue].filter((cuid) => cuid !== cuid);

            if (data.__private.index.valuesToCuid[key][oldValue].length === 0) {
              delete data.__private.index.valuesToCuid[key][oldValue];
            }

            data.__private.index.cuidToValues[cuid][key] = newValue;
          }
        }
      });

      item[UPDATED_AT_KEY] = Date.now();
      collection.merge(item[ID_KEY], item);
    });
  }

  // Apply query options to mutated results before returning them.
  return applyQueryOptions(mutated, options);
}

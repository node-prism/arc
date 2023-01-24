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
import { ensureArray, Ov } from "./utils";

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
      item[UPDATED_AT_KEY] = Date.now();
      collection.merge(item[ID_KEY], item);
    });
  }

  // Apply query options to mutated results before returning them.
  return applyQueryOptions(mutated, options);
}

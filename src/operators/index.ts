import { Collection } from "..";
import { Ok } from "../utils";
import { $gt } from "./boolean/gt";
import { $gte } from "./boolean/gte";
import { $lt } from "./boolean/lt";
import { $lte } from "./boolean/lte";
import { $and } from "./boolean/and";
import { $set } from "./mutation/set";
import { $change } from "./mutation/change";
import { $inc, $dec, $mult, $div } from "./mutation/math";
import { $includes } from "./boolean/includes";
import { $in } from "./boolean/in";
import { $append } from "./mutation/append";
import { $merge } from "./mutation/merge";

export const booleanOperators = {
  $gt,
  $gte,
  $lt,
  $lte,
  $and,
  $includes,
  $in,
};

const mutationOperators = {
  $append,
  $merge,
  $set,
  $change,
  $inc,
  $dec,
  $mult,
  $div,
};

export function processMutationOperators<T>(
  source: T[],
  ops: object,
  query: object,
  collection: Collection<T>
): T[] {
  Ok(ops).forEach((operator) => {
    if (!mutationOperators[operator]) {
      console.warn(`unknown operator: ${operator}`);
      return;
    }

    source = mutationOperators[operator]<T>(
      source,
      ops[operator],
      query,
      collection
    );
  });

  return source;
}

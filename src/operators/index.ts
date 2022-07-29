import { Collection } from "..";
import { Ok } from "../utils";
import { $gt } from "./boolean/gt";
import { $gte } from "./boolean/gte";
import { $lt } from "./boolean/lt";
import { $lte } from "./boolean/lte";
import { $and } from "./boolean/and";
import { $or } from "./boolean/or";
import { $fn } from "./boolean/fn";
import { $re } from "./boolean/re";
import { $includes } from "./boolean/includes";
import { $oneOf } from "./boolean/oneOf";
import { $length } from "./boolean/length";
import { $set } from "./mutation/set";
import { $unset } from "./mutation/unset";
import { $change } from "./mutation/change";
import { $inc, $dec, $mult, $div } from "./mutation/math";
import { $append } from "./mutation/append";
import { $merge } from "./mutation/merge";

export const booleanOperators = {
  $gt,
  $gte,
  $lt,
  $lte,
  $and,
  $or,
  $includes,
  $oneOf,
  $fn,
  $re,
  $length,
};

const mutationOperators = {
  $append,
  $merge,
  $set,
  $unset,
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

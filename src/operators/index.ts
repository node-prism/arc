import { Collection } from "..";
import { Ok } from "../utils";
import { $gt } from "./boolean/gt";
import { $gte } from "./boolean/gte";
import { $lt } from "./boolean/lt";
import { $lte } from "./boolean/lte";
import { $and } from "./boolean/and";
import { $or } from "./boolean/or";
import { $xor } from "./boolean/xor";
import { $fn } from "./boolean/fn";
import { $re } from "./boolean/re";
import { $includes } from "./boolean/includes";
import { $oneOf } from "./boolean/oneOf";
import { $length } from "./boolean/length";
import { $not } from "./boolean/not";
import { $has } from "./boolean/has";
import { $hasAny } from "./boolean/hasAny";
import { $set } from "./mutation/set";
import { $unset } from "./mutation/unset";
import { $change } from "./mutation/change";
import { $inc, $dec, $mult, $div } from "./mutation/math";
import { $merge } from "./mutation/merge";
import { $map } from "./mutation/map";
import { $filter } from "./mutation/filter";
import { $push } from "./mutation/push";
import { $unshift } from "./mutation/unshift";

export const booleanOperators = {
  $gt,
  $gte,
  $lt,
  $lte,
  $and,
  $or,
  $xor,
  $includes,
  $oneOf,
  $fn,
  $re,
  $length,
  $not,
  $has,
  $hasAny,
};

const mutationOperators = {
  $merge,
  $map,
  $filter,
  $push,
  $unshift,
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

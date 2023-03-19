import dot from "dot-wild";
import { ensureArray } from "../../utils";

enum ComparisonOperator {
  GreaterThan = "$gt",
  GreaterThanEquals = "$gte",
  LessThan = "$lt",
  LessThanEquals = "$lte",
}

function match(source: object, query: object, operator: ComparisonOperator): boolean {
  return Object.entries(query).map(([key, value]) => {
    const qry = ensureArray(value[operator]);
    const targetValue = dot.get(source, key);
    if (targetValue === undefined) return false;
    return qry.some(q => {
      if (typeof targetValue === "string" || typeof targetValue === "number") {
        switch (operator) {
          case ComparisonOperator.GreaterThan:
            return targetValue > q;
          case ComparisonOperator.GreaterThanEquals:
            return targetValue >= q;
          case ComparisonOperator.LessThan:
            return targetValue < q;
          case ComparisonOperator.LessThanEquals:
            return targetValue <= q;
          default:
            return false;
        }
      } else if (Array.isArray(targetValue)) {
        switch (operator) {
          case ComparisonOperator.GreaterThan:
            return targetValue.length > q;
          case ComparisonOperator.GreaterThanEquals:
            return targetValue.length >= q;
          case ComparisonOperator.LessThan:
            return targetValue.length < q;
          case ComparisonOperator.LessThanEquals:
            return targetValue.length <= q;
          default:
            return false;
        }
      }
      return false;
    });
  }).every(Boolean);
}

export function $gt(source: object, query: object): boolean {
  return match(source, query, ComparisonOperator.GreaterThan);
}

export function $gte(source: object, query: object): boolean {
  return match(source, query, ComparisonOperator.GreaterThanEquals);
}

export function $lt(source: object, query: object): boolean {
  return match(source, query, ComparisonOperator.LessThan);
}

export function $lte(source: object, query: object): boolean {
  return match(source, query, ComparisonOperator.LessThanEquals);
}

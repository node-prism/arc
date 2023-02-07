import dot from "dot-wild";
import { Collection } from "../../collection";
import { ensureArray, isObject, Ok, unescapedFlatten } from "../../utils";

enum Op {
  Inc,
  Dec,
  Mult,
  Div,
}

function math<T>(
  source: T[],
  modifiers: any,
  query: object,
  op: Op,
  collection: Collection<T>
): T[] {
  const mods = ensureArray(modifiers);
  source = source.map((document) => {

    mods.forEach((mod) => {
      if (isObject(mod)) {
        // update({ a: 1 }, { $inc: { visits: 1 } })
        // update({ a: 1 }, { $inc: { a: { b: { c: 5 }}, "d.e.f": 5 } })
        const flattened = unescapedFlatten(mod);

        Ok(flattened).forEach((key) => {
          const targetValue = dot.get(document, key);
          const modValue = Number(mod[key]);

          switch (op) {
            case Op.Inc:
              if (targetValue === undefined) {
                document = dot.set(document, key, modValue);
              } else {
                document = dot.set(document, key, Number(targetValue) + modValue);
              }
              break;
            case Op.Dec:
              if (targetValue === undefined) {
                document = dot.set(document, key, -modValue);
              } else {
                document = dot.set(document, key, Number(targetValue) - modValue);
              }
              break;
            case Op.Mult:
              if (targetValue === undefined) {
                document = dot.set(document, key, modValue);
              } else {
                document = dot.set(document, key, Number(targetValue) * modValue);
              }
              break;
            case Op.Div:
              if (targetValue === undefined) {
                document = dot.set(document, key, modValue);
              } else {
                document = dot.set(document, key, Number(targetValue) / modValue);
              }
              break;
          }
        });
      } else if (typeof mod === "number") {
        // When the modifier is a number, we increment all numeric
        // fields that are in the provided query.
        // update({ a: 1 }, { $inc: 1 }) -> { a: 2 }
        // update({ a: 1, b: 1 }, { $inc: 1 }) -> { a: 2, b: 2 }
        // update({ "a.b.c": 1 }, { $inc: 1 }) -> { a: { b: { c: 2 } } }
        // update({ a: { b: { c: 1 } } }, { $inc: 1 }) -> { a: { b: { c: 2 } } }
        // update({ "b.c": { $gt: 1 } }, { $inc: 1 }) -> { b: { c: 3 } }
        let flattened = unescapedFlatten(query);

        // "a.b.c.$gt" => "a.b.c", assumes we want to mutate the value of 'c'.
        flattened = Object.keys(flattened).reduce((acc, key) => {
          const removed = key.replace(/\.\$.*$/, "");
          acc[removed] = flattened[key];
          return acc;
        }, {});

        Ok(flattened).forEach((key) => {
          const targetValue = dot.get(document, key);
          // It's possible that targetValue is undefined, for example
          // if we deeply selected this document, e.g.
          // Given document:
          // { a: { b: { c: 1 } } }
          // The operation:
          // update({ c: 1 }, { $inc: 5 });
          // Would find the above document, but create a new
          // property `c` at the root level of the document:
          // { a: { b: { c: 1 } }, c: 5 }
          //
          // To update the deep `c`, we'd do something like:
          // update({ "a.b.c": 1 }, { $inc: 5 });
          // or:
          // update({ c: 1 }, { $inc: { "a.b.c": 5 } });
          // or:
          // update({ a: { b: { c: 1 } } }, { $inc: 5 });
          switch (op) {
            case Op.Inc:
              if (targetValue === undefined) {
                document = dot.set(document, key, mod);
              } else {
                document = dot.set(document, key, Number(targetValue) + mod);
              }
              break;
            case Op.Dec:
              if (targetValue === undefined) {
                document = dot.set(document, key, -mod);
              } else {
                document = dot.set(document, key, Number(targetValue) - mod);
              }
              break;
            case Op.Mult:
              if (targetValue === undefined) {
                document = dot.set(document, key, mod);
              } else {
                document = dot.set(document, key, Number(targetValue) * mod);
              }
              break;
            case Op.Div:
              if (targetValue === undefined) {
                document = dot.set(document, key, mod);
              } else {
                document = dot.set(document, key, Number(targetValue) / mod);
              }
              break;
          }

          return;
        });
      }
    });

    return document;
  });

  return source;
}

export function $inc<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  return math<T>(source, modifiers, query, Op.Inc, collection);
}

export function $dec<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  return math<T>(source, modifiers, query, Op.Dec, collection);
}

export function $mult<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  return math<T>(source, modifiers, query, Op.Mult, collection);
}

export function $div<T>(
  source: T[],
  modifiers: any,
  query: object,
  collection: Collection<T>
): T[] {
  return math<T>(source, modifiers, query, Op.Div, collection);
}

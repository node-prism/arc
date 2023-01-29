# arc

Lightweight, in-memory, optionally persistent, 100% JavaScript document database with no binary dependencies.

*This library is under active development and the API is likely to evolve as features are expanded, however it's unlikely that there will be any breaking changes.*

* [Installation](#installation)
* [API overview](#api-overview)
  * [Creating a collection](#creating-a-collection)
  * [Inserting](#inserting)
  * [Finding](#finding)
  * [Updating](#updating)
  * [Removing](#removing)
  * [Query options](#query-options)
    * [ifNull](#ifnull)
    * [ifEmpty](#ifempty)
    * [Sorting](#sorting)
    * [Skip & take (i.e. LIMIT)](#skip--take-ie-limit)
    * [Projection](#projection)
      * [Implicit exclusion](#implicit-exclusion)
      * [Implicit inclusion](#implicit-inclusion)
      * [Explicit](#explicit)
      * [Aggregation](#aggregation)
    * [Joining](#joining)
  * [Misc](#misc)
    * [Renaming builtin property names](#renaming-builtin-property-names)
    * [Documents](#documents)

# Installation

```bash
npm i @prsm/arc
```

# API overview

For a more thorough API reference, please look at the tests in this repository.

## Creating a collection

A collection is just a `.json` file.

```typescript
import { Collection } from "@prsm/arc";

type Planet = {
  planet: string;
  diameter: number;
  population?: number;
  temp: {
    avg: number;
  };
};

// from `./.data` load or create `planets.json`
const collection = new Collection<Planet>(".data", "planets");
```

## Inserting

See [inserting tests](tests/specs/insert/basic.test.ts) for more examples.

```typescript
collection.insert({ planet: "Mercury", diameter: 4880, temp: { avg: 475 } });
collection.insert([
  { planet: "Venus", diameter: 12_104, temp: { avg: 737_000 } },
  { planet: "Earth", diameter: 12_742, temp: { avg: 288 } },
]);
```

## Finding

See [finding tests](tests/specs/finding/basic.test.ts) for more examples.

```typescript
// finds Earth document
collection.find({ avg: 288 });
collection.find({ planet: "Earth" });

// finds Venus and Earth documents
collection.find({ diameter: { $gt: 12_000 } });

// finds Mercury and Earth documents
collection.find({ temp: { avg: { $lt: 1_000 } } });

// finds Mercury and Earth documents
collection.find({ $and: [{ avg: { $gt: 100 } }, { avg: { $lt: 10_000 } }] });
```

## Updating

See [mutation tests](tests/specs/operators/mutation/index.ts) for more examples.

Any queries that work with `.find` work with `.update`.

```typescript
// increase population, creating the property if it doesn't exist.
collection.update({ planet: "Earth" }, { $inc: { population: 1 } });
```

## Removing

See [remove tests](tests/specs/remove/basic.test.ts) for more examples.

Any queries that work with `.find` work with `.remove`.

```typescript
// remove every planet except Earth
collection.remove({ $not: { planet: "Earth" } });
```

## Query options

`find`, `update` and `remove` accept a `QueryOptions` object.

```typescript
{
  /** When true, attempts to deeply match the query against documents. */
  deep: boolean;

  /** Provide fallback values for null or undefined properties */
  ifNull: Record<string, any>;

  /** Provide fallback values for 'empty' properties ([], {}, "") */
  ifEmpty: Record<string, any>;

  /** Provide fallback values for null, undefined, or 'empty' properties. */
  ifNullOrEmpty: Record<string, any>;

  /**
   * -1 || 0: descending
   *  1: ascending
   */
  sort: { [property: string]: -1 | 0 | 1 };

  /**
   * Particularly useful when sorting, `skip` defines the number of documents
   * to ignore from the beginning of the result set.
   */
  skip: number;

  /** Determines the number of documents returned. */
  take: number;

  /**
   * 1: property included in result document
   * 0: property excluded from result document
   */
  project: {
    [property: string]: 0 | 1;
  };

  aggregate: {
    [property: string]:
      Record<"$floor", string> |
      Record<"$ceil", string> |
      Record<"$sub", (string|number)[]> |
      Record<"$mult", (string|number)[]> |
      Record<"$div", (string|number)[]> |
      Record<"$add", (string|number)[]> |
      Record<"$fn", (document) => unknown>;
  };

  join: Array<{
    /** The collection to join on. */
    collection: Collection<any>;

    /** The property containing the foreign key(s). */
    from: string;

    /** The property on the joining collection that the foreign key should point to. */
    on: string;

    /** The name of the property to be created while will contain the joined documents. */
    as: string;

    /** QueryOptions that will be applied to the joined collection. */
    options?: QueryOptions;
  }>;
}
```

### ifNull

See [ifNull.test.ts](tests/specs/options/ifNull.test.ts) for more examples.

```typescript
// [
//   { a: 1, b: 2, c: 3 },
// ];

collection.find({ a: 1 }, { ifNull: { d: 4 } });

// [
//   { a: 1, b: 2, c: 3, d: 4 },
// ];
```

### ifEmpty

See [ifEmpty.test.ts](tests/specs/options/ifEmpty.test.ts) for more examples.

```typescript
// [
//   { a: 1, b: 2, c: 3, d: "  " },
//   { a: 1, b: 2, c: 3, d: [] },
//   { a: 1, b: 2, c: 3, d: {} },
// ];

collection.find({ a: 1 }, { ifEmpty: { d: 4 } });

// [
//   { a: 1, b: 2, c: 3, d: 4 },
//   { a: 1, b: 2, c: 3, d: 4 },
//   { a: 1, b: 2, c: 3, d: 4 },
// ];
```

### Sorting

See [sort.test.ts](tests/specs/options/sort.test.ts) for more examples.

```typescript
// [
//   { name: "Deanna Troi", age: 28 },
//   { name: "Worf", age: 24 },
//   { name: "Xorf", age: 24 },
//   { name: "Zorf", age: 24 },
//   { name: "Jean-Luc Picard", age: 59 },
//   { name: "William Riker", age: 29 },
// ];

collection.find({ age: { $gt: 1 } }, { sort: { age: 1, name: -1 } });
//                                                  └─ asc    └─ desc

// [
//   { name: "Zorf", age: 24 },
//   { name: "Xorf", age: 24 },
//   { name: "Worf", age: 24 },
//   { name: "Deanna Troi", age: 28 },
//   { name: "William Riker", age: 29 },
//   { name: "Jean-Luc Picard", age: 59 },
// ];
```

### Skip & take (i.e. LIMIT)

See [skip_take.test.ts](tests/specs/options/skip_take.test.ts) for more examples.

Mostly useful when paired with `sort`.

```typescript
// [
//   { a: 1, b: 1, c: 1 },
//   { a: 2, b: 2, c: 2 },
//   { a: 3, b: 3, c: 3 },
// ];

collection.find({ a: { $gt: 0 } }, { skip: 1, take: 1 });

// [
//   { a: 2, b: 2, c: 2 },
// ];
```

### Projection

See [project.test.ts](tests/specs/options/project.test.ts) for more examples.

The ID property of a document is always included unless explicitly excluded.

#### Implicit exclusion

When all projected properties have a value of `1`, this
is "implicit exclusion" mode.

In this mode, all document properties that are not defined
in the projection are excluded from the result document.

```typescript
// [
//   { a: 1, b: 1, c: 1 },
// ];

collection.find({ a: 1 }, { project: { b: 1 } });

// [
//   { _id: .., b: 1 },
// ];
```

#### Implicit inclusion

When all projected properties have a value of `0`, this
is "implicit inclusion" mode.

In this mode, all document properties that are not defined
in the projection are included from the result document.

```typescript
// [
//   { a: 1, b: 1, c: 1 },
// ];

collection.find({ a: 1 }, { project: { b: 0 } });

// [
//   { _id: .., a: 1, c: 1 },
// ];
```

#### Explicit

In the only remaining case, all document properties
are included unless explicitly removed with a `0`.

This is effectively the same behavior as implicit inclusion.

```typescript
// [
//   { a: 1, b: 1, c: 1 },
// ];

collection.find({ a: 1 }, { project: { b: 1, c: 0 } });

// [
//   { _id: .., a: 1, b: 1 },
// ];
```

#### Aggregation

See [project.test.ts](tests/specs/options/project.test.ts) for more examples.

You can use aggregation to create intermediate properties derived from other document properties, and then project those intermediate properties out of the result set.

```typescript
// [
//   { math: 72, english: 82, science: 92 },
//   { math: 60, english: 70, science: 80 },
//   { math: 90, english: 72, science: 84 }
// ]

collection.find(
  {},
  {
    aggregate: {
      total: { $add: ["math", "english", "science"] },
      average: { $div: ["total", 3] },
    },
    project: {
      _id: 0,
      total: 0,
    },
  }
);

// [
//   { math: 72, english: 82, science: 92, average: 82 },
//   { math: 60, english: 70, science: 80, average: 70 },
//   { math: 90, english: 72, science: 84, average: 82 },
// ]
```

You can also use dot notation to reference deeply-nested properties, e.g.:

```typescript
aggregate: {
  // ...
  total: { $add: ["scores.math", "scores.english", "scores.science" ] },
  // ...
}
```

Define arbitrary functions to be used as the aggregation handler:

```typescript
collection.find(
  { $has: ["first", "last"] },
  {
    aggregate: {
      fullName: { $fn: (doc) => `${doc.first} ${doc.last}` },
    },
  }
);
```

### Joining

See [join.test.ts](tests/specs/options/join.test.ts) for more examples.

Joining allows you to join data from other collections.

```typescript
// "users" collection

// [
//   { name: "Alice", purchasedTicketIds: [1, 2] },
// ];

// "tickets" collection

// [
//   { _id: 0, seat: "A1" },
//   { _id: 1, seat: "B1" },
//   { _id: 2, seat: "C1" },
//   { _id: 3, seat: "D1" },
// ];

users.find(
  { name: "Alice" },
  {
    join: [
      {
        collection: tickets,
        from: "purchasedTicketIds",
        on: "_id",
        as: "tickets",
        options: {
          project: { _id: 0 },
        },
      },
    ],
  }
);

// [
//   {
//     name: "Alice",
//     purchasedTicketIds: [1, 2],
//     tickets: [
//       { seat: "B1" },
//       { seat: "C1" },
//     ],
//   },
// ];
```

You can also use dot notation when defining the `from` or `as` fields:

```typescript
// "inventory" collection

// {
//   name: "Bob",
//   items: [
//     { itemId: 3, quantity: 1 }, <-- we want to join on these `id` properties
//     { itemId: 5, quantity: 2 },
//   ],
// }

// "items" collection

// [
//   { _id: 3, name: "The Unstoppable Force", atk: 100 },
//   { _id: 4, name: "Sneakers", agi: 100 },
//   { _id: 5, name: "The Immovable Object", def: 100 },
// ]

users.find(
  { name: "Bob" },
  {
    join: [
      {
        collection: items,
        from: "items.*.itemId",
        on: "_id",
        as: "items.*.meta", // creates a new `meta` property for each item in `from`
        options: {
          project: { _id: 0, _created_at: 0, _updated_at: 0 },
        }
      },
    ],
  }
);

// [
//   {
//     name: "Bob",
//     items: [
//       { itemId: 3, quantity: 1, meta: { name: "The Unstoppable Force", atk: 100 } },
//       { itemId: 5, quantity: 2, meta: { name: "The Immovable Object", def: 100 } },
//     ],
//   }
// ]
```

`join` allows for `options` (type `QueryOptions`) which in turn allows for `join`.
Said another way, joins can be nested infinitely for more hierarchical relationships between collections.

```typescript
users.find(
  { .. },
  {
    join: [{
      collection: tickets,
      options: {
        join: [{
          collection: seats,
          options: {
            join: [{
              collection: auditoriums,
            }]
          }
        }]
      }
    }]
  }
);
```

## Misc

### Renaming builtin property names

The default property names for document ID (default `_id`), "created at"
(default `_created_at`) and "updated at" (default `_updated_at`) timestamps can all be changed.

```typescript
import { ID_KEY, CREATED_AT_KEY, UPDATED_AT_KEY } from "@prsm/arc";

ID_KEY = "id";
CREATED_AT_KEY = "createdAt";
UPDATED_AT_KEY = "updatedAt";
```

If you do this, make sure to do it at the beginning of collection creation.

### Documents

The returned value from `find`, `update` and `remove` is always an array, even when there
are no results.

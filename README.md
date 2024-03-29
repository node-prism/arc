# arc

[![NPM version](https://img.shields.io/npm/v/@prsm/arc?color=a1b858&label=)](https://www.npmjs.com/package/@prsm/arc)

This is a lightweight, in-memory, optionally persistent, and fully JavaScript-based document database. You can use it with node, in a browser using the localStorage adapter, or as an embedded database solution for your electron app.

_Please note that this library is currently under active development and its API may evolve as new features are added. However, it is unlikely that any breaking changes will be introduced._

- [Installation](#installation)
- [API overview](#api-overview)
  - [Creating a collection](#creating-a-collection)
  - [Persistence](#persistence)
    - [Storage adapters](#storage-adapters)
    - [Using another adapter](#using-another-adapter)
    - [Auto sync](#auto-sync)
  - [Indexing](#indexing)
    - [Index limitations](#index-limitations)
  - [Inserting](#inserting)
  - [Finding](#finding)
    - [Boolean operators](#boolean-operators)
      - [$and](#and)
      - [$or](#or)
      - [$xor](#xor)
      - [$has](#has)
      - [$hasAny](#hasany)
      - [$includes](#includes)
      - [$length](#length)
      - [$oneOf](#oneof)
      - [$re](#re)
      - [$fn](#fn)
      - [$gt, $gte, $lt, $lte](#gt-gte-lt-lte)
  - [Updating](#updating)
    - [Mutation operators](#mutation-operators)
      - [$set](#set)
      - [$unset](#unset)
      - [$change](#change)
      - [$push](#push)
      - [$unshift](#unshift)
      - [$merge](#merge)
      - [$map](#map)
      - [$inc, $dev, $mult, $div](#inc-dev-mult-div)
  - [Removing](#removing)
  - [Query options](#query-options)
    - [ifNull](#ifnull)
    - [ifEmpty](#ifempty)
    - [ifNullOrEmpty](#ifnullorempty)
    - [Sorting](#sorting)
    - [Skip & take (i.e. LIMIT)](#skip--take-ie-limit)
    - [Projection](#projection)
      - [Implicit exclusion](#implicit-exclusion)
      - [Implicit inclusion](#implicit-inclusion)
      - [Explicit](#explicit)
    - [Aggregation](#aggregation)
    - [Joining](#joining)
  - [Misc](#misc)
    - [Builtin property name defaults](#builtin-property-name-defaults)
    - [Documents](#documents)

# Installation

```bash
npm i @prsm/arc
```

# Quick note before you read on

arc runs entirely in-process &mdash; not as a port-bound service. [`@prsm/arc-server`](https://github.com/node-prism/arc-server) fills this gap.

## @prsm/arc-server

[https://github.com/node-prism/arc-server](https://github.com/node-prism/arc-server)

If you'd prefer to run this as a self-contained service within your stack that accepts connections over TCP, authenticates them, and receives and responds to queries in this manner, you may want to use `@prsm/arc-server`. It's currently moderately opinionated in the way that it handles authentication (no RBAC or Collection-level permissions), so if it does not meet your expectations, you may consider developing your own service-based solution.

## @prsm/arc-client

[https://github.com/node-prism/arc-client](https://github.com/node-prism/arc-client)

If you decide to use [`@prsm/arc-server`](https://github.com/node-prism/arc-server), you most likely also want to use [`@prsm/arc-client`](https://github.com/node-prism/arc-client) as a means of simplifying communication with `@prsm/arc-server`

# API overview

For a comprehensive API reference, please refer to the [tests](./tests/specs/) in this repository.

## Creating a collection

A collection is just a `.json` file when you're using the default `FSAdapter`.

```typescript
import { Collection, FSAdapter } from "@prsm/arc";

type Planet = {
  planet: {
    name: string;
    population?: number;
    moons: string[];
    temp: {
      avg: number;
    };
    composition: {
      type: "gas" | "molten" | "ice";
    };
  };
};

// from `./.data` load or create `planets.json`
const collection = new Collection<Planet>({
  adapter: new FSAdapter({ storagePath: ".data", name: "planets" }),
});
```

## Persistence

### Storage adapters

The method of data retrieval and storage depends on the `StorageAdapter` used by the collection. The default storage adapter is `FSAdapter`, which reads and writes data to a file. To achieve persistence in a browser environment, you may use the included `LocalStorageAdapter`. Alternatively, you can create a custom adapter by implementing the `StorageAdapter` interface. Additionally, an `EncryptedFSAdapter` is available that encrypts data before writing and decrypts it before reading.

### Using another adapter

```typescript
import { EncryptedFSAdapter } from "@prsm/arc";

process.env.ARC_ENCFS_KEY = "Mahpsee2X7TKLe1xwJYmar91pCSaZIY7";

new Collection<Planet>({
  autosync: false,
  adapter: new EncryptedFSAdapter({ storagePath: ".data", name: "planets" }),
});
```

### Auto sync

By default, any operation that modifies data is followed by a synchronization using the adapter with which the collection was initialized. You have the option to disable this `autosync` feature during collection creation:

```typescript
new Collection<Planet>({
  autosync: false,
  adapter: new FSAdapter({ storagePath: ".data", name: "planets" }),
});
```

When `autosync` is disabled, you must call `collection.sync()` to persist, which calls the in-use adapter's `write` method.

## Indexing

- Indexes can be deeply nested properties, e.g.: `createIndex({ key: "planet.composition.type" })`

  When defining indexes using dot notation, the performance benefit of using indexes is the same whether you choose to find documents by using dot notation syntax or object syntax. In other words, the queries below provide the same performance benefit.

  ```typescript
  find({ "planet.composition.type": "gas" });
  find({ planet: { composition: { type: "gas" } } });
  ```

- The value of the key must be a type that can be converted to a string using `String(value)`.
- Indexes can optionally enforce a unique constraint, e.g.: `createIndex({ key: "planet.life.dominant_species", unique: true })`
- You can create an index at any time, even if your database has existing records with the index key provided, although ideally they are defined at the point of database creation.

In large databases, **_especially_** with complex documents, you will see a noticeable performance boost when making practical use of indexes:

In a collection made up of 1,000,000 `Planet` documents:

- Without an index on `planet.composition.type`, a `find({ "planet.composition.type": "gas" })` takes an average of 2s.
- With an index on `planet.composition.type`, a `find({ "planet.composition.type": "gas" })` takes an average of 25ms, which is **_80x faster_**.

These numbers were seen while benchmarking on a 2022 M1. YMMV.

### Index limitations

You can't combine boolean expressions with indexes, because the result of the expression isn't known until the expression is evaluated, which defeats the purpose of an index entirely. In other words, the following would be true assuming you had an index key defined at "planet.composition.type":

```typescript
// This bypasses known index records for the key "planet.composition.type",
// because the documents that match the provided expression cannot be known
// until the `$oneOf` expression is evaluated.
find({ "planet.composition.type": { $oneOf: ["gas", "molten"] } });

// Instead, if performance was a concern for this query, you'd be better off
// doing something like this:
const gas = find({ "planet.composition.type": "gas" }); // index hit
const molten = find({ "planet.composition.type": "molten" }); // index hit
```

## Inserting

See the [inserting tests](tests/specs/insert/basic.test.ts) for more examples.

```typescript
insert({
  planet: {
    name: "Mercury",
    moons: [],
    temp: { avg: 475 },
    composition: "molten",
  },
});
insert([
  {
    planet: { name: "Venus", moons: [], temp: { avg: 737_000 } },
    composition: "molten",
  },
  {
    planet: {
      name: "Earth",
      population: 8_000_000_000,
      moons: ["Luna"],
      temp: { avg: 13 },
      composition: "molten",
    },
  },
  {
    planet: {
      name: "Jupiter",
      moons: ["Io", "Europa", "Ganymede"],
      temp: { avg: -145 },
      composition: "molten",
    },
  },
]);
```

## Finding

arc's query syntax is uncomplicated and, with the many builtin boolean operators, enables the creation of complex yet intelligible queries. These boolean operators, described below, may seem familiar to those who have experience with either [MongoDB](https://www.mongodb.com) or [NeDB](https://github.com/louischatriot/nedb).

See the [finding tests](tests/specs/finding/basic.test.ts) for more examples.

Here's a brief overview:

```typescript
find({ avg: -145 }); // implicit deep searching
find({ planet: { temp: { avg: -145 } } }); // explicit deep searching
find({ "planet.temp.avg": -145 }); // dot notation
find({ avg: { $gt: 12_000 } });
find({ temp: { avg: { $lt: 1_000 } } });
find({ "planet.temp.avg": { $lt: 1_000 } });
find({ $and: [{ avg: { $gt: 100 } }, { avg: { $lt: 10_000 } }] });
find({
  $and: [{ $not: { $has: "planet.population" } }, { moons: { $gt: 1 } }],
});
find({ $and: [{ "planet.temp.avg": { $gt: 100 } }, { avg: { $lt: 10_000 } }] });
find({ planet: { name: { $length: { $gt: 7 } } } }); // string length
find({ "planet.moons": { $length: 1 } }); // array length
find({ "planet.composition.type": { $oneOf: ["molten", "gas"] } });

// etc.
find({ $not: { a: 1, b: 2 } });
find({ $not: { "planet.temp.avg": { $gt: 10_000 } } });
find({ $and: [{ $not: { a: { $lte: 2 } } }, { $not: { a: { $gte: 5 } } }] });
find({ $xor: [{ planet: { $includes: "art" } }, { num: { $lt: 9 } }] });
```

### Boolean operators

#### $and

[Read tests](tests/specs/operators/boolean/and.test.ts)

```typescript
find({ $and: [{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }] });
find({
  $and: [
    { "planet.name": { $includes: "Ea" } },
    { population: { $gt: 1_000_000 } },
  ],
});
find({
  $and: [
    { "planet.composition.type": "gas" },
    { planet: { moons: { $length: { $gt: 5 } } } },
  ],
});
```

#### $or

[Read tests](tests/specs/operators/boolean/or.test.ts)

```typescript
find({
  $or: [
    { planet: { temp: { avg: { $lt: 100 } } } },
    { "planet.temp.avg": { $gt: 5_000 } },
  ],
});
find({ $or: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }] });
```

#### $xor

[Read tests](tests/specs/operators/boolean/xor.test.ts)

```typescript
find({ $xor: [{ a: 1 }, { b: 2 }] });
find({
  $xor: [{ $has: "planet.population" }, { "planet.moons": { $length: 0 } }],
});
```

#### $has

`$has` returns documents that have the provided properties, and expects property references to be provided in dot notation.

[Read tests](tests/specs/operators/boolean/has.test.ts)

```typescript
find({ $has: "planet.population" });
find({ $has: ["planet.population", "planet.temp.avg"] }); // documents that have BOTH of these properties
```

#### $hasAny

`$hasAny` returns documents that have any of the provided properties, and expects property references to be provided in dot notation.

[Read tests](tests/specs/operators/boolean/hasAny.test.ts)

```typescript
find({ $hasAny: ["planet.population", "planet.temp.avg"] }); // documents that have EITHER of these properties
find({ planet: { $hasAny: ["population", "temp.avg"] } }); // effectively the same as above
```

#### $includes

For an "excludes" query, prefix this with `$not`.

[Read tests](tests/specs/operators/boolean/includes.test.ts)

```typescript
find({ planet: { moons: { $includes: "Io" } } }); // Array.includes, because planet.moons is an array
find({ planet: { name: { $includes: "Ear" } } }); // String.includes, because planet.name is a string
find({ "planet.moons": { $includes: ["Io", "Europa"] } }); // match when ALL of the provided values are included in the document array
find({ $not: { "planet.moons": { $includes: "Io" } } }); // planets that do not have a moon named "Io"
```

#### $length

[Read tests](tests/specs/operators/boolean/length.test.ts)

```typescript
find({ "planet.name": { $length: 5 } }); // String.length
find({ "planet.moons": { $length: 0 } }); // Array.length
```

#### $oneOf

[Read tests](tests/specs/operators/boolean/oneOf.test.ts)

```typescript
find({ "planet.composition.type": { $oneOf: ["gas", "molten", "rock"] } });
```

#### $re

[Read tests](tests/specs/operators/boolean/re.test.ts)

```typescript
find({ "visitor.ip": { $re: IP_REGEX } });
```

#### $fn

[Read tests](tests/specs/operators/boolean/fn.test.ts)

```typescript
const populated = (v) => v > 1_000_000;
const notOverlyPopulated = (v) => v < 2_000_000;

find({ planet: { population: { $fn: populated } } });
find({ planet: { population: { $fn: [populated, notOverlyPopulated] } } });
```

#### $gt, $gte, $lt, $lte

When used against a number, does a numeric comparison. When used against a string, does a lexicographical comparison. When used against an array, does an array length comparison.

- [Read $gt tests](tests/specs/operators/boolean/gt.test.ts)
- [Read $gte tests](tests/specs/operators/boolean/gte.test.ts)
- [Read $lt tests](tests/specs/operators/boolean/lt.test.ts)
- [Read $lte tests](tests/specs/operators/boolean/lte.test.ts)

```typescript
find({ "planet.temp.avg": { $lt: 500 } }); // numeric comparison
find({ planet: { name: { $gt: "Earth" } } }); // lexicographical comparison
find({ "planet.moons": { $gt: 2 } }); // array length comparison; planets with more than two moons
```

## Updating

Any queries that work with `Collection.find` will also work with `Collection.update`.

Updating documents involves applying various mutation operators to whichever documents match the provided query, i.e.: `update(query, mutations)`.

The following mutation operators are available, and should support most, if not all, use cases:

### Mutation operators

#### $set

[Read tests](tests/specs/operators/mutation/set.test.ts)

```typescript
// given
// { a: 1, b: { c: 2 } }
update({ a: 1 }, { $set: { a: 2 }}) // -> { a: 2 }
update({ c: 2 }, { $set: { d: 3 }}) // -> { a: 1, b: { c: 2 }, d: 3 }
update({ c: 2 }, { $set: { b: { c: 3 }}) // -> { a: 1, b: { c: 3 } }
update({ c: 2 }, { $set: { "b.c": 3 }}) // -> { a: 1, b: { c: 3 } }
update({ a: 1 }, { $set: { ...someObject }}) // -> { a: 1, ...someObject }
```

#### $unset

[Read tests](tests/specs/operators/mutation/unset.test.ts)

```typescript
// given
// { a: 1, b: { c: 2 } }
update({ a: 1 }, { $unset: "b.c" }); // -> { a: 1 }
update({ a: 1 }, { $unset: ["a", "b.c"] }); // -> {}
// given
// { a: 1, b: [{ c: 1, d: 1 }, { c: 2, d: 2 }] }
update({ a: 1 }, { $unset: "b.*.c" }); // -> { a: 1, b: [{ d: 1 }, { d: 2 }] }
```

#### $change

[Read tests](tests/specs/operators/mutation/change.test.ts)

Like `$set`, but refuses to create new properties.

```typescript
// given
// { a: 1 }
update({ a: 1 }, { $change: { a: 2 } }); // -> { a: 2 }
update({ a: 1 }, { $change: { b: 2 } }); // -> { a: 1 }, no property created
```

#### $push

[Read tests](tests/specs/operators/mutation/push.test.ts)

Push will concat an item or items to an array. It refuses to create the target array if it does not exist.

```typescript
// given
// { a: 1, b: [1] }
update({ a: 1 }, { $push: { b: 2 } }); // -> { a: 1, b: [1, 2] }
update({ a: 1 }, { $push: { b: [2, 3] } }); // -> { a: 1, b: [1, 2, 3] }
// given
// { a: 1 }
update({ a: 1 }, { $push: { b: 2 } }); // -> { a: 1 }, no property created
// given
// { a: 1, b: { c: [] } }
update({ $has: "b.c" }, { $push: { "b.c": 1 } }); // -> { a: 1, b: { c: [1] } }
```

#### $unshift

[Read tests](tests/specs/operators/mutation/unshift.test.ts)

Unshift will insert new elements to the start of the target array. It refuses to create the target array if it does not exist.

```typescript
// given
// { a: 1, b: [1] }
update({ a: 1 }, { $unshift: { b: 2 } }); // -> { a: 1, b: [2, 1] }
update({ a: 1 }, { $unshift: { b: [2, 3] } }); // -> { a: 1, b: [2, 3, 1] }
// given
// { a: 1 }
update({ a: 1 }, { $unshift: { b: 2 } }); // -> { a: 1 }, no property created
// given
// { a: 1, b: { c: [] } }
update({ $has: "b.c" }, { $unshift: { "b.c": 1 } }); // -> { a: 1, b: { c: [1] } }
```

#### $merge

[Read tests](tests/specs/operators/mutation/merge.test.ts)

Merge the provided object into the documents that match the query.

```typescript
// given
// { a: 1, b: { c: 5 }}
update({ a: 1 }, { $merge: { a: 2, b: { d: 6 } } }); // -> { a: 2, b: { c: 5, d: 6 } }
update({ c: 5 }, { $merge: { a: 2 } }); // -> { a: 1, b: { c: 5, a: 2 }}
update({ c: 5 }, { $merge: { ...someObject } }); // -> { a: 1, b: { c: 5, ...someObject }}
```

#### $map

[Read tests](tests/specs/operators/mutation/map.test.ts)

Effectively `Array.map` against only the documents that match the query.

```typescript
// given
// { a: 1 }
// { a: 2 }
update({ a: 1 }, { $map: (doc) => ({ ...doc, d: 1 }) }); // -> { a: 1, d: 1 }, { a: 2 }
```

#### $inc, $dev, $mult, $div

[Read tests](tests/specs/operators/mutation/math.test.ts)

```typescript
// increase population, creating the property if it doesn't exist.
update({ planet: { name: "Earth" } }, { $inc: { planet: { population: 1 } } });
update({ name: "Earth" }, { $inc: { "planet.population": 1 } });
update({ planet: { population: { $gt: 0 } } }, { $inc: 1 });
```

When one of these operators is given in the format `{ $inc: 5 }` without a property specified, we implicitly apply the operator to the properties defined in the query that was used to find the document. For example:

```typescript
update(
  { planet: { name: { $includes: "a" }, $has: "population" } },
  { $inc: 1 }
);
// Implicitly increases the property "planet.population" by 1 if it exists.
// Doesn't try to add `1` to "planet.name" because it is a string.
// Doesn't increase the population of Mars, because it has no "planet.population" property.

update({ a: { $hasAny: ["b", "c"] } }, { $inc: 1 });
// If "a.b" or "a.c" exists, and it is a number, it has the modifier applied to it.
```

## Removing

See the [remove tests](tests/specs/remove/basic.test.ts) for more examples.

Any queries that work with `Collection.find` work with `Collection.remove`.

```typescript
// remove every planet except Earth
remove({ $not: { planet: "Earth" } });
```

## Query options

`find`, `update` and `remove` accept a `QueryOptions` object.

When providing query options, the documents are not actually mutated in the database. The aggregation effect that they have is only applied to the returned documents. In other words, the primary function of query options is aggregation.

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

Given an object path or dot notation path, assigns a value to the property at that path, only if that property is null or undefined.

See the [ifNull tests](tests/specs/options/ifNull.test.ts) for more examples.

```typescript
// [
//   { a: 1, b: 2, c: 3 },
//   { a: 1, b: 2, c: 3, d: null },
// ];

find({ a: 1 }, { ifNull: { d: 4 } });

// [
//   { a: 1, b: 2, c: 3, d: 4 },
//   { a: 1, b: 2, c: 3, d: 4 },
// ];
```

### ifEmpty

Given an object path or dot notation path, assigns a value to the property at that path, only if that property is "empty". "Empty" here means an empty string (""), an empty array ([]) or an empty object ({}).

Does not create properties if they do not already exist.

See the [ifEmpty tests](tests/specs/options/ifEmpty.test.ts) for more examples.

```typescript
// [
//   { a: 1, b: 2, c: 3, d: "  " },
//   { a: 1, b: 2, c: 3, d: [] },
//   { a: 1, b: 2, c: 3, d: {} },
//   { a: 1, b: 2, c: 3 },
// ];

find({}, { ifEmpty: { d: 4 } });

// [
//   { a: 1, b: 2, c: 3, d: 4 },
//   { a: 1, b: 2, c: 3, d: 4 },
//   { a: 1, b: 2, c: 3, d: 4 },
//   { a: 1, b: 2, c: 3 },
// ];
```

### ifNullOrEmpty

See the [ifNullOrEmpty tests](tests/specs/options/ifNullOrEmpty.test.ts) for more examples.

### Sorting

See the [sort tests](tests/specs/options/sort.test.ts) for more examples.

```typescript
// [
//   { name: "Deanna Troi", age: 28 },
//   { name: "Worf", age: 24 },
//   { name: "Xorf", age: 24 },
//   { name: "Zorf", age: 24 },
//   { name: "Jean-Luc Picard", age: 59 },
//   { name: "William Riker", age: 29 },
// ];

find({ age: { $gt: 1 } }, { sort: { age: 1, name: -1 } });
//                                       └─ asc    └─ desc

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

See the [skip & take tests](tests/specs/options/skip_take.test.ts) for more examples.

Mostly useful when paired with `sort`.

```typescript
// [
//   { a: 1, b: 1, c: 1 },
//   { a: 2, b: 2, c: 2 },
//   { a: 3, b: 3, c: 3 },
// ];

find({}, { skip: 1, take: 1 });

// [
//   { a: 2, b: 2, c: 2 },
// ];
```

### Projection

See the [projection tests](tests/specs/options/project.test.ts) for more examples.

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

find({ a: 1 }, { project: { b: 1 } });

// [
//   { b: 1 },
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

find({ a: 1 }, { project: { b: 0 } });

// [
//   { _id: .., a: 1, c: 1 },
// ];
```

#### Explicit

In the only remaining case (a mixture of 1s and 0s), all document properties
are included unless explicitly removed with a `0`.

This is effectively the same behavior as implicit inclusion.

```typescript
// [
//   { a: 1, b: 1, c: 1 },
// ];

find({ a: 1 }, { project: { b: 1, c: 0 } });

// [
//   { _id: .., a: 1, b: 1 },
// ];
```

### Aggregation

See the [project tests](tests/specs/options/project.test.ts) for more examples.

You can use the `aggregate` object to create intermediate properties derived from other document properties, and then project those intermediate properties out of the result set.

The provided `aggregate` helpers are: `$add`, `$sub`, `$mult`, `$div`, `$floor`, `$ceil` and `$fn`.

Aggregation happens before projection. This means that you can define as many intermediate properties during the aggregation step as you wish, before ultimately projecting them out of the result documents. In the example below, `total` is created and used in subsequent aggregation steps before ultimately being projected out of the result.

```typescript
// [
//   { math: 72, english: 82, science: 92 },
//   { math: 60, english: 70, science: 80 },
//   { math: 90, english: 72, science: 84 }
// ]

find(
  {},
  {
    aggregate: {
      // Create an intermediate property named `total`.
      total: { $add: ["math", "english", "science"] },
      // Use the intermediate `total` to create an `average` property.
      average: { $div: ["total", 3] },
    },
    // Project out the intermediate `total` property, leaving
    // only the original scores and the aggregate `average`.
    project: { _id: 0, total: 0 },
  }
);

// [
//   { math: 72, english: 82, science: 92, average: 82 },
//   { math: 60, english: 70, science: 80, average: 70 },
//   { math: 90, english: 72, science: 84, average: 82 },
// ]
```

You can also use dot notation to reference deeply nested properties, e.g.:

```typescript
find(
  {},
  aggregate: {
    // ...
    total: { $add: ["scores.math", "scores.english", "scores.science" ] },
    // ...
  }
);
```

Using `$fn`, you can provide a function which receives the document and returns some value which is then assigned to the intermediate aggregate property.

```typescript
find(
  { $has: ["first", "last"] },
  {
    aggregate: {
      // Create an aggregate `fullName` property by defining a function
      // that receives the document and returns a string of
      // `doc.first` + `doc.last`.
      fullName: { $fn: (doc) => `${doc.first} ${doc.last}` },
    },
  }
);
```

### Joining

See the [join.test.ts](tests/specs/options/join.test.ts) for more examples.

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
        as: "items.*.itemData", // creates a new `itemData` property for each item in `from`
        options: {
          project: { _id: 0, _created_at: 0, _updated_at: 0 },
        },
      },
    ],
  }
);

// [
//   {
//     name: "Bob",
//     items: [
//       { itemId: 3, quantity: 1, itemData: { name: "The Unstoppable Force", atk: 100 } },
//       { itemId: 5, quantity: 2, itemData: { name: "The Immovable Object", def: 100 } },
//     ],
//   }
// ]
```

`join` provides the ability to include `options` of type `QueryOptions`, which in turn facilitates further joins. In simpler terms, you can nest joins infinitely to achieve more complex hierarchical relationships between collections.

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

### Builtin property name defaults

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

The returned value from `find`, `update` and `remove` is always an `Array<T>`, even when there
are no results.

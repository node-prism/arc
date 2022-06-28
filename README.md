A lightweight, in-memory document database for smaller projects.
You can think of this as MongoDB's little brother.

# Installation

```bash
npm i @prism/db
```

# API overview

Below is a brief overview of the API to help you get a feel
for what this package can do for you.

For a more thorough API reference, please look at the tests in this repository.

## Creating a collection

A collection is just a `.json` file.

```typescript
import { Collection } from "@prism/db";

type Planet = {
  planet: string;
  diameter: number;
  population?: number;
  temp: {
    avg: number;
  };
}

// from `./.data` load or create `planets.json`
const collection = new Collection<Planet>(".data", "planets");
```

## Inserting

```typescript
collection.insert({ planet: "Mercury", diameter: 4880, temp: { avg: 475 } });
collection.insert([
  { planet: "Venus", diameter: 12_104, temp: { avg: 737_000 } },
  { planet: "Earth", diameter: 12_742, temp: { avg: 288 } }
]);
```
## Finding

```typescript
// finds Venus and Earth documents
collection.find({ diameter: { $gt: 12_000 } });
// finds Earth document
collection.find({ planet: "Earth" });
// finds Mercury and Earth documents
collection.find({ temp: { avg: { $lt: 1_000 } } });
// finds Earth document
collection.find({ avg: 288 });
// finds Mercury and Earth documents
collection.find({ $and: [{ avg: { $gt: 100 } }, { avg: { $lt: 10_000 } }] });
```

## Updating

Any queries that work with `.find` work with `.update`.

```typescript
// increase population, creating the property if it doesn't exist.
collection.update({ planet: "Earth" }, { $inc: { population: 1 } });
```

## Removing

Any queries that work with `.find` work with `.remove`.

```typescript
collection.remove({ planet: "Earth" });
```

## Misc

---

The default document ID property is `_id`, but this can be changed
to whatever you want it to be by setting the `ID_KEY` export.

The default property names for document ID (`_id`), the "created at"
(`_created_at`) and "updated at" (`_updated_at`) timestamps can all be changed.

```typescript
import { ID_KEY, CREATED_AT_KEY, UPDATED_AT_KEY } from "@prism/db";

ID_KEY = "id";
CREATED_AT_KEY = "createdAt";
UPDATED_AT_KEY = "updatedAt";
```

If you must do this, do it before creating your collections.

---

The return value from find, update and remove is always an array, even if there
are no results.

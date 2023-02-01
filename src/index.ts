import cuid from "cuid";
import dot from "dot-wild";
import find from "./find";
import fs_adapter from "./fs_adapter";
import { booleanOperators } from "./operators";
import { Transaction } from "./transaction";
import { update } from "./update";
import { deeplyRemoveEmptyObjects, isEmptyObject, isObject, Ok } from "./utils";

export interface StorageAdapter<T> {
  read: () => { [key: string]: T };
  write: (data: { [key: string]: T }) => any;
}

export type CollectionOptions<T> = Partial<{
  /** When true, automatically syncs to disk when a change is made to the database. */
  autosync: boolean;

  /** When true, automatically adds timestamps to all records. */
  timestamps: boolean;

  /** When true, document ids are integers that increment from 0. */
  integerIds: boolean;

  /** The storage adapter to use. By default, uses a filesystem adapter. */
  adapter: StorageAdapter<T>;
}>;

export type CreateIndexOptions = Partial<{
  key: string;
  unique: boolean;
}>;

export type QueryOptions = Partial<{
  /** When true, attempts to deeply match the query against documents. */
  deep: boolean;

  /** Specifies the key to return by. */
  returnKey: string;

  /** When true, returns cloned data (not a reference). default true */
  clonedData: boolean;

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

}>;

export function defaultQueryOptions(): QueryOptions {
  return {
    deep: true,
    returnKey: ID_KEY,
    clonedData: true,
    sort: undefined,
    skip: undefined,
    project: undefined,
  };
}

// before inserting, strip any boolean modifiers from the query, e.g.
// { name: "Jean-Luc", title: { $oneOf: ["Captain", "Commander"] } }
// becomes
// { name: "Jean-Luc" }.
export function stripBooleanModifiers(query: object): object {
  const ops = new Set(Ok(booleanOperators));
  if (!isObject(query)) return query;

  Object.keys(query).forEach((key) => {
    if (isObject(key) && Ok(query[key]).every((value) => ops.has(value))) {
      delete query[key];
      return;
    }
    if (!isObject(key) && ops.has(key)) {
      delete query[key];
      return;
    }
    if (!isObject(query[key])) return;
    if (Ok(query[key]).every((value) => ops.has(value))) {
      delete query[key];
      return;
    }
    Ok(query[key]).forEach((k) => {
      if (!ops.has(k)) {
        stripBooleanModifiers(query[key][k]);
      } else {
        delete query[key][k];
      }
    });
  });

  return deeplyRemoveEmptyObjects(query);
}

export let ID_KEY = "_id";
export let CREATED_AT_KEY = "_created_at";
export let UPDATED_AT_KEY = "_updated_at";

export type PrivateData = {
  next_id: number;
  id_map: { [id: string]: string };
  index: { 
    valuesToCuid: { [key: string]: { [value: string]: string[] } };
    cuidToValues: { [key: string]: { [cuid: string]: string | number } };
  };
};

export type CollectionData = {
  [key: string]: any;
  __private?: PrivateData;
};

const isValidIndexValue = (value: unknown) =>
  value !== undefined && (typeof value === "string" || typeof value === "number");

export class Collection<T> {
  storagePath: string;
  name: string;
  options: CollectionOptions<T>;
  data: CollectionData = {};
  _transaction: Transaction<T> = null;
  indices: { [key: string]: { unique: boolean } } = {};


  constructor(
    storagePath: string = ".data",
    name: string = "db",
    options: CollectionOptions<T> = {}
  ) {
    this.storagePath = storagePath;
    this.name = name;

    options.autosync = options.autosync ?? true;
    options.timestamps = options.timestamps ?? true;
    options.integerIds = options.integerIds ?? false;
    options.adapter =
      options.adapter ?? new fs_adapter<T>(this.storagePath, this.name);

    this.options = options;

    const defaultPrivateData = (): PrivateData => ({
      next_id: 0,
      id_map: {},
      index: {
        valuesToCuid: {},
        cuidToValues: {},
      },
    });

    this.adapterRead();

    // Ensure we have the __private map after adapter read.
    if (!this.data.__private) {
      this.data.__private = defaultPrivateData();
    }
  }

  adapterRead() {
    this.data = this.options.adapter.read();
  }

  /**
   * Given objects found by a query, assign `document` directly to these objects.
   * Does not add timestamps or anything else.
   * Used by transaction update rollback.
   */
  assign(id: unknown, document: T): T {
    if (id === undefined) return;

    if (this.options.integerIds) {
      const intid = id as number;
      const cuid = this.data.__private.id_map[intid];

      if (cuid) {
        this.data[cuid] = document;
        return this.data[cuid];
      }

      // a cuid wasn't found, so this is a new record.
      return this.insert({ ...document, [ID_KEY]: intid })[0];
    }

    if (typeof id === "string" || typeof id === "number") {
      this.data[id] = document;
      return this.data[id];
    }

    return undefined;
  }

  filter(fn: (document: T) => boolean): T[] {
    const _data = Object.assign({}, this.data);
    delete _data.__private;
    return Object.values(_data).filter((doc: T) => {
      try { return fn(doc); }
      catch (e) { return false; }
    });
  }

  find(query?: object, options: QueryOptions = {}): T[] {
    return find<T>(this.data, query, options, this.options, this);
  }

  update(query: object, operations: object, options: QueryOptions = {}): T[] {
    return update<T>(this.data, query, operations, options, this.options, this);
  }

  upsert(query: object, operations: object, options: QueryOptions = {}): T[] {
    const updated = this.update(query, operations, options);

    if (updated.length) {
      return updated;
    }

    // Nothing was updated.
    // The idea is that we don't want the created document to be { name: "Jean-Luc", age: { $gt: 40 }, title: "Captain" },
    // instead, it should be: { name: "Jean-Luc", title: "Captain" }
    query = stripBooleanModifiers(query);

    const inserted = this.insert(query as any);
    return update<T>(
      inserted,
      query,
      operations,
      options,
      this.options,
      this
    );
  }

  remove(query: object, options: QueryOptions = {}): T[] {
    const found = this.find(query, { ...options, clonedData: false });

    // Copy the found array so we can return unmodified data.
    const cloned = found.map((doc) => Object.assign({}, doc));

    found.forEach((document) => {
      let cuid: string;

      if (this.options.integerIds) {
        const intid = document[ID_KEY];
        cuid = this.data.__private.id_map[intid];
        delete this.data.__private.id_map[intid];
      } else {
        cuid = document[ID_KEY];
      }

      Object.keys(this.indices).forEach((key) => {
        const value = dot.get(document, key);
        if (isValidIndexValue(value)) {
          this.data.__private.index.valuesToCuid[key][value] = this.data.__private.index.valuesToCuid[key][value].filter((c) => c !== cuid);
          if (this.data.__private.index.valuesToCuid[key][value].length === 0) {
            delete this.data.__private.index.valuesToCuid[key][value];
          }
          delete this.data.__private.index.cuidToValues[cuid];
        }

        if (value === undefined) {
          // This is a bit annoying, but it needs to be done.
          // If the value for this document's indexed property is undefined,
          // it might have been removed accidentally by an update mutation or something.
          // We need to make sure we clean up any dangling indexes.
          Object.keys(this.data.__private.index.valuesToCuid[key]).forEach((value) => {
            this.data.__private.index.valuesToCuid[key][value] = this.data.__private.index.valuesToCuid[key][value].filter((c) => c !== cuid);
            if (this.data.__private.index.valuesToCuid[key][value].length === 0) {
              delete this.data.__private.index.valuesToCuid[key][value];
            }
          });
        }
      });

      delete this.data[cuid];
    });

    this.sync();

    return cloned;
  }

  insert(documents: T[] | T): T[] {
    if (!Array.isArray(documents)) documents = [documents];
    if (!documents.length) return [];

    documents = documents.map((document) => {
      const cuid = this.getId();

      if (this.options.timestamps) {
        document[CREATED_AT_KEY] = Date.now();
        document[UPDATED_AT_KEY] = Date.now();
      }

      // only assign an id if it's not already there
      // support explicit ids, e.g.: { _id: 0, ... }
      if (document[ID_KEY] === undefined) {
        document[ID_KEY] = cuid;

        if (this.options.integerIds) {
          const intid = this.nextIntegerId();
          this.data.__private.id_map[intid] = cuid;
          document[ID_KEY] = intid;
        }
      }

      this.data[cuid] = document;

      Object.keys(this.indices).forEach((key) => {
        const value = dot.get(document, key);
        if (isValidIndexValue(value)) {

          if (this.indices[key].unique) {
            if (this.data.__private.index.valuesToCuid?.[key]?.[value] !== undefined) {
              throw new Error(`Unique index violation for key "${key}" and value "${value}"`);
            }
          }

          this.data.__private.index.valuesToCuid[key] = this.data.__private.index.valuesToCuid[key] || {};
          this.data.__private.index.valuesToCuid[key][value] = this.data.__private.index.valuesToCuid[key][value] || [];
          this.data.__private.index.valuesToCuid[key][value].push(cuid);

          this.data.__private.index.cuidToValues[cuid] = this.data.__private.index.cuidToValues[cuid] || {};
          this.data.__private.index.cuidToValues[cuid][key] = value;
        }
      });

      return document;
    });

    if (this.options.autosync) {
      this.sync();
    }

    return documents;
  }

  merge(id: string, item: T) {
    if (!id) return;

    /**
     * When merging a document, if we're using integer ids,
     * grab the cuid from the id map.
     */
    if (this.options.integerIds) {
      const cuid = this.data.__private.id_map[id];
      if (!cuid) return;
      if (this.data[cuid] === undefined) return;
      Object.assign(this.data[cuid], isEmptyObject(item) ? {} : item);
      this.sync();
      return;
    }

    /**
     * Otherwise, the id is assumed to be a cuid.
     */
    if (this.data[id] === undefined) return;
    Object.assign(this.data[id], isEmptyObject(item) ? {} : item);
    this.sync();
  }

  sync() {
    return this.options.adapter.write(this.data);
  }

  drop() {
    this.data = {
      __private: {
        next_id: 0,
        id_map: {},
        index: {
          valuesToCuid: {},
          cuidToValues: {},
        },
      },
    };
  }

  getId() {
    return cuid();
  }

  createIndex(options: CreateIndexOptions = {}) {
    if (!options.key) throw new Error(`createIndex requires a key`);

    options = {
      key: options.key,
      unique: options.unique ?? false,
    };

    const { key, unique } = options;

    this.indices[key] = { unique };

    if (this.data.__private.index.valuesToCuid[key]) {
      return;
    }

    Object.keys(this.data).forEach((cuid) => {
      if (cuid === "__private") return;

      const value = dot.get(this.data[cuid], key);

      if (isValidIndexValue(value)) {
        if (unique) {
          if (this.data.__private.index.valuesToCuid?.[key]?.[value] !== undefined) {
            throw new Error(`Unique index violation for key "${key}" and value "${value}"`);
          }
        }

        this.data.__private.index.valuesToCuid[key] = this.data.__private.index.valuesToCuid[key] || {};
        this.data.__private.index.valuesToCuid[key][value] = this.data.__private.index.valuesToCuid[key][value] || [];
        this.data.__private.index.valuesToCuid[key][value].push(cuid);

        this.data.__private.index.cuidToValues[cuid] = this.data.__private.index.cuidToValues[cuid] || {};
        this.data.__private.index.cuidToValues[cuid][key] = value;
      } else {
        throw new Error(`Invalid index value for property ${key}: ${value}`);
      }
    });

    this.sync();

    return this;
  }

  removeIndex(key: string): boolean {
    if (!this.indices[key]) return false;

    delete this.indices[key];

    if (this.data.__private.index.valuesToCuid[key]) {
      delete this.data.__private.index.valuesToCuid[key];
    }

    this.data.__private.index.cuidToValues = Object.keys(this.data.__private.index.cuidToValues).reduce((acc, cuid) => {
      if (this.data.__private.index.cuidToValues[cuid][key] === undefined) {
        acc[cuid] = this.data.__private.index.cuidToValues[cuid];
      }
      return acc;
    }, {});

    this.sync();

    return true;
  }

  nextIntegerId() {
    return this.data.__private.next_id++;
  }

  transaction(fn: (transaction: Transaction<T>) => void): void {
    this._transaction = new Transaction<T>(this);

    try {
      fn(this._transaction);
    } catch (e) {
      this._transaction.rollback();
      throw e;
    }

    this._transaction.commit();
  }
}

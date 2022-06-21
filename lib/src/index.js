import cuid from "cuid";
import find from "./find";
import fs_adapter from "./fs_adapter";
import { booleanOperators } from "./operators";
import { Transaction } from "./transaction";
import { update } from "./update";
import { deeplyRemoveEmptyObjects, isEmptyObject, isObject, Ok } from "./utils";
export function defaultQueryOptions() {
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
// { name: "Jean-Luc", title: { $in: ["Captain", "Commander"] } }
// becomes
// { name: "Jean-Luc" }.
function stripBooleanModifiers(query) {
    const ops = Ok(booleanOperators);
    if (!isObject(query))
        return query;
    Object.keys(query).forEach((key) => {
        if (Ok(query[key]).every((value) => ops.includes(value))) {
            delete query[key];
        }
        else {
            if (!isObject(query[key]))
                return;
            if (Ok(query[key]).every((value) => ops.includes(value))) {
                delete query[key];
                return;
            }
            Ok(query[key]).forEach((k) => {
                if (!ops.includes(k)) {
                    stripBooleanModifiers(query[key][k]);
                }
                else {
                    delete query[key][k];
                }
            });
        }
    });
    query = deeplyRemoveEmptyObjects(query);
    return query;
}
export let ID_KEY = "_id";
export let CREATED_AT_KEY = "_created_at";
export let UPDATED_AT_KEY = "_updated_at";
export class Collection {
    storagePath;
    name;
    options;
    data = {};
    constructor(storagePath = ".data", name = "db", options = {}) {
        this.storagePath = storagePath;
        this.name = name;
        options.autosync = options.autosync ?? true;
        options.timestamps = options.timestamps ?? true;
        options.integerIds = options.integerIds ?? false;
        options.adapter =
            options.adapter ?? new fs_adapter(this.storagePath, this.name);
        this.options = options;
        this.data = Object.assign(this.data, {
            __private: {
                next_id: 0,
                id_map: {},
            },
        });
        this.initializeData();
    }
    async initializeData() {
        this.data = await this.options.adapter.read();
    }
    /**
     * Given objects found by a query, assign `document` directly to these objects.
     * Does not add timestamps or anything else.
     * Used by transaction update rollback.
     */
    // assign(query: object, document: T): T[] {
    //   delete document[ID_KEY];
    //
    //   const targets = this.find(query, { deep: true, clonedData: true });
    //   const out: T[] = [];
    //
    //   targets.forEach((target) => {
    //     if (target[ID_KEY]) {
    //       const obj = Object.assign(target, document);
    //       this.data[target[ID_KEY]] = obj;
    //       out.push(obj);
    //     }
    //   });
    //
    //   return out;
    // }
    assign(id, document) {
        if (id === undefined)
            return;
        if (this.options.integerIds) {
            const intid = id;
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
    find(query, options = {}) {
        return find(this.data, query, options, this.options);
    }
    update(query, operations, options = {}) {
        return update(this.data, query, operations, options, this.options, this);
    }
    upsert(query, operations, options = {}) {
        const updated = this.update(query, operations, options);
        if (updated.length) {
            return updated;
        }
        if (!updated.length) {
            // the idea is that we don't want the created document to be { name: "Jean-Luc", age: { $gt: 40 }, title: "Captain" },
            // but rather { name: "Jean-Luc", title: "Captain" }
            query = stripBooleanModifiers(query);
            const inserted = this.insert(query);
            return update(inserted, query, operations, options, this.options, this);
        }
    }
    remove(query, options = {}) {
        let found = this.find(query, { ...options, clonedData: false });
        found.forEach((document) => {
            if (this.options.integerIds) {
                const intid = document[ID_KEY];
                const cuid = this.data.__private.id_map[intid];
                delete this.data.__private.id_map[intid];
                delete this.data[cuid];
                return;
            }
            delete this.data[document[ID_KEY]];
        });
        this.sync();
        return found;
    }
    insert(documents) {
        if (!Array.isArray(documents))
            documents = [documents];
        if (!documents.length)
            return [];
        // handle timestamps
        if (this.options.timestamps) {
            documents = documents.map((document) => ({
                ...document,
                [CREATED_AT_KEY]: Date.now(),
                [UPDATED_AT_KEY]: Date.now(),
            }));
        }
        // handle ids
        documents = documents.map((document) => {
            const cuid = this.getId();
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
            return document;
        });
        if (this.options.autosync) {
            this.sync();
        }
        return documents;
    }
    merge(id, item) {
        if (!id)
            return;
        /**
         * When merging a document, if we're using integer ids,
         * grab the cuid from the id map.
         */
        if (this.options.integerIds) {
            const cuid = this.data.__private.id_map[id];
            if (!cuid)
                return;
            if (this.data[cuid] === undefined)
                return;
            Object.assign(this.data[cuid], isEmptyObject(item) ? {} : item);
            this.sync();
            return;
        }
        /**
         * Otherwise, the id is assumed to be a cuid.
         */
        if (this.data[id] === undefined)
            return;
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
            },
        };
    }
    getId() {
        return cuid();
        // return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        //   /[xy]/g,
        //   function (c) {
        //     let r = (Math.random() * 16) | 0,
        //       v = c == "x" ? r : (r & 0x3) | 0x8;
        //     return v.toString(16);
        //   }
        // );
    }
    nextIntegerId() {
        return this.data.__private.next_id++;
    }
    transaction() {
        return new Transaction(this);
    }
}
// type User = {
//   _id?: number;
//   name: string;
//   friends?: number[];
// }
//
// const users = new Collection<User>(".data", "users", { integerIds: true });
//
// users.insert([
//   { name: "Jean-Luc", friends: [1, 3] }, // will and data
//   { name: "Riker" },
//   { name: "Kathryn" },
//   { name: "Data" },
//   { name: "Worf" },
// ]);
//
// const jeansFriends = users.find({ name: "Jean-Luc" })
// .map((user) => users.find({ _id: { $in: user.friends } }));
//
// console.log("jeansFriends", ...jeansFriends);

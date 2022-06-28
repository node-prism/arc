import { Collection, ID_KEY, QueryOptions } from ".";

export class Transaction<T> {
  collection: Collection<T>;
  inserted: T[] = [];
  removed: T[] = [];
  updated: { documents: T[], operations: object, options: QueryOptions }[] = [];

  constructor(collection: Collection<T>) {
    this.collection = collection;
  }

  insert(documents: T[] | T): T[] {
    const inserted = this.collection.insert(documents);
    this.inserted = this.inserted.concat(inserted);
    return inserted;
  }

  update(query: object, operations: object, options: QueryOptions = {}): T[] {
    const documents = this.collection.find(query, options);
    this.updated = this.updated.concat({ documents, operations, options });
    return this.collection.update(query, operations, options);
  }

  remove(query: object, options: QueryOptions = {}): T[] {
    const removed = this.collection.remove(query, options);
    this.removed = this.removed.concat(removed);
    return removed;
  }

  rollback() {
    this.inserted.forEach((document) => {
      if (document[ID_KEY] !== undefined) {
        this.collection.remove({
          [ID_KEY]: document[ID_KEY],
        })
      } else {
        this.collection.remove({ ...document } as unknown as object);
      }
    });

    this.updated.forEach((entry) => {
      entry.documents.forEach((document) => {
        if (document[ID_KEY] !== undefined) {
          // this.collection.assign({ [ID_KEY]: document[ID_KEY] }, document);
          this.collection.assign(document[ID_KEY], document);
        } else {
          this.collection.update({ ...document } as unknown as object, entry.operations, entry.options);
        }
      });
    });

    this.removed.forEach((document) => {
      if (document[ID_KEY] !== undefined) {
        // this.collection.insert(document);
        // the purpose of this is to restore metadata like timestamps.
        // this.collection.assign({ [ID_KEY]: document[ID_KEY] }, document);
        this.collection.assign(document[ID_KEY], document);
      }
    });

    this.inserted = [];
    this.updated = [];
    this.removed = [];
  }

  commit() {
    this.inserted = [];
    this.updated = [];
    this.removed = [];
  }
}

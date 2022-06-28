import { Collection, ID_KEY, QueryOptions } from ".";

enum OpType {
  INSERT = "insert",
  UPDATE = "update",
  REMOVE = "remove"
};

interface UpdateOperation<T> {
  documents: T[];
  operations: object;
  options: QueryOptions;
}

export class Transaction<T> {
  collection: Collection<T>;
  inserted: T[][] = [];
  removed: T[][] = [];
  updated: UpdateOperation<T>[] = [];

  operations: OpType[] = [];

  constructor(collection: Collection<T>) {
    this.collection = collection;
  }

  insert(documents: T[] | T): T[] {
    const inserted = this.collection.insert(documents);
    this.inserted.push(inserted);
    this.operations.push(OpType.INSERT);
    return inserted;
  }

  update(query: object, operations: object, options: QueryOptions = {}): T[] {
    const documents = this.collection.find(query, options);
    this.updated.push({ documents, operations, options });
    this.operations.push(OpType.UPDATE);
    return this.collection.update(query, operations, options);
  }

  remove(query: object, options: QueryOptions = {}): T[] {
    const removed = this.collection.remove(query, options);
    this.removed.push(removed);
    this.operations.push(OpType.REMOVE);
    return removed;
  }

  rollback() {
    const uninsert = (documents: T[]) => {
      documents.forEach((document) => {
        if (document[ID_KEY] !== undefined) {
          this.collection.remove({ [ID_KEY]: document[ID_KEY] })
        } else {
          this.collection.remove({ ...document } as unknown as object);
        }
      });
    };

    const unupdate = (operation: UpdateOperation<T>) => {
      operation.documents.forEach((document) => {
        if (document[ID_KEY] !== undefined) {
          this.collection.assign(document[ID_KEY], document);
        } else {
          this.collection.update({ ...document } as unknown as object, operation.operations, operation.options);
        }
      });
    };

    const unremove = (documents: T[]) => {
      documents.forEach((document) => {
        if (document[ID_KEY] !== undefined) {
          this.collection.assign(document[ID_KEY], document);
        }
      });
    };

    this.operations.reverse().forEach((opType) => {
      switch (opType) {
        case OpType.INSERT:
          uninsert(this.inserted.pop() as T[]);
          break;
        case OpType.UPDATE:
          unupdate(this.updated.pop());
          break;
        case OpType.REMOVE:
          unremove(this.removed.pop() as T[]);
          break;
      }
    });

    this.inserted = [];
    this.updated = [];
    this.removed = [];
    this.operations = [];
  }

  /**
   * Finalizes the transaction.
   */
  commit() {
    this.inserted = [];
    this.updated = [];
    this.removed = [];
    this.collection._transaction = null;
  }
}

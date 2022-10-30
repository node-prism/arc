import { ID_KEY } from ".";
var OpType;
(function (OpType) {
    OpType["INSERT"] = "insert";
    OpType["UPDATE"] = "update";
    OpType["REMOVE"] = "remove";
})(OpType || (OpType = {}));
;
export class Transaction {
    collection;
    inserted = [];
    removed = [];
    updated = [];
    operations = [];
    constructor(collection) {
        this.collection = collection;
    }
    insert(documents) {
        const inserted = this.collection.insert(documents);
        this.inserted.push(inserted);
        this.operations.push(OpType.INSERT);
        return inserted;
    }
    update(query, operations, options = {}) {
        // Given the query, find the documents without any projection or joining applied
        // so we can store the original documents in the transaction.
        const documents = this.collection.find(query, {
            ...options,
            project: undefined,
            join: undefined,
        });
        // Store the original documents in the transaction.
        this.updated.push({ documents, operations, options });
        this.operations.push(OpType.UPDATE);
        // Then, run the update using the original query, operations, and options.
        return this.collection.update(query, operations, options);
    }
    remove(query, options = {}) {
        // Following similar logic to update, find the original documents
        // using the query and options, but without any projection or joining.
        const removed = this.collection.find(query, {
            ...options,
            project: undefined,
            join: undefined,
        });
        this.collection.remove(query, options);
        this.removed.push(removed);
        this.operations.push(OpType.REMOVE);
        return removed;
    }
    rollback() {
        const uninsert = (documents) => {
            documents.forEach((document) => {
                if (document[ID_KEY] !== undefined) {
                    this.collection.remove({ [ID_KEY]: document[ID_KEY] });
                }
                else {
                    this.collection.remove({ ...document });
                }
            });
        };
        const unupdate = (operation) => {
            operation.documents.forEach((document) => {
                if (document[ID_KEY] !== undefined) {
                    this.collection.assign(document[ID_KEY], document);
                }
                else {
                    this.collection.update({ ...document }, operation.operations, operation.options);
                }
            });
        };
        const unremove = (documents) => {
            documents.forEach((document) => {
                if (document[ID_KEY] !== undefined) {
                    this.collection.assign(document[ID_KEY], document);
                }
            });
        };
        this.operations.reverse().forEach((op) => {
            switch (op) {
                case OpType.INSERT:
                    uninsert(this.inserted.pop());
                    break;
                case OpType.UPDATE:
                    unupdate(this.updated.pop());
                    break;
                case OpType.REMOVE:
                    unremove(this.removed.pop());
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

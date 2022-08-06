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
        const documents = this.collection.find(query, options);
        this.updated.push({ documents, operations, options });
        this.operations.push(OpType.UPDATE);
        return this.collection.update(query, operations, options);
    }
    remove(query, options = {}) {
        const removed = this.collection.remove(query, options);
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
        this.operations.reverse().forEach((opType) => {
            switch (opType) {
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

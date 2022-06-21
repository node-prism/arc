import { ID_KEY } from ".";
export class Transaction {
    collection;
    inserted = [];
    removed = [];
    updated = [];
    constructor(collection) {
        this.collection = collection;
    }
    insert(documents) {
        const inserted = this.collection.insert(documents);
        this.inserted = this.inserted.concat(inserted);
        return inserted;
    }
    update(query, operations, options = {}) {
        const documents = this.collection.find(query, options);
        this.updated = this.updated.concat({ documents, operations, options });
        return this.collection.update(query, operations, options);
    }
    remove(query, options = {}) {
        const removed = this.collection.remove(query, options);
        this.removed = this.removed.concat(removed);
        return removed;
    }
    rollback() {
        this.inserted.forEach((document) => {
            if (document[ID_KEY] !== undefined) {
                this.collection.remove({
                    [ID_KEY]: document[ID_KEY],
                });
            }
            else {
                this.collection.remove({ ...document });
            }
        });
        this.updated.forEach((entry) => {
            entry.documents.forEach((document) => {
                if (document[ID_KEY] !== undefined) {
                    // this.collection.assign({ [ID_KEY]: document[ID_KEY] }, document);
                    this.collection.assign(document[ID_KEY], document);
                }
                else {
                    this.collection.update({ ...document }, entry.operations, entry.options);
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

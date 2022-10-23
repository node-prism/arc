import { testSuite, expect } from "manten";
import { nrml, testCollection } from "../../common";
export default testSuite(async ({ describe, test }) => {
    describe("inserts", ({ test }) => {
        test("will insert and remove on rollback", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const original = collection.find();
            collection.transaction((t) => {
                t.insert({ a: 4 });
                const found = nrml(collection.find({ a: 4 }));
                expect(found).toEqual([{ a: 4 }]);
                t.rollback();
                const found2 = nrml(collection.find({ a: 4 }));
                expect(found2).toEqual([]);
            });
            const latest = collection.find();
            expect(latest).toEqual(original);
        });
        test("will insert many and remove all on rollback", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const original = collection.find();
            collection.transaction((t) => {
                t.insert([{ a: 4 }, { a: 5 }]);
                const found = nrml(collection.find({ a: { $gt: 3 } }));
                expect(found).toEqual([{ a: 4 }, { a: 5 }]);
                t.rollback();
                const found2 = nrml(collection.find({ a: { $gt: 3 } }));
                expect(found2).toEqual([]);
            });
            const latest = collection.find();
            expect(latest).toEqual(original);
        });
    });
    describe("updates", ({ test }) => {
        test("will update and revert on rollback", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const original = collection.find();
            collection.transaction((t) => {
                t.update({ a: 1 }, { $set: { a: 4 } });
                const found = nrml(collection.find({ a: 4 }));
                expect(found).toEqual([{ a: 4 }]);
                t.rollback();
                const found2 = nrml(collection.find({ a: 4 }));
                expect(found2).toEqual([]);
                const found3 = nrml(collection.find({ a: 1 }));
                expect(found3).toEqual([{ a: 1 }]);
            });
            const latest = collection.find();
            expect(latest).toEqual(original);
        });
        test("will update many and revert all on rollback", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const original = collection.find();
            collection.transaction((t) => {
                t.update({ a: { $gt: 1 } }, { $inc: 5 });
                const found = nrml(collection.find({ a: { $gt: 1 } }));
                expect(found).toEqual([{ a: 7 }, { a: 8 }]);
                t.rollback();
                const found2 = nrml(collection.find({ a: { $gt: 3 } }));
                expect(found2).toEqual([]);
                const found3 = nrml(collection.find({ a: { $gt: 0 } }));
                expect(found3).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
            });
            const latest = collection.find();
            expect(latest).toEqual(original);
        });
    });
    describe("removes", ({ test }) => {
        test("will remove and restore on rollback", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const original = collection.find();
            collection.transaction((t) => {
                t.remove({ a: 3 });
                const found = nrml(collection.find({ a: 3 }));
                expect(found).toEqual([]);
                t.rollback();
                const found2 = nrml(collection.find({ a: 3 }));
                expect(found2).toEqual([{ a: 3 }]);
            });
            const latest = collection.find();
            expect(latest).toEqual(original);
        });
        test("will remove many and restore all on rollback", () => {
            const collection = testCollection();
            collection.insert({ a: 1 });
            collection.insert({ a: 2 });
            collection.insert({ a: 3 });
            const original = collection.find();
            collection.transaction((t) => {
                t.remove({ a: { $gt: 1 } });
                const found = nrml(collection.find({ a: { $gt: 1 } }));
                expect(found).toEqual([]);
                t.rollback();
                const found2 = nrml(collection.find({ a: { $gt: 1 } }));
                expect(found2).toEqual([{ a: 2 }, { a: 3 }]);
            });
            const latest = collection.find();
            expect(latest).toEqual(original);
        });
    });
    test("throws if already in a transaction", () => {
        const collection = testCollection();
        collection.transaction((tx) => {
            expect(collection.transaction).toThrow();
        });
    });
    test("throwing inside a transaction rolls it back", () => {
        const collection = testCollection();
        collection.insert({ a: 1 });
        collection.insert({ a: 2 });
        collection.insert({ a: 3 });
        const original = collection.find();
        try {
            collection.transaction((t) => {
                t.insert({ a: 4 });
                throw new Error("test");
            });
        }
        catch (e) {
            // ignore
        }
        const latest = collection.find();
        expect(latest).toEqual(original);
    });
});

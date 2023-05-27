import { AdapterConstructor, AdapterConstructorOptions } from "./adapter";
import { Collection, CollectionOptions, QueryOptions } from "./collection";

export type ShardOptions<T> = {
  shardKey: string;
  shardCount: number;
  adapter: AdapterConstructor<T>;
  adapterOptions: AdapterConstructorOptions<T>;
};

export class ShardedCollection<T> {
  private collectionOptions: CollectionOptions<T>;
  public shards: { [key: string]: Collection<T> } = {};

  private shardKey: string;
  private shardCount: number;

  private adapter: AdapterConstructor<T>;
  private adapterOptions: AdapterConstructorOptions<T>;

  constructor(collectionOptions: CollectionOptions<T>, shardOptions: ShardOptions<T>) {
    this.collectionOptions = collectionOptions;
    this.shardKey = shardOptions.shardKey;
    this.shardCount = shardOptions.shardCount;
    this.adapter = shardOptions.adapter;
    this.adapterOptions = shardOptions.adapterOptions;
  }

  private getShard(doc: T): Collection<T> {
    const key = (doc as any)[this.shardKey];

    if (key === undefined) {
      throw new Error(`Shard key ${this.shardKey} is not found in document`);
    }

    const shardId = this.hashCode(key.toString()) % this.shardCount;

    if (this.shards[shardId] === undefined) {
      const adapterOptions = { ...this.adapterOptions, name: `${this.adapterOptions?.name || "collection"}_shard${shardId}.json` };

      this.shards[shardId] = new Collection<T>({
        ...this.collectionOptions,
        adapter: new this.adapter(adapterOptions),
      });
    }

    return this.shards[shardId];
  }

  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // convert to 32bit int
    }

    return hash;
  }

  find(query?: object, options: QueryOptions = {}): T[] {
    const docs = [];

    for (const shardId of Object.keys(this.shards)) {
      const shardDocs = this.shards[shardId].find(query, options);
      docs.push(...shardDocs);
    }

    return docs;
  }

  insert(docs: T[] | T): T[] {
    if (!Array.isArray(docs)) {
      docs = [docs];
    }

    const insertedDocs = [];

    for (const doc of docs) {
      const shard = this.getShard(doc);
      insertedDocs.push(...shard.insert(doc));
    }

    return insertedDocs;
  }

  update(query: object, operations: object, options: QueryOptions = {}): T[] {
    const updatedDocs = [];

    for (const shardId of Object.keys(this.shards)) {
      const shardDocs = this.shards[shardId].update(query, operations, options);
      updatedDocs.push(...shardDocs);
    }

    return updatedDocs;
  }

  upsert(query: object, operations: object, options: QueryOptions = {}): T[] {
    const upsertedDocs = [];

    for (const shardId of Object.keys(this.shards)) {
      const shardDocs = this.shards[shardId].upsert(query, operations, options);
      upsertedDocs.push(...shardDocs);
    }

    return upsertedDocs;
  }

  remove(query: object, options: QueryOptions = {}): T[] {
    const removedDocs = [];

    for (const shardId of Object.keys(this.shards)) {
      const shardDocs = this.shards[shardId].remove(query, options);
      removedDocs.push(...shardDocs);
    }

    return removedDocs;
  }

  drop(): void {
    for (const shardId of Object.keys(this.shards)) {
      this.shards[shardId].drop();
    }
  }

  sync(): void {
    for (const shardId of Object.keys(this.shards)) {
      this.shards[shardId].sync();
    }
  }
}
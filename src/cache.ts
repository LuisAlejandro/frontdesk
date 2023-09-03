import path from 'path';
import fs from 'fs';
import { caching, Store, Cache as BaseCache } from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';

import { CACHE_PATH, MAX_CACHE_SIZE, TTL } from './constants';
import { FsHashStoreConfig, ICacheProperties } from './types';

export class Cache {
  public name: string;
  public store: Store;
  public cache?: BaseCache;

  constructor({ name, store }: ICacheProperties = {}) {
    if (!name) {
      throw new Error('Cache name is required');
    }

    this.name = name;
    this.store = store;
  }

  get directory(): string {
    return path.join(path.dirname(__dirname), CACHE_PATH, this.name);
  }

  async init(): Promise<Cache> {
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }

    if (this.cache) {
      return this;
    }

    if (!this.store) {
      const storeOptions: FsHashStoreConfig = {
        store: fsStore,
        options: {
          path: this.directory,
          maxsize: MAX_CACHE_SIZE,
          ttl: TTL,
        },
      };
      this.store = storeOptions.store.create(storeOptions);
    }

    this.cache = await caching(this.store);

    return this;
  }

  get<T = unknown>(key: string): Promise<T | undefined> {
    if (!this.cache) {
      throw new Error(`Cache wasn't initialised yet, please run the init method first`);
    }
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T): Promise<void> {
    if (!this.cache) {
      throw new Error(`Cache wasn't initialised yet, please run the init method first`);
    }
    return this.cache.set(key, value);
  }

  del(key: string): Promise<void> {
    if (!this.cache) {
      throw new Error(`Cache wasn't initialised yet, please run the init method first`);
    }
    return this.cache.del(key);
  }

  async reset(): Promise<void> {
    if (!this.cache) {
      throw new Error(`Cache wasn't initialised yet, please run the init method first`);
    }
    await this.cache.reset();
    if (fs.existsSync(this.directory)) {
      fs.rmSync(this.directory, { recursive: true, force: true });
    }
  }
}

const caches = new Map<string, Cache>();

export const getCache = async (name: string): Promise<Cache> => {
  let cache = caches.get(name);
  if (!cache) {
    cache = await new Cache({ name }).init();
    caches.set(name, cache);
  }
  return cache;
};

export const removeCache = async (name: string): Promise<void> => {
  const cache = caches.get(name);
  if (!cache) {
    return;
  } else {
    await cache.reset();
    caches.delete(name);
    return;
  }
};

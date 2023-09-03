import path from 'path';
import fs from 'fs';
import cacheManager, { Store, CachingConfig, MultiCache } from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';

import { CACHE_PATH, MAX_CACHE_SIZE, TTL } from './constants';

interface ICacheProperties {
  name?: string;
  store?: Store;
}

export class Cache {
  public name: string;
  public store: Store;
  public cache?: MultiCache;

  constructor({ name, store }: ICacheProperties = {}) {
    this.name = name || 'cache';
    this.store = store || fsStore.create({ store: fsStore });
  }

  get directory(): string {
    return path.join(path.dirname(__dirname), CACHE_PATH, this.name);
  }

  async init(): Promise<Cache> {
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }

    const memoryCache = await cacheManager.caching('memory', {
      max: MAX_CACHE_SIZE,
      ttl: TTL,
    });

    const fsCache = cacheManager.caching({
      store: this.store,
      options: {
        path: this.directory,
        ttl: TTL,
      },
    });

    this.cache = cacheManager.multiCaching([memoryCache, fsCache]);

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

  del<T = unknown>(key: string): Promise<void> {
    if (!this.cache) {
      throw new Error(`Cache wasn't initialised yet, please run the init method first`);
    }
    return this.cache.del(key);
  }

  reset<T = unknown>(): Promise<void> {
    if (!this.cache) {
      throw new Error(`Cache wasn't initialised yet, please run the init method first`);
    }
    return this.cache.reset().then(() => {
      if (fs.existsSync(this.directory)) {
        fs.rmSync(this.directory, { recursive: true, force: true });
      }
    });
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

import logger from '../utils/logger';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

/**
 * MemoryCacheService
 *
 * Implements ICacheService using an in-memory Map structure.
 * Serves as a Redis replacement in development or low-load staging setups.
 *
 * @example
 * const cache = new MemoryCacheService();
 * await cache.set('featured_colleges', colleges, 3600);
 */
export class MemoryCacheService implements ICacheService {
  private cache = new Map<string, CacheItem<any>>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      logger.debug(`[Cache] Expired key: ${key}`);
      return null;
    }

    logger.debug(`[Cache] Hit key: ${key}`);
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    logger.debug(`[Cache] Set key: ${key} (ttl: ${ttlSeconds}s)`);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    logger.debug(`[Cache] Deleted key: ${key}`);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    logger.info('[Cache] Cache cleared completely.');
  }
}

export default MemoryCacheService;

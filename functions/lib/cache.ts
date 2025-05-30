import type { Env } from '../types/api';

export class CacheManager {
  private kv: KVNamespace;
  private defaultTTL = 3600; // 1 hour in seconds

  constructor(env: Env) {
    this.kv = env.CACHE;
  }

  /**
   * Get cached data from KV store
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.kv.get(key);
      if (!cached) return null;
      
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in KV store with TTL
   */
  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: ttl
      });
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete data from KV store
   */
  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Generate cache key for external data sources
   */
  static getCacheKey(source: 'release-info' | 'solution-updates', identifier?: string): string {
    const baseKey = `azure-local-${source}`;
    return identifier ? `${baseKey}-${identifier}` : baseKey;
  }

  /**
   * Get cache TTL based on data type
   */
  static getTTL(dataType: 'release-info' | 'solution-updates'): number {
    switch (dataType) {
      case 'release-info':
        return 3600; // 1 hour
      case 'solution-updates':
        return 1800; // 30 minutes
      default:
        return 3600;
    }
  }
}

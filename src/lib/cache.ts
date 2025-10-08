/**
 * Simple in-memory cache implementation for API responses
 * Using Map for basic caching with TTL (Time To Live)
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  /**
   * Set data in cache with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * Get data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cleanup expired entries every 10 minutes
if (typeof global !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

/**
 * Higher-order function to cache API responses
 */
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cache.get<T>(key);
      if (cached !== null) {
        resolve(cached);
        return;
      }
      
      // If not in cache, fetch data
      const data = await fetcher();
      
      // Store in cache
      cache.set(key, data, ttl);
      
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate cache key based on URL and parameters
 */
export function generateCacheKey(baseUrl: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${baseUrl}:${paramString}`;
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCachePattern(pattern: string): void {
  const stats = cache.getStats();
  stats.keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}
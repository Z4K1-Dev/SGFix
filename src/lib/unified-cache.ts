/**
 * Unified Cache System - Sistem cache terpusat untuk semua aplikasi
 * Menggabungkan fitur terbaik dari semua implementasi cache yang ada
 */

// ==================== TYPES & INTERFACES ====================

export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface CacheConfig {
  maxItems: number
  defaultTtl: number
  cleanupInterval: number
  enableStats: boolean
  enableEvents: boolean
  memoryThreshold: number // dalam MB
}

export interface CacheStats {
  size: number
  maxItems: number
  hitRate: number
  missRate: number
  memoryUsage: string
  keys: string[]
  tags: string[]
  expiredItems: number
  lastCleanup: number
  totalHits: number
  totalMisses: number
}

export interface CacheEvent {
  type: 'set' | 'get' | 'delete' | 'clear' | 'cleanup' | 'evict'
  key: string
  timestamp: number
  data?: any
  metadata?: Record<string, any>
}

export interface CachePreset {
  name: string
  ttl: number
  maxItems?: number
  tags?: string[]
  description: string
}

// ==================== CORE CACHE CLASS ====================

export class UnifiedCache {
  private cache = new Map<string, CacheItem>()
  private config: CacheConfig
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    cleanups: 0
  }
  private cleanupTimer: NodeJS.Timeout | null = null
  private eventListeners = new Map<string, ((event: CacheEvent) => void)[]>()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxItems: 1000,
      defaultTtl: 60 * 60 * 1000, // 1 jam
      cleanupInterval: 5 * 60 * 1000, // 5 menit
      enableStats: true,
      enableEvents: true,
      memoryThreshold: 50, // 50MB
      ...config
    }

    this.startCleanup()
    this.setupMemoryMonitoring()
  }

  // ==================== BASIC OPERATIONS ====================

  set<T>(key: string, data: T, options: {
    ttl?: number
    tags?: string[]
    metadata?: Record<string, any>
  } = {}): void {
    const { ttl = this.config.defaultTtl, tags, metadata } = options

    // Check memory limit
    if (this.cache.size >= this.config.maxItems && !this.cache.has(key)) {
      this.evictLRU()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags,
      metadata
    }

    this.cache.set(key, item)
    this.emitEvent('set', key, data, { tags, metadata })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      this.emitEvent('get', key, null, { hit: false })
      return null
    }

    // Check expiration
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.misses++
      this.emitEvent('get', key, null, { hit: false, expired: true })
      return null
    }

    // Update access stats
    item.accessCount++
    item.lastAccessed = Date.now()
    this.stats.hits++
    this.emitEvent('get', key, item.data, { hit: true })

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (this.isExpired(item)) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.emitEvent('delete', key)
    }
    return deleted
  }

  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.emitEvent('clear', '', null, { clearedItems: size })
  }

  // ==================== ADVANCED OPERATIONS ====================

  getByTag(tag: string): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = []
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags?.includes(tag) && !this.isExpired(item)) {
        results.push({ key, data: item.data })
        item.accessCount++
        item.lastAccessed = Date.now()
      }
    }
    
    return results
  }

  deleteByTag(tag: string): number {
    let deleted = 0
    for (const [key, item] of this.cache.entries()) {
      if (item.tags?.includes(tag)) {
        this.cache.delete(key)
        deleted++
      }
    }
    return deleted
  }

  getByPattern(pattern: RegExp): Array<{ key: string; data: any }> {
    const results: Array<{ key: string; data: any }> = []
    
    for (const [key, item] of this.cache.entries()) {
      if (pattern.test(key) && !this.isExpired(item)) {
        results.push({ key, data: item.data })
        item.accessCount++
        item.lastAccessed = Date.now()
      }
    }
    
    return results
  }

  deleteByPattern(pattern: RegExp): number {
    let deleted = 0
    for (const [key] of this.cache.entries()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }
    return deleted
  }

  // ==================== CACHE MANAGEMENT ====================

  cleanup(): number {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    this.stats.cleanups++
    this.emitEvent('cleanup', '', null, { deletedItems: keysToDelete.length })

    return keysToDelete.length
  }

  evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
      this.emitEvent('evict', oldestKey)
    }
  }

  // ==================== STATISTICS & MONITORING ====================

  getStats(): CacheStats {
    const keys = Array.from(this.cache.keys())
    const tags = new Set<string>()
    let expiredItems = 0
    const now = Date.now()

    for (const item of this.cache.values()) {
      item.tags?.forEach(tag => tags.add(tag))
      if (this.isExpired(item)) expiredItems++
    }

    const total = this.stats.hits + this.stats.misses
    const memoryUsage = this.estimateMemoryUsage()

    return {
      size: this.cache.size,
      maxItems: this.config.maxItems,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.stats.misses / total) * 100 : 0,
      memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)} MB`,
      keys,
      tags: Array.from(tags),
      expiredItems,
      lastCleanup: now,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses
    }
  }

  getDetailedInfo(): Array<{
    key: string
    size: string
    ttl: string
    accessCount: number
    lastAccessed: string
    tags: string[]
    expired: boolean
  }> {
    const now = Date.now()
    
    return Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      size: `${JSON.stringify(item.data).length} bytes`,
      ttl: `${Math.max(0, Math.floor((item.ttl - (now - item.timestamp)) / 1000))}s`,
      accessCount: item.accessCount,
      lastAccessed: new Date(item.lastAccessed).toLocaleString(),
      tags: item.tags || [],
      expired: this.isExpired(item)
    }))
  }

  // ==================== PRESETS & CONFIGURATION ====================

  static getPresets(): CachePreset[] {
    return [
      {
        name: 'short',
        ttl: 5 * 60 * 1000, // 5 menit
        description: 'Data yang sering berubah (real-time data)'
      },
      {
        name: 'medium',
        ttl: 30 * 60 * 1000, // 30 menit
        description: 'Data yang kadang berubah (user sessions)'
      },
      {
        name: 'long',
        ttl: 2 * 60 * 60 * 1000, // 2 jam
        description: 'Data yang jarang berubah (configurations)'
      },
      {
        name: 'static',
        ttl: 24 * 60 * 60 * 1000, // 24 jam
        description: 'Data yang hampir tidak berubah (static assets)'
      },
      {
        name: 'epasar-products',
        ttl: 15 * 60 * 1000, // 15 menit
        maxItems: 500,
        tags: ['epasar', 'products'],
        description: 'Cache khusus untuk produk e-Pasar'
      },
      {
        name: 'epasar-categories',
        ttl: 60 * 60 * 1000, // 1 jam
        maxItems: 50,
        tags: ['epasar', 'categories'],
        description: 'Cache khusus untuk kategori e-Pasar'
      }
    ]
  }

  applyPreset(presetName: string): void {
    const preset = UnifiedCache.getPresets().find(p => p.name === presetName)
    if (preset) {
      this.config.defaultTtl = preset.ttl
      if (preset.maxItems) {
        this.config.maxItems = preset.maxItems
      }
    }
  }

  // ==================== EVENT SYSTEM ====================

  on(event: string, callback: (event: CacheEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: (event: CacheEvent) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(type: string, key: string, data?: any, metadata?: Record<string, any>): void {
    if (!this.config.enableEvents) return

    const event: CacheEvent = {
      type: type as any,
      key,
      timestamp: Date.now(),
      data,
      metadata
    }

    const listeners = this.eventListeners.get(type)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('[Cache] Event listener error:', error)
        }
      })
    }
  }

  // ==================== UTILITY METHODS ====================

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0
    for (const [key, item] of this.cache.entries()) {
      totalSize += JSON.stringify(key).length
      totalSize += JSON.stringify(item.data).length
      totalSize += 200 // Estimated metadata size
    }
    return totalSize
  }

  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private setupMemoryMonitoring(): void {
    setInterval(() => {
      const memoryUsage = this.estimateMemoryUsage() / 1024 / 1024 // MB
      if (memoryUsage > this.config.memoryThreshold) {
        console.warn(`[Cache] Memory usage (${memoryUsage.toFixed(2)}MB) exceeds threshold (${this.config.memoryThreshold}MB)`)
        // Force cleanup
        this.cleanup()
        // If still over threshold, evict LRU items
        if (this.estimateMemoryUsage() / 1024 / 1024 > this.config.memoryThreshold) {
          this.evictLRU()
        }
      }
    }, 60000) // Check every minute
  }

  // ==================== LIFECYCLE ====================

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
    this.eventListeners.clear()
  }
}

// ==================== GLOBAL INSTANCE ====================

export const unifiedCache = new UnifiedCache({
  maxItems: 1000,
  defaultTtl: 60 * 60 * 1000, // 1 jam
  cleanupInterval: 5 * 60 * 1000, // 5 menit
  enableStats: true,
  enableEvents: true,
  memoryThreshold: 50 // 50MB
})

// ==================== UTILITY FUNCTIONS ====================

export function createCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')
  return paramString ? `${prefix}:${paramString}` : prefix
}

export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    tags?: string[]
    metadata?: Record<string, any>
  } = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try cache first
      const cached = unifiedCache.get<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // Fetch fresh data
      const data = await fetcher()
      
      // Store in cache
      unifiedCache.set(key, data, options)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export function invalidateCacheByPattern(pattern: string): number {
  const regex = new RegExp(pattern.replace(/\*/g, '.*'))
  return unifiedCache.deleteByPattern(regex)
}

export function getCachePresets(): CachePreset[] {
  return UnifiedCache.getPresets()
}

// Export types are already defined above in the class
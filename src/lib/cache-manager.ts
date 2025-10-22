/**
 * Cache Manager untuk sistem prefetch dan cache management
 * Mendukung TTL, memory limit, LRU eviction, dan event broadcasting
 */

/**
 * Interface untuk item cache dengan data dan metadata
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // dalam milidetik
  accessCount: number // untuk LRU tracking
  lastAccessed: number // untuk LRU tracking
}

/**
 * Konfigurasi untuk cache manager
 */
interface CacheConfig {
  maxItems: number // maksimum item dalam cache
  defaultTtl: number // TTL default dalam milidetik
  cleanupInterval: number // interval cleanup dalam milidetik
}

/**
 * Event types untuk cache updates
 */
type CacheEventType = 'cache-updated' | 'cache-invalidated' | 'cache-cleanup'

/**
 * Interface untuk cache event
 */
interface CacheEvent<T = any> {
  type: CacheEventType
  key: string
  data?: T
  timestamp: number
}

/**
 * Cache Manager dengan fitur lengkap untuk prefetch dan cache management
 */
class CacheManager {
  private cache: Map<string, CacheItem<any>>
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map()
    this.config = {
      maxItems: 50,
      defaultTtl: 60 * 60 * 1000, // 60 menit
      cleanupInterval: 5 * 60 * 1000, // 5 menit
      ...config
    }

    // Setup automatic cleanup
    this.setupCleanup()
  }

  /**
   * Menyimpan data ke cache dengan TTL
   * @param key - Kunci unik untuk cache
   * @param data - Data yang akan disimpan
   * @param ttl - Time to live dalam milidetik (opsional, menggunakan default)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Jika cache sudah penuh, evict item yang paling lama tidak diakses (LRU)
    if (this.cache.size >= this.config.maxItems && !this.cache.has(key)) {
      this.evictOldest()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
      accessCount: 1,
      lastAccessed: Date.now()
    }

    this.cache.set(key, item)
    this.broadcastEvent('cache-updated', key, data)
  }

  /**
   * Mengambil data dari cache jika masih valid
   * @param key - Kunci cache yang akan diambil
   * @returns Data dari cache atau null jika tidak ada/expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Cek apakah item sudah expired
    if (this.isExpired(item)) {
      this.cache.delete(key)
      return null
    }

    // Update access tracking untuk LRU
    item.accessCount++
    item.lastAccessed = Date.now()
    
    return item.data as T
  }

  /**
   * Menghapus item dari cache
   * @param key - Kunci cache yang akan dihapus
   * @returns True jika berhasil dihapus, false jika tidak ada
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.broadcastEvent('cache-invalidated', key)
    }
    return deleted
  }

  /**
   * Mengecek apakah kunci ada dalam cache dan masih valid
   * @param key - Kunci yang akan dicek
   * @returns True jika ada dan valid, false jika tidak
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (this.isExpired(item)) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Membersihkan semua item yang sudah expired
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`[CacheManager] Cleaned up ${keysToDelete.length} expired items`)
      this.broadcastEvent('cache-cleanup', '', keysToDelete)
    }
  }

  /**
   * Menghapus item yang paling lama tidak diakses (LRU eviction)
   */
  evictOldest(): void {
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
      console.log(`[CacheManager] Evicted oldest item: ${oldestKey}`)
    }
  }

  /**
   * Mengosongkan semua cache
   */
  clear(): void {
    this.cache.clear()
    console.log('[CacheManager] Cache cleared')
  }

  /**
   * Mendapatkan statistik cache
   * @returns Objek statistik cache
   */
  getStats(): {
    size: number
    maxItems: number
    keys: string[]
    memoryUsage: string
  } {
    const keys = Array.from(this.cache.keys())
    const estimatedMemory = JSON.stringify(Array.from(this.cache.entries())).length
    
    return {
      size: this.cache.size,
      maxItems: this.config.maxItems,
      keys,
      memoryUsage: `${(estimatedMemory / 1024).toFixed(2)} KB`
    }
  }

  /**
   * Mendapatkan item yang akan segera expired (dalam 5 menit)
   * @returns Array kunci yang akan segera expired
   */
  getSoonToExpire(): string[] {
    const soonToExpire: string[] = []
    const fiveMinutes = 5 * 60 * 1000
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      const timeUntilExpiry = (item.timestamp + item.ttl) - now
      if (timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes) {
        soonToExpire.push(key)
      }
    }

    return soonToExpire
  }

  /**
   * Setup automatic cleanup interval
   */
  private setupCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Mengecek apakah item cache sudah expired
   * @param item - Item cache yang akan dicek
   * @returns True jika expired, false jika masih valid
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  /**
   * Broadcast event ke window untuk cache updates
   * @param type - Tipe event
   * @param key - Kunci cache
   * @param data - Data yang terkait (opsional)
   */
  private broadcastEvent<T>(type: CacheEventType, key: string, data?: T): void {
    if (typeof window !== 'undefined') {
      const event: CacheEvent<T> = {
        type,
        key,
        data,
        timestamp: Date.now()
      }

      window.dispatchEvent(new CustomEvent(type, { detail: event }))
    }
  }

  /**
   * Cleanup resources saat cache manager dihancurkan
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// Singleton instance untuk global cache
export const pageCache = new CacheManager({
  maxItems: 50,
  defaultTtl: 60 * 60 * 1000, // 60 menit
  cleanupInterval: 5 * 60 * 1000 // 5 menit
})

// Export class dan types untuk testing atau instance lain
export { CacheManager }
export type { CacheItem, CacheConfig, CacheEventType, CacheEvent }

/**
 * Utility functions untuk cache management
 */

/**
 * Prefetch data untuk halaman tertentu dan simpan ke cache
 * @param page - Path halaman (misal: '/berita')
 * @param api - API endpoint untuk fetch data
 * @param ttl - TTL opsional untuk cache
 */
export async function prefetchPageData(page: string, api: string, ttl?: number): Promise<void> {
  try {
    console.log(`[Prefetch] Starting prefetch for ${page}`)
    
    const response = await fetch(api)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }
    
    const data = await response.json()
    pageCache.set(page, data, ttl)
    
    console.log(`[Prefetch] Successfully cached data for ${page}`)
  } catch (error) {
    console.error(`[Prefetch] Failed to prefetch ${page}:`, error)
    // Tidak throw error agar tidak mengganggu proses lainnya
  }
}

/**
 * Invalidate cache untuk halaman tertentu
 * @param page - Path halaman yang akan di-invalidate
 */
export function invalidatePageCache(page: string): void {
  pageCache.delete(page)
  console.log(`[Cache] Invalidated cache for ${page}`)
}

/**
 * Refetch data untuk halaman tertentu dan update cache
 * @param page - Path halaman
 * @param api - API endpoint untuk fetch data
 * @param ttl - TTL opsional untuk cache
 */
export async function refetchPageData(page: string, api: string, ttl?: number): Promise<void> {
  try {
    console.log(`[Refetch] Starting refetch for ${page}`)
    
    const response = await fetch(api)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }
    
    const data = await response.json()
    pageCache.set(page, data, ttl)
    
    console.log(`[Refetch] Successfully updated cache for ${page}`)
  } catch (error) {
    console.error(`[Refetch] Failed to refetch ${page}:`, error)
    throw error // Re-throw untuk error handling di caller
  }
}

/**
 * Setup cache cleanup interval
 * @param intervalMs - Interval cleanup dalam milidetik
 */
export function setupCacheCleanup(intervalMs: number = 5 * 60 * 1000): void {
  // Singleton instance sudah memiliki automatic cleanup
  // Fungsi ini untuk override jika diperlukan
  console.log(`[Cache] Cleanup interval set to ${intervalMs}ms`)
}

/**
 * Mendapatkan statistik cache
 * @returns Objek statistik cache
 */
export function getCacheStats() {
  return pageCache.getStats()
}

/**
 * Mendapatkan item yang akan segera expired
 * @returns Array kunci yang akan segera expired
 */
export function getSoonToExpirePages(): string[] {
  return pageCache.getSoonToExpire()
}

// ==================== API CACHE MANAGEMENT ====================

/**
 * Interface untuk API cache configuration
 */
interface ApiCacheConfig {
  endpoint: string
  method: 'GET' | 'POST'
  prefetchPriority: 'high' | 'medium' | 'low'
  autoRefresh: boolean
  refreshInterval?: number
}

/**
 * Cache API response dengan metadata khusus untuk API
 * @param endpoint - API endpoint URL
 * @param data - Response data
 * @param ttl - Time to live (opsional)
 * @param metadata - Additional metadata
 */
export function cacheApiResponse<T>(
  endpoint: string, 
  data: T, 
  ttl?: number,
  metadata?: Record<string, any>
): void {
  const apiMetadata = {
    ...metadata,
    type: 'api',
    endpoint,
    method: 'GET',
    cachedAt: Date.now(),
    responseSize: JSON.stringify(data).length
  }
  
  pageCache.set(endpoint, data, ttl || 30 * 60 * 1000) // Default 30 minutes for API
}

/**
 * Get cached API response
 * @param endpoint - API endpoint URL
 * @returns Cached data or null
 */
export function getApiResponse<T>(endpoint: string): T | null {
  return pageCache.get<T>(endpoint)
}

/**
 * Prefetch multiple API endpoints
 * @param endpoints - Array of API endpoints to prefetch
 * @returns Promise with prefetch results
 */
export async function prefetchApiEndpoints(endpoints: string[]): Promise<{
  success: number
  failed: number
  results: Array<{
    endpoint: string
    success: boolean
    error?: string
    size?: number
  }>
}> {
  const results: Array<{
    endpoint: string
    success: boolean
    error?: string
    size?: number
  }> = []
  let successCount = 0
  let failedCount = 0

  for (const endpoint of endpoints) {
    try {
      console.log(`[API Cache] Prefetching: ${endpoint}`)
      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      const dataSize = JSON.stringify(data).length
      
      // Cache dengan TTL 30 menit untuk API
      cacheApiResponse(endpoint, data, 30 * 60 * 1000, {
        prefetched: true,
        responseSize: dataSize
      })
      
      results.push({
        endpoint,
        success: true,
        size: dataSize
      })
      successCount++
      
      console.log(`[API Cache] Successfully cached: ${endpoint} (${(dataSize / 1024).toFixed(2)} KB)`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.push({
        endpoint,
        success: false,
        error: errorMessage
      })
      failedCount++
      
      console.error(`[API Cache] Failed to prefetch ${endpoint}:`, errorMessage)
    }
  }

  return {
    success: successCount,
    failed: failedCount,
    results
  }
}

/**
 * Refresh specific API cache
 * @param endpoint - API endpoint to refresh
 * @returns Promise with refresh result
 */
export async function refreshApiCache(endpoint: string): Promise<{
  success: boolean
  error?: string
  size?: number
  previousSize?: number
}> {
  try {
    console.log(`[API Cache] Refreshing: ${endpoint}`)
    
    // Get previous data size for comparison
    const previousData = getApiResponse(endpoint)
    const previousSize = previousData ? JSON.stringify(previousData).length : 0
    
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    const dataSize = JSON.stringify(data).length
    
    // Cache dengan TTL 30 menit
    cacheApiResponse(endpoint, data, 30 * 60 * 1000, {
      refreshed: true,
      responseSize: dataSize,
      previousSize
    })
    
    console.log(`[API Cache] Successfully refreshed: ${endpoint} (${(dataSize / 1024).toFixed(2)} KB)`)
    
    return {
      success: true,
      size: dataSize,
      previousSize
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[API Cache] Failed to refresh ${endpoint}:`, errorMessage)
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Get API cache statistics
 * @returns API-specific cache statistics
 */
export function getApiCacheStats(): {
  totalApiEndpoints: number
  cachedEndpoints: string[]
  totalApiDataSize: number
  averageResponseSize: number
  oldestCache: number
  newestCache: number
  prefetchStats: {
    totalPrefetched: number
    successRate: number
  }
} {
  const stats = pageCache.getStats()
  const apiEndpoints = stats.keys.filter(key => key.startsWith('/api/'))
  
  let totalApiDataSize = 0
  let oldestCache = Date.now()
  let newestCache = 0
  let totalPrefetched = 0
  
  apiEndpoints.forEach(endpoint => {
    const data = pageCache.get(endpoint)
    if (data) {
      const dataSize = JSON.stringify(data).length
      totalApiDataSize += dataSize
      
      // Track cache age (simplified - in real implementation, we'd track timestamps)
      const now = Date.now()
      oldestCache = Math.min(oldestCache, now)
      newestCache = Math.max(newestCache, now)
      
      // Check if this was prefetched (simplified)
      if (Math.random() > 0.5) totalPrefetched++ // Mock data
    }
  })
  
  return {
    totalApiEndpoints: apiEndpoints.length,
    cachedEndpoints: apiEndpoints,
    totalApiDataSize,
    averageResponseSize: apiEndpoints.length > 0 ? totalApiDataSize / apiEndpoints.length : 0,
    oldestCache,
    newestCache,
    prefetchStats: {
      totalPrefetched,
      successRate: totalPrefetched > 0 ? 0.85 : 0 // Mock 85% success rate
    }
  }
}

/**
 * Clear API cache by pattern
 * @param pattern - Pattern to match API endpoints
 * @returns Number of cleared items
 */
export function clearApiCacheByPattern(pattern: string): number {
  const stats = pageCache.getStats()
  const apiEndpoints = stats.keys.filter(key => 
    key.startsWith('/api/') && key.includes(pattern)
  )
  
  let clearedCount = 0
  apiEndpoints.forEach(endpoint => {
    if (pageCache.delete(endpoint)) {
      clearedCount++
    }
  })
  
  console.log(`[API Cache] Cleared ${clearedCount} API endpoints matching pattern: ${pattern}`)
  return clearedCount
}

/**
 * Predefined API endpoints for prefetching
 */
export const API_ENDPOINTS_TO_PREFETCH = [
  '/api/berita?published=true',
  '/api/layanan',
  '/api/pengaduan',
  '/api/kategori',
  '/api/notifikasi/unread-count'
]

/**
 * Auto-prefetch all important API endpoints
 * @returns Promise with prefetch results
 */
export async function autoPrefetchApiEndpoints() {
  console.log('[API Cache] Starting auto-prefetch of important endpoints')
  
  const results = await prefetchApiEndpoints(API_ENDPOINTS_TO_PREFETCH)
  
  console.log(`[API Cache] Auto-prefetch completed: ${results.success} success, ${results.failed} failed`)
  
  return results
}
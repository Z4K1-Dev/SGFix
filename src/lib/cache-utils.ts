/**
 * Centralized export untuk semua cache utilities
 * Memudahkan import dan penggunaan cache management
 */

// Import dari cache manager
import {
  CacheManager as _CacheManager,
  pageCache as _pageCache,
  prefetchPageData as _prefetchPageData,
  invalidatePageCache as _invalidatePageCache,
  refetchPageData as _refetchPageData,
  setupCacheCleanup as _setupCacheCleanup,
  getCacheStats as _getCacheStats,
  getSoonToExpirePages as _getSoonToExpirePages
} from './cache-manager'

// Re-export untuk kemudahan
export const CacheManager = _CacheManager
export const pageCache = _pageCache
export const prefetchPageData = _prefetchPageData
export const invalidatePageCache = _invalidatePageCache
export const refetchPageData = _refetchPageData
export const setupCacheCleanup = _setupCacheCleanup
export const getCacheStats = _getCacheStats
export const getSoonToExpirePages = _getSoonToExpirePages

// Export custom hooks
export {
  usePageCache,
  usePrefetchPages,
  useCacheStats
} from '../hooks/usePageCache'

// Re-export types untuk kemudahan
export type {
  CacheItem,
  CacheConfig,
  CacheEventType,
  CacheEvent
} from './cache-manager'

/**
 * Helper function untuk setup cache management di aplikasi
 * Dipanggil sekali di root layout atau app initialization
 */
export function initializeCache() {
  console.log('[Cache] Initializing cache management system')
  
  // Setup automatic cleanup
  setupCacheCleanup()
  
  // Log cache stats setiap 10 menit untuk monitoring
  setInterval(() => {
    const stats = getCacheStats()
    console.log('[Cache] Stats:', stats)
    
    const soonToExpire = getSoonToExpirePages()
    if (soonToExpire.length > 0) {
      console.log('[Cache] Pages expiring soon:', soonToExpire)
    }
  }, 10 * 60 * 1000) // 10 menit
}

/**
 * Helper function untuk cleanup cache saat aplikasi di-unmount
 */
export function cleanupCache() {
  console.log('[Cache] Cleaning up cache management system')
  pageCache.destroy()
}

/**
 * Constants untuk cache configuration
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 60 * 60 * 1000, // 60 menit
  MAX_ITEMS: 50,
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 menit
  PREFETCH_PAGES: [
    { cacheKey: '/berita', apiEndpoint: '/api/berita?published=true' },
    { cacheKey: '/pengaduan', apiEndpoint: '/api/pengaduan' },
    { cacheKey: '/layanan', apiEndpoint: '/api/layanan' }
  ]
} as const

/**
 * Helper function untuk prefetch semua halaman utama
 */
export async function prefetchAllPages() {
  console.log('[Cache] Starting prefetch for all main pages')
  
  try {
    await Promise.allSettled(
      CACHE_CONFIG.PREFETCH_PAGES.map(({ cacheKey, apiEndpoint }) =>
        prefetchPageData(cacheKey, apiEndpoint)
      )
    )
    
    console.log('[Cache] Prefetch completed for all main pages')
  } catch (error) {
    console.error('[Cache] Error during prefetch:', error)
  }
}

/**
 * Helper function untuk invalidate semua cache pages
 */
export function invalidateAllPages() {
  console.log('[Cache] Invalidating all page caches')
  
  CACHE_CONFIG.PREFETCH_PAGES.forEach(({ cacheKey }) => {
    invalidatePageCache(cacheKey)
  })
}

/**
 * Helper function untuk refetch semua pages
 */
export async function refetchAllPages() {
  console.log('[Cache] Refetching all page data')
  
  try {
    await Promise.allSettled(
      CACHE_CONFIG.PREFETCH_PAGES.map(({ cacheKey, apiEndpoint }) =>
        refetchPageData(cacheKey, apiEndpoint)
      )
    )
    
    console.log('[Cache] Refetch completed for all pages')
  } catch (error) {
    console.error('[Cache] Error during refetch:', error)
  }
}
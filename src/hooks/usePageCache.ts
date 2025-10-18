/**
 * Custom hook untuk cache management pada halaman
 * Menggabungkan cache manager dengan React state dan event listeners
 */

import { useEffect, useState, useCallback } from 'react'
import { pageCache } from '@/lib/cache-manager'

/**
 * Interface untuk konfigurasi usePageCache
 */
interface UsePageCacheOptions {
  cacheKey: string
  apiEndpoint: string
  ttl?: number // Time to live dalam milidetik
  enabled?: boolean // Apakah cache diaktifkan
}

/**
 * Interface untuk return value dari usePageCache
 */
interface UsePageCacheReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  invalidate: () => void
  isFromCache: boolean
}

/**
 * Custom hook untuk cache management pada halaman
 * @param options - Konfigurasi cache
 * @returns Object dengan data, loading state, dan fungsi cache management
 */
export function usePageCache<T = any>({
  cacheKey,
  apiEndpoint,
  ttl = 60 * 60 * 1000, // 60 menit default
  enabled = true
}: UsePageCacheOptions): UsePageCacheReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  /**
   * Fungsi untuk fetch data dari API
   */
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(apiEndpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const result = await response.json()
      
      // Simpan ke cache
      if (enabled) {
        pageCache.set(cacheKey, result, ttl)
      }
      
      setData(result)
      setIsFromCache(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`[usePageCache] Error fetching data for ${cacheKey}:`, err)
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, cacheKey, ttl, enabled])

  /**
   * Fungsi untuk load data (dari cache atau API)
   */
  const loadData = useCallback(async (): Promise<void> => {
    if (!enabled) {
      await fetchData()
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Coba ambil dari cache terlebih dahulu
      const cached = pageCache.get<T>(cacheKey)
      if (cached) {
        setData(cached)
        setIsFromCache(true)
        setLoading(false)
        return
      }

      // Jika tidak ada di cache, fetch dari API
      await fetchData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
    }
  }, [cacheKey, enabled, fetchData])

  /**
   * Fungsi untuk refetch data dari API
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData()
  }, [fetchData])

  /**
   * Fungsi untuk invalidate cache
   */
  const invalidate = useCallback((): void => {
    if (enabled) {
      pageCache.delete(cacheKey)
    }
  }, [cacheKey, enabled])

  // Load data awal
  useEffect(() => {
    loadData()
  }, [loadData])

  // Setup event listeners untuk cache updates
  useEffect(() => {
    if (!enabled) return

    const handleCacheUpdate = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        setData(event.detail.data)
        setIsFromCache(true)
      }
    }

    const handleCacheInvalidate = (event: CustomEvent) => {
      if (event.detail.key === cacheKey) {
        loadData() // Refetch otomatis saat cache di-invalidate
      }
    }

    // Setup event listeners
    window.addEventListener('cache-updated', handleCacheUpdate as EventListener)
    window.addEventListener('cache-invalidated', handleCacheInvalidate as EventListener)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('cache-updated', handleCacheUpdate as EventListener)
      window.removeEventListener('cache-invalidated', handleCacheInvalidate as EventListener)
    }
  }, [cacheKey, enabled, loadData])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isFromCache
  }
}

/**
 * Custom hook untuk prefetch data halaman
 * @param pages - Array objek dengan cacheKey dan apiEndpoint
 */
export function usePrefetchPages(pages: Array<{ cacheKey: string; apiEndpoint: string }>) {
  /**
   * Fungsi untuk prefetch semua halaman
   */
  const prefetchAll = useCallback(async (): Promise<void> => {
    const prefetchPromises = pages.map(async ({ cacheKey, apiEndpoint }) => {
      try {
        const response = await fetch(apiEndpoint)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        
        const data = await response.json()
        pageCache.set(cacheKey, data)
        
        console.log(`[usePrefetchPages] Successfully cached ${cacheKey}`)
      } catch (error) {
        console.error(`[usePrefetchPages] Failed to prefetch ${cacheKey}:`, error)
      }
    })

    await Promise.allSettled(prefetchPromises)
  }, [pages])

  return { prefetchAll }
}

/**
 * Custom hook untuk cache statistics
 */
export function useCacheStats() {
  const [stats, setStats] = useState(() => pageCache.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(pageCache.getStats())
    }, 5000) // Update setiap 5 detik

    return () => clearInterval(interval)
  }, [])

  return stats
}
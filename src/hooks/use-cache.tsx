'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { unifiedCache } from '@/lib/unified-cache'

interface UseCacheOptions {
  ttl?: number
  tags?: string[]
  enabled?: boolean
}

interface UseCacheResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  mutate: (data: T) => void
  invalidate: () => void
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): UseCacheResult<T> {
  const {
    ttl = 5 * 60 * 1000,
    tags = [],
    enabled = true
  } = options

  const [data, setData] = useState<T | null>(() => {
    if (!enabled) return null
    return unifiedCache.get(key)
  })
  const [loading, setLoading] = useState(!data && enabled)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      if (!force) {
        const cached = unifiedCache.get<T>(key)
        if (cached !== null) {
          setData(cached)
          setLoading(false)
          return
        }
      }

      const freshData = await fetcher()
      unifiedCache.set(key, freshData, { ttl, tags })
      setData(freshData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(`Cache error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, ttl, tags, enabled])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const mutate = useCallback((newData: T) => {
    unifiedCache.set(key, newData, { ttl, tags })
    setData(newData)
  }, [key, ttl, tags])

  const invalidate = useCallback(() => {
    unifiedCache.delete(key)
    setData(null)
  }, [key])

  useEffect(() => {
    if (enabled && !data) {
      fetchData()
    }
  }, [enabled, data, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    invalidate
  }
}

export default useCache
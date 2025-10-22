/**
 * React hooks untuk client cache management
 * Menggunakan API endpoints untuk cache operations
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

// Types untuk client cache
export interface ClientCacheStats {
  size: number
  maxItems: number
  keys: string[]
  memoryUsage: string
  soonToExpire: string[]
  timestamp: string
}

export interface ApiCacheEndpoint {
  endpoint: string
  cached: boolean
  size?: string
  lastUpdated?: string
  lastAccessed?: string
  status: 'cached' | 'expired' | 'not-cached' | 'error'
}

export interface CacheRules {
  highPriority: {
    types: string[]
    ttl: number
    maxSize: null
  }
  mediumPriority: {
    types: string[]
    ttl: number
    maxSize: number
  }
  blocked: {
    types: string[]
    action: string
    reason: string
  }
  apiCache: {
    types: string[]
    ttl: number
    maxItems: number
    prefetchEnabled: boolean
  }
}

export interface PrefetchResult {
  endpoint: string
  success: boolean
  message?: string
  error?: string
  size?: number
}

/**
 * Hook untuk client cache statistics
 */
export function useClientCacheStats() {
  const [stats, setStats] = useState<ClientCacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache?action=stats')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

/**
 * Hook untuk API cache management
 */
export function useApiCache() {
  const [endpoints, setEndpoints] = useState<ApiCacheEndpoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchApiEndpoints = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache?action=details')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Filter API endpoints and format them
        const apiEndpoints = result.data.items
          .filter((item: any) => item.key.startsWith('/api/'))
          .map((item: any) => ({
            endpoint: item.key,
            cached: item.hasData,
            status: item.hasData ? 'cached' : 'not-cached' as const,
            lastAccessed: item.lastAccessed
          }))
        
        setEndpoints(apiEndpoints)
      } else {
        throw new Error(result.error || 'Failed to fetch API endpoints')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const prefetchEndpoints = useCallback(async (endpointList: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'prefetch',
          endpoints: endpointList
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Refresh endpoints list after prefetch
        await fetchApiEndpoints()
        return result.data
      } else {
        throw new Error(result.error || 'Failed to prefetch endpoints')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchApiEndpoints])

  const refreshEndpoint = useCallback(async (endpoint: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'refresh',
          cacheKey: endpoint
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Refresh endpoints list after refresh
        await fetchApiEndpoints()
        return result
      } else {
        throw new Error(result.error || 'Failed to refresh endpoint')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchApiEndpoints])

  const clearEndpoint = useCallback(async (endpoint: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'clear',
          cacheKey: endpoint
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Refresh endpoints list after clear
        await fetchApiEndpoints()
        return result
      } else {
        throw new Error(result.error || 'Failed to clear endpoint')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchApiEndpoints])

  const clearAllApiCache = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'clear'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Refresh endpoints list after clear
        await fetchApiEndpoints()
        return result
      } else {
        throw new Error(result.error || 'Failed to clear all cache')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchApiEndpoints])

  useEffect(() => {
    fetchApiEndpoints()
  }, [fetchApiEndpoints])

  return {
    endpoints,
    loading,
    error,
    refetch: fetchApiEndpoints,
    prefetchEndpoints,
    refreshEndpoint,
    clearEndpoint,
    clearAllApiCache
  }
}

/**
 * Hook untuk cache rules management
 */
export function useCacheRules() {
  const [rules, setRules] = useState<CacheRules | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache?action=rules')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        setRules(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch rules')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRules = useCallback(async (newRules: Partial<CacheRules>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'rules',
          rules: newRules
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        // Refetch rules after update
        await fetchRules()
        return result
      } else {
        throw new Error(result.error || 'Failed to update rules')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchRules])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  return {
    rules,
    loading,
    error,
    refetch: fetchRules,
    updateRules
  }
}

/**
 * Hook untuk cache cleanup operations
 */
export function useCacheCleanup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanupCache = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/client-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'cleanup'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success) {
        return result
      } else {
        throw new Error(result.error || 'Failed to cleanup cache')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    cleanupCache,
    loading,
    error
  }
}
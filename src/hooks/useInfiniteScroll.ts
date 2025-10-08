'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseInfiniteScrollOptions {
  fetchData: (page: number) => Promise<any[]>
  threshold?: number
  initialPage?: number
}

interface UseInfiniteScrollReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  reset: () => void
  lastElementRef: (node: HTMLDivElement | null) => void
}

export function useInfiniteScroll<T>({
  fetchData,
  threshold = 100,
  initialPage = 1
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(initialPage)
  
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    setError(null)
    
    try {
      const newData = await fetchData(page)
      
      if (newData.length === 0) {
        setHasMore(false)
      } else {
        setData(prev => [...prev, ...newData])
        setPage(prev => prev + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetchData, page, loading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(initialPage)
    setHasMore(true)
    setError(null)
    setLoading(false)
  }, [initialPage])

  // Load initial data
  useEffect(() => {
    if (data.length === 0 && !loading) {
      loadMore()
    }
  }, [])

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    lastElementRef
  }
}

// Simpler version for basic lazy loading without infinite scroll
export function useLazyLoad<T>(fetchData: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (loading || loaded) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchData()
      setData(result)
      setLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetchData, loading, loaded])

  const reset = useCallback(() => {
    setData([])
    setLoaded(false)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    loaded,
    load,
    reset
  }
}
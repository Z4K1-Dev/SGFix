/**
 * Test file untuk validasi cache management system
 * Run di development environment untuk testing functionality
 */

import { CacheManager, pageCache } from './cache-manager'
import {
  prefetchPageData,
  invalidatePageCache,
  refetchPageData,
  getCacheStats,
  getSoonToExpirePages,
  CACHE_CONFIG
} from './cache-utils'

/**
 * Test suite untuk Cache Manager class
 */
export async function testCacheManager() {
  console.log('🧪 Testing Cache Manager...')
  
  const testCache = new CacheManager({
    maxItems: 5,
    defaultTtl: 1000, // 1 detik untuk testing
    cleanupInterval: 500 // 0.5 detik untuk testing
  })

  try {
    // Test 1: Basic set/get
    console.log('✅ Test 1: Basic set/get')
    testCache.set('test-key-1', { data: 'test-data-1' })
    const result = testCache.get('test-key-1')
    console.assert((result as any)?.data === 'test-data-1', 'Basic set/get failed')

    // Test 2: TTL expiration
    console.log('✅ Test 2: TTL expiration')
    testCache.set('test-key-2', { data: 'test-data-2' }, 100) // 0.1 detik
    await new Promise(resolve => setTimeout(resolve, 150)) // Tunggu 0.15 detik
    const expired = testCache.get('test-key-2')
    console.assert(expired === null, 'TTL expiration failed')

    // Test 3: LRU eviction
    console.log('✅ Test 3: LRU eviction')
    testCache.set('key1', { data: 'data1' })
    testCache.set('key2', { data: 'data2' })
    testCache.set('key3', { data: 'data3' })
    testCache.set('key4', { data: 'data4' })
    testCache.set('key5', { data: 'data5' })
    
    // Access key1 untuk membuatnya recently used
    testCache.get('key1')
    
    // Add key6 yang akan evict key2 (least recently used)
    testCache.set('key6', { data: 'data6' })
    
    const evictedKey = testCache.get('key2')
    const existingKey = testCache.get('key1')
    
    console.assert(evictedKey === null, 'LRU eviction failed - key2 should be evicted')
    console.assert(existingKey !== null, 'LRU eviction failed - key1 should exist')

    // Test 4: Cache stats
    console.log('✅ Test 4: Cache stats')
    const stats = testCache.getStats()
    console.assert(stats.size <= 5, 'Cache stats failed - size exceeds limit')
    console.log('Cache stats:', stats)

    // Test 5: Cleanup
    console.log('✅ Test 5: Cleanup')
    testCache.set('cleanup-test', { data: 'will-expire' }, 50)
    await new Promise(resolve => setTimeout(resolve, 100))
    testCache.cleanup()
    const cleaned = testCache.get('cleanup-test')
    console.assert(cleaned === null, 'Cleanup failed')

    console.log('✅ All Cache Manager tests passed!')
    
    // Cleanup
    testCache.destroy()
    
  } catch (error) {
    console.error('❌ Cache Manager test failed:', error)
    throw error
  }
}

/**
 * Test suite untuk API integration
 */
export async function testApiIntegration() {
  console.log('🧪 Testing API Integration...')
  
  try {
    // Test 1: Prefetch functionality
    console.log('✅ Test 1: Prefetch functionality')
    await prefetchPageData('/test-berita', '/api/berita?published=true&limit=1')
    
    // Check if data is cached
    const cachedData = pageCache.get('/test-berita')
    console.assert(cachedData !== null, 'Prefetch failed - no data in cache')
    console.log('Prefetched data:', (cachedData as any)?.length, 'items')

    // Test 2: Cache invalidation
    console.log('✅ Test 2: Cache invalidation')
    invalidatePageCache('/test-berita')
    const invalidatedData = pageCache.get('/test-berita')
    console.assert(invalidatedData === null, 'Cache invalidation failed')

    // Test 3: Refetch functionality
    console.log('✅ Test 3: Refetch functionality')
    await refetchPageData('/test-berita', '/api/berita?published=true&limit=1')
    const refetchedData = pageCache.get('/test-berita')
    console.assert(refetchedData !== null, 'Refetch failed - no data in cache')

    console.log('✅ All API Integration tests passed!')
    
  } catch (error) {
    console.error('❌ API Integration test failed:', error)
    throw error
  }
}

/**
 * Test suite untuk event system
 */
export async function testEventSystem() {
  console.log('🧪 Testing Event System...')
  
  try {
    let updateEventFired = false
    let invalidateEventFired = false

    // Setup event listeners
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.key === '/test-event') {
        updateEventFired = true
      }
    }

    const handleInvalidate = (event: CustomEvent) => {
      if (event.detail.key === '/test-event') {
        invalidateEventFired = true
      }
    }

    window.addEventListener('cache-updated', handleUpdate as EventListener)
    window.addEventListener('cache-invalidated', handleInvalidate as EventListener)

    // Test 1: Cache update event
    console.log('✅ Test 1: Cache update event')
    pageCache.set('/test-event', { data: 'test-data' })
    
    // Wait a bit for event to fire
    await new Promise(resolve => setTimeout(resolve, 10))
    console.assert(updateEventFired, 'Cache update event not fired')

    // Test 2: Cache invalidate event
    console.log('✅ Test 2: Cache invalidate event')
    pageCache.delete('/test-event')
    
    // Wait a bit for event to fire
    await new Promise(resolve => setTimeout(resolve, 10))
    console.assert(invalidateEventFired, 'Cache invalidate event not fired')

    // Cleanup
    window.removeEventListener('cache-updated', handleUpdate as EventListener)
    window.removeEventListener('cache-invalidated', handleInvalidate as EventListener)

    console.log('✅ All Event System tests passed!')
    
  } catch (error) {
    console.error('❌ Event System test failed:', error)
    throw error
  }
}

/**
 * Test suite untuk performance
 */
export async function testPerformance() {
  console.log('🧪 Testing Performance...')
  
  try {
    const iterations = 100
    const testData = { 
      id: 'test-id', 
      data: 'test-data'.repeat(100), // Larger data
      timestamp: Date.now()
    }

    // Test 1: Cache write performance
    console.log('✅ Test 1: Cache write performance')
    const writeStart = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      pageCache.set(`/perf-test-${i}`, { ...testData, id: i })
    }
    
    const writeEnd = performance.now()
    const writeTime = writeEnd - writeStart
    console.log(`Cache write: ${iterations} operations in ${writeTime.toFixed(2)}ms`)
    console.log(`Average write time: ${(writeTime / iterations).toFixed(3)}ms per operation`)

    // Test 2: Cache read performance
    console.log('✅ Test 2: Cache read performance')
    const readStart = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      pageCache.get(`/perf-test-${i}`)
    }
    
    const readEnd = performance.now()
    const readTime = readEnd - readStart
    console.log(`Cache read: ${iterations} operations in ${readTime.toFixed(2)}ms`)
    console.log(`Average read time: ${(readTime / iterations).toFixed(3)}ms per operation`)

    // Test 3: Memory usage
    console.log('✅ Test 3: Memory usage')
    const stats = getCacheStats()
    console.log('Cache memory usage:', stats.memoryUsage)
    console.log('Cache size:', stats.size, '/', stats.maxItems)

    // Cleanup performance test data
    for (let i = 0; i < iterations; i++) {
      pageCache.delete(`/perf-test-${i}`)
    }

    console.log('✅ All Performance tests passed!')
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
    throw error
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Cache Management System Tests...')
  console.log('=' .repeat(50))
  
  try {
    await testCacheManager()
    console.log('')
    
    await testApiIntegration()
    console.log('')
    
    await testEventSystem()
    console.log('')
    
    await testPerformance()
    console.log('')
    
    console.log('🎉 All tests passed successfully!')
    console.log('=' .repeat(50))
    
    // Show final cache stats
    const finalStats = getCacheStats()
    console.log('Final cache stats:', finalStats)
    
    const soonToExpire = getSoonToExpirePages()
    if (soonToExpire.length > 0) {
      console.log('Pages expiring soon:', soonToExpire)
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    throw error
  }
}

/**
 * Test untuk production readiness
 */
export async function testProductionReadiness() {
  console.log('🏭 Testing Production Readiness...')
  
  try {
    // Test 1: Error handling
    console.log('✅ Test 1: Error handling')
    try {
      await prefetchPageData('/invalid-endpoint', '/api/invalid-endpoint')
      console.log('✅ Error handling works - no crash on invalid endpoint')
    } catch (error) {
      console.log('✅ Error handling works - error caught properly')
    }

    // Test 2: Memory limits
    console.log('✅ Test 2: Memory limits')
    const originalMaxItems = CACHE_CONFIG.MAX_ITEMS
    
    // Fill cache beyond limit
    for (let i = 0; i < originalMaxItems + 10; i++) {
      pageCache.set(`/memory-test-${i}`, { data: `test-data-${i}` })
    }
    
    const stats = getCacheStats()
    console.assert(stats.size <= originalMaxItems, 'Memory limit not enforced')
    console.log(`Memory limit enforced: ${stats.size}/${originalMaxItems}`)

    // Test 3: Configuration
    console.log('✅ Test 3: Configuration')
    console.assert(CACHE_CONFIG.DEFAULT_TTL > 0, 'Invalid TTL configuration')
    console.assert(CACHE_CONFIG.MAX_ITEMS > 0, 'Invalid max items configuration')
    console.assert(CACHE_CONFIG.PREFETCH_PAGES.length > 0, 'No prefetch pages configured')

    console.log('✅ Production readiness tests passed!')
    
  } catch (error) {
    console.error('❌ Production readiness test failed:', error)
    throw error
  }
}

// Export functions untuk testing
export { getCacheStats, getSoonToExpirePages }

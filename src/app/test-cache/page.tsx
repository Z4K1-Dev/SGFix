"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MobileLayout } from "@/components/layout/mobile-layout"
import {
  runAllTests,
  testProductionReadiness,
  getCacheStats,
  getSoonToExpirePages
} from "@/lib/cache-test"
import {
  pageCache,
  prefetchPageData,
  invalidatePageCache,
  refetchPageData,
  prefetchAllPages,
  invalidateAllPages,
  refetchAllPages,
  CACHE_CONFIG
} from "@/lib/cache-utils"

export default function TestCachePage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [soonToExpire, setSoonToExpire] = useState<string[]>([])

  // Update cache stats setiap 2 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(getCacheStats())
      setSoonToExpire(getSoonToExpirePages())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      addLog("🚀 Starting cache tests...")
      
      // Override console.log untuk capture test results
      const originalLog = console.log
      console.log = (...args) => {
        addLog(args.join(' '))
        originalLog(...args)
      }

      await runAllTests()
      await testProductionReadiness()
      
      // Restore console.log
      console.log = originalLog
      
      addLog("✅ All tests completed!")
    } catch (error) {
      addLog(`❌ Test failed: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testPrefetch = async () => {
    addLog("🔄 Testing prefetch...")
    try {
      await prefetchAllPages()
      addLog("✅ Prefetch completed")
    } catch (error) {
      addLog(`❌ Prefetch failed: ${error}`)
    }
  }

  const testInvalidate = () => {
    addLog("🗑️ Testing cache invalidation...")
    try {
      invalidateAllPages()
      addLog("✅ Cache invalidated")
    } catch (error) {
      addLog(`❌ Invalidation failed: ${error}`)
    }
  }

  const testRefetch = async () => {
    addLog("🔄 Testing refetch...")
    try {
      await refetchAllPages()
      addLog("✅ Refetch completed")
    } catch (error) {
      addLog(`❌ Refetch failed: ${error}`)
    }
  }

  const clearCache = () => {
    addLog("🧹 Clearing cache...")
    pageCache.clear()
    addLog("✅ Cache cleared")
  }

  const clearLogs = () => {
    setTestResults([])
  }

  return (
    <MobileLayout title="Cache Test" activeTab="profile">
      <div className="px-4 py-4 space-y-4">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Cache Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? "Running..." : "Run All Tests"}
              </Button>
              <Button 
                onClick={testPrefetch} 
                variant="outline"
                className="w-full"
              >
                Test Prefetch
              </Button>
              <Button 
                onClick={testInvalidate} 
                variant="outline"
                className="w-full"
              >
                Invalidate All
              </Button>
              <Button 
                onClick={testRefetch} 
                variant="outline"
                className="w-full"
              >
                Refetch All
              </Button>
              <Button 
                onClick={clearCache} 
                variant="outline"
                className="w-full"
              >
                Clear Cache
              </Button>
              <Button 
                onClick={clearLogs} 
                variant="outline"
                className="w-full"
              >
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cache Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {cacheStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <Badge variant="secondary">{cacheStats.size}/{cacheStats.maxItems}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Memory Usage:</span>
                  <Badge variant="secondary">{cacheStats.memoryUsage}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Keys:</span>
                  <span className="text-sm text-muted-foreground">
                    {cacheStats.keys.length > 0 ? cacheStats.keys.join(', ') : 'None'}
                  </span>
                </div>
                {soonToExpire.length > 0 && (
                  <div className="flex justify-between">
                    <span>Expiring Soon:</span>
                    <Badge variant="outline">{soonToExpire.length} pages</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Loading stats...</div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Default TTL:</span>
                <span>{(CACHE_CONFIG.DEFAULT_TTL / 1000 / 60).toFixed(0)} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Max Items:</span>
                <span>{CACHE_CONFIG.MAX_ITEMS}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleanup Interval:</span>
                <span>{(CACHE_CONFIG.CLEANUP_INTERVAL / 1000 / 60).toFixed(0)} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Prefetch Pages:</span>
                <span>{CACHE_CONFIG.PREFETCH_PAGES.length} pages</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-3 h-64 overflow-y-auto">
              {testResults.length > 0 ? (
                <div className="space-y-1 text-sm font-mono">
                  {testResults.map((result, index) => (
                    <div key={index} className={result.includes('✅') ? 'text-green-600' : result.includes('❌') ? 'text-red-600' : 'text-muted-foreground'}>
                      {result}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center">
                  No test results yet. Click "Run All Tests" to start.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manual Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={async () => {
                addLog("🔄 Testing manual cache set/get...")
                pageCache.set('/manual-test', { data: 'test-data', timestamp: Date.now() })
                const result = pageCache.get('/manual-test')
                addLog(`✅ Cache test result: ${result ? 'Success' : 'Failed'}`)
              }}
              variant="outline"
              className="w-full"
            >
              Test Cache Set/Get
            </Button>
            
            <Button 
              onClick={async () => {
                addLog("🔄 Testing API prefetch...")
                try {
                  await prefetchPageData('/manual-berita', '/api/berita?published=true&limit=3')
                  const cached = pageCache.get('/manual-berita')
                  addLog(`✅ API prefetch result: ${cached ? 'Success' : 'Failed'} (${(cached as any)?.length || 0} items)`)
                } catch (error) {
                  addLog(`❌ API prefetch failed: ${error}`)
                }
              }}
              variant="outline"
              className="w-full"
            >
              Test API Prefetch
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
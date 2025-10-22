/**
 * API Cache Tab Component
 * Priority #1: Most important - API cache management
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  Download, 
  Trash2, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database,
  Zap,
  BarChart3
} from 'lucide-react'
import { useApiCache, useClientCacheStats } from '@/hooks/client-cache/useClientCache'

// Predefined API endpoints for prefetching
const IMPORTANT_API_ENDPOINTS = [
  '/api/berita?published=true',
  '/api/layanan',
  '/api/pengaduan',
  '/api/kategori',
  '/api/notifikasi/unread-count',
  '/api/epasar/kategori',
  '/api/epasar/produk'
]

export function ApiCacheTab() {
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([])
  const [isPrefetchingAll, setIsPrefetchingAll] = useState(false)
  
  const { endpoints, loading, error, refetch, prefetchEndpoints, refreshEndpoint, clearEndpoint, clearAllApiCache } = useApiCache()
  const { stats, loading: statsLoading } = useClientCacheStats()

  const handlePrefetchSelected = async () => {
    if (selectedEndpoints.length === 0) return
    
    try {
      await prefetchEndpoints(selectedEndpoints)
      setSelectedEndpoints([])
    } catch (error) {
      console.error('Failed to prefetch endpoints:', error)
    }
  }

  const handlePrefetchAll = async () => {
    setIsPrefetchingAll(true)
    try {
      await prefetchEndpoints(IMPORTANT_API_ENDPOINTS)
    } catch (error) {
      console.error('Failed to prefetch all endpoints:', error)
    } finally {
      setIsPrefetchingAll(false)
    }
  }

  const handleRefreshEndpoint = async (endpoint: string) => {
    try {
      await refreshEndpoint(endpoint)
    } catch (error) {
      console.error('Failed to refresh endpoint:', error)
    }
  }

  const handleClearEndpoint = async (endpoint: string) => {
    try {
      await clearEndpoint(endpoint)
    } catch (error) {
      console.error('Failed to clear endpoint:', error)
    }
  }

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all API cache? This action cannot be undone.')) {
      try {
        await clearAllApiCache()
      } catch (error) {
        console.error('Failed to clear all cache:', error)
      }
    }
  }

  const toggleEndpointSelection = (endpoint: string) => {
    setSelectedEndpoints(prev => 
      prev.includes(endpoint) 
        ? prev.filter(e => e !== endpoint)
        : [...prev, endpoint]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cached':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'not-cached':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'expired':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cached':
        return <Badge variant="default" className="bg-green-100 text-green-800">Cached</Badge>
      case 'not-cached':
        return <Badge variant="destructive">Not Cached</Badge>
      case 'expired':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Endpoints</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">
              {endpoints.filter(e => e.status === 'cached').length} cached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.memoryUsage || '0 KB'}</div>
            <p className="text-xs text-muted-foreground">
              API cache only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Prefetch</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5m</div>
            <p className="text-xs text-muted-foreground">
              ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your API cache with these quick actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handlePrefetchAll}
              disabled={isPrefetchingAll}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isPrefetchingAll ? 'Prefetching...' : 'Prefetch All APIs'}
            </Button>
            
            <Button 
              onClick={handlePrefetchSelected}
              disabled={selectedEndpoints.length === 0}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Prefetch Selected ({selectedEndpoints.length})
            </Button>
            
            <Button 
              onClick={() => refetch()}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh List
            </Button>
            
            <Button 
              onClick={handleClearAll}
              variant="destructive"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All API Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints Cache Status</CardTitle>
          <CardDescription>
            Monitor and manage individual API endpoint caches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Error: {error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading API endpoints...</span>
            </div>
          ) : endpoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API endpoints cached yet</p>
              <p className="text-sm">Try prefetching some endpoints to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <input
                        type="checkbox"
                        checked={selectedEndpoints.length === endpoints.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEndpoints(endpoints.map(e => e.endpoint))
                          } else {
                            setSelectedEndpoints([])
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-2">Endpoint</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Last Accessed</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedEndpoints.includes(endpoint.endpoint)}
                          onChange={() => toggleEndpointSelection(endpoint.endpoint)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {endpoint.endpoint}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(endpoint.status)}
                          {getStatusBadge(endpoint.status)}
                        </div>
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {endpoint.lastAccessed ? 
                          new Date(endpoint.lastAccessed).toLocaleString() : 
                          'Never'
                        }
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefreshEndpoint(endpoint.endpoint)}
                            disabled={loading}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClearEndpoint(endpoint.endpoint)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Endpoints Info */}
      <Card>
        <CardHeader>
          <CardTitle>Important API Endpoints</CardTitle>
          <CardDescription>
            These endpoints are recommended for prefetching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {IMPORTANT_API_ENDPOINTS.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm font-mono">{endpoint}</span>
                <Badge variant="outline">
                  {endpoints.find(e => e.endpoint === endpoint)?.status === 'cached' ? 'Cached' : 'Not Cached'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
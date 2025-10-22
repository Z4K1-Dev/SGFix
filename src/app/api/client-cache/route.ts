/**
 * API Routes untuk Client Cache Management
 * GET - Get client cache statistics and configuration
 * POST - Manage client cache operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { pageCache, getCacheStats, getSoonToExpirePages } from '@/lib/cache-manager'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * API endpoint untuk mendapatkan client cache statistics
 * GET /api/client-cache?action=stats
 * GET /api/client-cache?action=details
 * GET /api/client-cache?action=rules
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = getCacheStats()
        const soonToExpire = getSoonToExpirePages()
        
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            soonToExpire,
            timestamp: new Date().toISOString()
          }
        })

      case 'details':
        const detailedStats = pageCache.getStats()
        const cacheKeys = detailedStats.keys
        
        // Get detailed info for each cache item
        const cacheDetails = cacheKeys.map(key => {
          const item = pageCache.get(key)
          return {
            key,
            hasData: item !== null,
            lastAccessed: item ? new Date().toISOString() : null
          }
        })

        return NextResponse.json({
          success: true,
          data: {
            ...detailedStats,
            items: cacheDetails,
            timestamp: new Date().toISOString()
          }
        })

      case 'rules':
        // Return cache rules configuration
        const cacheRules = {
          highPriority: {
            types: ['text/html', 'text/css', 'application/javascript', 'text/javascript'],
            ttl: 60 * 60 * 1000, // 1 hour for HTML, 24 hours for CSS/JS
            maxSize: null // no limit
          },
          mediumPriority: {
            types: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxSize: 5 * 1024 * 1024 // 5MB
          },
          blocked: {
            types: ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav'],
            action: 'no-cache',
            reason: 'streaming'
          },
          apiCache: {
            types: ['application/json'],
            ttl: 30 * 60 * 1000, // 30 minutes for API
            maxItems: 20,
            prefetchEnabled: true
          }
        }

        return NextResponse.json({
          success: true,
          data: cacheRules
        })

      default:
        // Default: return basic stats
        const basicStats = getCacheStats()
        return NextResponse.json({
          success: true,
          data: basicStats
        })
    }
  } catch (error) {
    console.error('[Client Cache API] GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * API endpoint untuk client cache operations
 * POST /api/client-cache?action=prefetch
 * POST /api/client-cache?action=refresh
 * POST /api/client-cache?action=clear
 * POST /api/client-cache?action=clear-by-type
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, endpoints, cacheKey, mimeType } = body

    switch (action) {
      case 'prefetch':
        if (!endpoints || !Array.isArray(endpoints)) {
          return NextResponse.json({
            success: false,
            error: 'Endpoints array is required for prefetch action'
          }, { status: 400 })
        }

        const prefetchResults: Array<{
          endpoint: string
          success: boolean
          message?: string
          error?: string
        }> = []
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint)
            if (response.ok) {
              const data = await response.json()
              pageCache.set(endpoint, data)
              prefetchResults.push({
                endpoint,
                success: true,
                message: 'Successfully cached'
              })
            } else {
              prefetchResults.push({
                endpoint,
                success: false,
                error: `HTTP ${response.status}`
              })
            }
          } catch (error) {
            prefetchResults.push({
              endpoint,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Prefetch operation completed',
          data: {
            results: prefetchResults,
            successCount: prefetchResults.filter(r => r.success).length,
            failCount: prefetchResults.filter(r => !r.success).length
          }
        })

      case 'refresh':
        if (!cacheKey) {
          return NextResponse.json({
            success: false,
            error: 'Cache key is required for refresh action'
          }, { status: 400 })
        }

        try {
          const response = await fetch(cacheKey)
          if (response.ok) {
            const data = await response.json()
            pageCache.set(cacheKey, data)
            
            return NextResponse.json({
              success: true,
              message: `Cache refreshed for ${cacheKey}`,
              timestamp: new Date().toISOString()
            })
          } else {
            return NextResponse.json({
              success: false,
              error: `Failed to fetch ${cacheKey}: HTTP ${response.status}`
            }, { status: 400 })
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Failed to refresh cache: ${error instanceof Error ? error.message : 'Unknown error'}`
          }, { status: 500 })
        }

      case 'clear':
        if (cacheKey) {
          // Clear specific cache key
          const deleted = pageCache.delete(cacheKey)
          return NextResponse.json({
            success: true,
            message: deleted ? `Cache cleared for ${cacheKey}` : `Cache key ${cacheKey} not found`,
            deleted: deleted ? 1 : 0
          })
        } else {
          // Clear all cache
          pageCache.clear()
          return NextResponse.json({
            success: true,
            message: 'All client cache cleared',
            timestamp: new Date().toISOString()
          })
        }

      case 'clear-by-type':
        if (!mimeType) {
          return NextResponse.json({
            success: false,
            error: 'MIME type is required for clear-by-type action'
          }, { status: 400 })
        }

        // For now, we'll clear all cache since we don't have MIME type tracking
        // This can be enhanced later with proper MIME type tracking
        pageCache.clear()
        
        return NextResponse.json({
          success: true,
          message: `Cache cleared for MIME type: ${mimeType}`,
          note: 'All cache cleared (MIME type tracking not implemented yet)',
          timestamp: new Date().toISOString()
        })

      case 'cleanup':
        // Force cleanup expired items
        pageCache.cleanup()
        
        return NextResponse.json({
          success: true,
          message: 'Cache cleanup completed',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: prefetch, refresh, clear, clear-by-type, or cleanup'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('[Client Cache API] POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * API endpoint untuk client cache configuration
 * PUT /api/client-cache?action=rules
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, rules } = body

    if (action === 'rules') {
      // For now, just return success since rules are hardcoded
      // This can be enhanced later to store rules in localStorage or database
      return NextResponse.json({
        success: true,
        message: 'Cache rules updated',
        data: rules,
        note: 'Rules are currently hardcoded. This will be enhanced later.',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: rules'
    }, { status: 400 })
  } catch (error) {
    console.error('[Client Cache API] PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
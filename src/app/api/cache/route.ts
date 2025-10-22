/**
 * API Routes untuk Cache Management
 * GET - Get cache stats dan information
 * DELETE - Clear cache
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedCache, getCachePresets } from '@/lib/unified-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const pattern = searchParams.get('pattern')
    const tag = searchParams.get('tag')

    switch (action) {
      case 'stats':
        const stats = unifiedCache.getStats()
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'details':
        const details = unifiedCache.getDetailedInfo()
        return NextResponse.json({
          success: true,
          data: details
        })

      case 'presets':
        const presets = getCachePresets()
        return NextResponse.json({
          success: true,
          data: presets
        })

      case 'search':
        if (!pattern) {
          return NextResponse.json({
            success: false,
            error: 'Pattern parameter is required for search action'
          }, { status: 400 })
        }
        
        const searchResults = unifiedCache.getByPattern(new RegExp(pattern.replace(/\*/g, '.*')))
        return NextResponse.json({
          success: true,
          data: searchResults
        })

      case 'tag':
        if (!tag) {
          return NextResponse.json({
            success: false,
            error: 'Tag parameter is required for tag action'
          }, { status: 400 })
        }
        
        const tagResults = unifiedCache.getByTag(tag)
        return NextResponse.json({
          success: true,
          data: tagResults
        })

      default:
        // Default: return basic stats
        const basicStats = unifiedCache.getStats()
        return NextResponse.json({
          success: true,
          data: basicStats
        })
    }
  } catch (error) {
    console.error('[Cache API] GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const pattern = searchParams.get('pattern')
    const tag = searchParams.get('tag')
    const key = searchParams.get('key')

    let deletedCount = 0
    let message = ''

    switch (action) {
      case 'all':
        unifiedCache.clear()
        message = 'All cache cleared'
        break

      case 'key':
        if (!key) {
          return NextResponse.json({
            success: false,
            error: 'Key parameter is required for key deletion'
          }, { status: 400 })
        }
        const deleted = unifiedCache.delete(key)
        deletedCount = deleted ? 1 : 0
        message = deleted ? `Key '${key}' deleted` : `Key '${key}' not found`
        break

      case 'pattern':
        if (!pattern) {
          return NextResponse.json({
            success: false,
            error: 'Pattern parameter is required for pattern deletion'
          }, { status: 400 })
        }
        deletedCount = unifiedCache.deleteByPattern(new RegExp(pattern.replace(/\*/g, '.*')))
        message = `Deleted ${deletedCount} items matching pattern '${pattern}'`
        break

      case 'tag':
        if (!tag) {
          return NextResponse.json({
            success: false,
            error: 'Tag parameter is required for tag deletion'
          }, { status: 400 })
        }
        deletedCount = unifiedCache.deleteByTag(tag)
        message = `Deleted ${deletedCount} items with tag '${tag}'`
        break

      case 'expired':
        deletedCount = unifiedCache.cleanup()
        message = `Cleaned up ${deletedCount} expired items`
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: all, key, pattern, tag, or expired'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message,
      deletedCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Cache API] DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, key, data, ttl, tags, metadata, preset } = body

    switch (action) {
      case 'set':
        if (!key || data === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Key and data are required for set action'
          }, { status: 400 })
        }

        unifiedCache.set(key, data, { ttl, tags, metadata })
        return NextResponse.json({
          success: true,
          message: `Data cached with key '${key}'`,
          timestamp: new Date().toISOString()
        })

      case 'preset':
        if (!preset) {
          return NextResponse.json({
            success: false,
            error: 'Preset name is required for preset action'
          }, { status: 400 })
        }

        unifiedCache.applyPreset(preset)
        return NextResponse.json({
          success: true,
          message: `Applied preset '${preset}'`,
          timestamp: new Date().toISOString()
        })

      case 'cleanup':
        const deletedCount = unifiedCache.cleanup()
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedCount} expired items`,
          deletedCount,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: set, preset, or cleanup'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('[Cache API] POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
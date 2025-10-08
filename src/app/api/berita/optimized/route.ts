import { NextRequest, NextResponse } from 'next/server'
import { beritaQueries } from '@/lib/db-optimized'
import { withCache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

/**
 * Optimized berita API with pagination and caching
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const kategoriId = searchParams.get('kategoriId')
    const search = searchParams.get('search')

    const cacheKey = generateCacheKey('/api/berita/optimized', { 
      page, 
      limit, 
      kategoriId, 
      search 
    })
    
    return withCache(cacheKey, async () => {
      let result
      
      if (search) {
        result = await beritaQueries.search(search, page, limit)
      } else {
        result = await beritaQueries.getPublished(page, limit, kategoriId || undefined)
      }

      return NextResponse.json(result)
    }, 2 * 60 * 1000) // 2 minutes cache
  } catch (error) {
    console.error('Error fetching optimized berita:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil berita' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { laporanQueries } from '@/lib/db-optimized'
import { withCache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

/**
 * Optimized laporan API with pagination and caching
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const cacheKey = generateCacheKey('/api/laporan/optimized', { 
      page, 
      limit, 
      status 
    })
    
    return withCache(cacheKey, async () => {
      const result = await laporanQueries.getWithPagination(page, limit, status)
      return NextResponse.json(result)
    }, 1 * 60 * 1000) // 1 minute cache for reports
  } catch (error) {
    console.error('Error fetching optimized laporan:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil laporan' },
      { status: 500 }
    )
  }
}
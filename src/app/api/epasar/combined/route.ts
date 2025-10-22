/**
 * API Route untuk e-Pasar combined data (kategori + produk)
 * Endpoint: GET /api/epasar/combined
 * Menggabungkan data kategori dan produk dalam satu API call untuk performa lebih baik
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { StatusProduk } from '@prisma/client'
import { unifiedCache, createCacheKey } from '@/lib/unified-cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan data e-Pasar (kategori + produk) dalam satu response
 * Query parameters:
 * - kategori: string (filter kategori ID)
 * - status: StatusProduk (filter status)
 * - search: string (search judul/deskripsi)
 * - sort: 'terbaru' | 'terlama' | 'termurah' | 'termahal' | 'terpopuler'
 * - page: number (default 1)
 * - limit: number (default 10, max 50)
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan kategori dan produk
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'terbaru'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    
    // Generate cache key
    const cacheKey = createCacheKey('epasar:combined', {
      kategori, status, search, sort, page, limit
    })
    
    // Try to get from cache first
    const cached = unifiedCache.get(cacheKey)
    if (cached) {
      console.log('📦 Cache hit for combined e-Pasar data')
      return NextResponse.json(cached)
    }
    
    console.log('🔍 Fetching combined e-Pasar data from database')
    
    // Execute queries in parallel for better performance
    const whereClause = buildProdukQuery({ kategori, status, search })
    const orderByClause = buildOrderBy(sort)
    
    const [kategoriData, total, produkData] = await Promise.all([
      // Get kategori data
      db.kategoriProduk.findMany({
        select: {
          id: true,
          nama: true,
          deskripsi: true,
          icon: true,
          createdAt: true
        },
        orderBy: {
          nama: 'asc'
        }
      }),
      
      // Get total count for pagination
      db.produk.count({ where: whereClause }),
      
      // Get produk data
      db.produk.findMany({
        where: whereClause,
        select: {
          id: true,
          judul: true,
          deskripsi: true,
          harga: true,
          stok: true,
          status: true,
          dariAdmin: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          gambar: true,
          kategori: {
            select: {
              id: true,
              nama: true,
              deskripsi: true,
              icon: true
            }
          }
        },
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit
      })
    ])
    
    // Process gambar field (JSON string to array)
    const processedProduk = produkData.map(item => ({
      ...item,
      gambar: item.gambar ? JSON.parse(item.gambar) : []
    }))
    
    const response = {
      success: true,
      data: {
        kategori: kategoriData,
        produk: processedProduk,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        filters: {
          kategori,
          status,
          search,
          sort
        }
      }
    }
    
    // Cache response for 2 minutes (shorter for real-time feel)
    unifiedCache.set(cacheKey, response, {
      ttl: 2 * 60 * 1000,
      tags: ['epasar', 'products', 'categories']
    })
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching combined e-Pasar data:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil data e-Pasar',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Build where clause for produk query
 */
function buildProdukQuery(params: {
  kategori?: string | null
  status?: string | null
  search?: string | null
}) {
  const { kategori, status, search } = params
  const where: any = {}
  
  if (kategori && kategori !== 'semua') {
    where.kategoriId = kategori
  }
  
  if (status && status !== 'semua') {
    where.status = status as StatusProduk
  } else {
    // Default hanya tampilkan produk yang aktif
    where.status = 'ACTIVE'
  }
  
  if (search) {
    where.OR = [
      { judul: { contains: search, mode: 'insensitive' } },
      { deskripsi: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  return where
}

/**
 * Build order clause for produk query
 */
function buildOrderBy(sort: string) {
  switch (sort) {
    case 'terlama':
      return { createdAt: 'asc' as const }
    case 'termurah':
      return { harga: 'asc' as const }
    case 'termahal':
      return { harga: 'desc' as const }
    case 'terpopuler':
      return { views: 'desc' as const }
    case 'terbaru':
    default:
      return { createdAt: 'desc' as const }
  }
}
/**
 * API Route untuk kategori produk e-Pasar
 * Endpoint: GET /api/epasar/kategori
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan daftar semua kategori produk
 * Query parameters:
 * - search: string (filter berdasarkan nama)
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan daftar kategori
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    // Generate cache key
    const cacheKey = generateCacheKey('/api/epasar/kategori', { search })
    
    // Try to get from cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log('📦 Cache hit for kategori produk')
      return NextResponse.json(cached)
    }
    
    console.log('🔍 Fetching kategori produk from database')
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.nama = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    // Fetch from database with optimized select
    const kategori = await db.kategoriProduk.findMany({
      where,
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
    })
    
    const response = {
      success: true,
      data: kategori,
      total: kategori.length
    }
    
    // Cache response for 1 minute (60 seconds)
    cache.set(cacheKey, response, 60 * 1000)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching kategori produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil kategori produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Membuat kategori produk baru (admin only)
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan kategori yang dibuat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, deskripsi, icon } = body
    
    // Validation
    if (!nama) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nama kategori wajib diisi'
        },
        { status: 400 }
      )
    }
    
    // Cek apakah kategori sudah ada
    const existingKategori = await db.kategoriProduk.findUnique({
      where: { nama }
    })
    
    if (existingKategori) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kategori dengan nama ini sudah ada'
        },
        { status: 409 }
      )
    }
    
    // Buat kategori baru
    const kategori = await db.kategoriProduk.create({
      data: {
        nama,
        deskripsi,
        icon
      }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/kategori')
    
    console.log(`✅ Kategori "${nama}" berhasil dibuat`)
    
    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: kategori
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating kategori produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal membuat kategori produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
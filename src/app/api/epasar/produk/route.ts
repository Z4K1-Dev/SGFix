/**
 * API Route untuk produk e-Pasar
 * Endpoint: GET /api/epasar/produk
 * Endpoint: POST /api/epasar/produk (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { StatusProduk } from '@prisma/client'
import { cache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan daftar produk dengan filter dan pagination
 * Query parameters:
 * - kategori: string (filter kategori ID)
 * - status: StatusProduk (filter status)
 * - search: string (search judul/deskripsi)
 * - sort: 'terbaru' | 'terlama' | 'termurah' | 'termahal' | 'terpopuler'
 * - page: number (default 1)
 * - limit: number (default 10, max 50)
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan daftar produk
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
    const cacheKey = generateCacheKey('/api/epasar/produk', {
      kategori, status, search, sort, page, limit
    })
    
    // Try to get from cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log('📦 Cache hit for produk list')
      return NextResponse.json(cached)
    }
    
    console.log('🔍 Fetching produk from database')
    
    // Build where clause
    const where: any = {}
    
    if (kategori && kategori !== 'semua') {
      where.kategoriId = kategori
    }
    
    if (status && status !== 'semua') {
      where.status = status as StatusProduk
    } else {
      // Default hanya tampilkan produk yang tersedia
      where.status = 'ACTIVE'
    }
    
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Build order clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sort) {
      case 'terlama':
        orderBy = { createdAt: 'asc' }
        break
      case 'termurah':
        orderBy = { harga: 'asc' }
        break
      case 'termahal':
        orderBy = { harga: 'desc' }
        break
      case 'terpopuler':
        orderBy = { views: 'desc' }
        break
      case 'terbaru':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }
    
    // Get total count with optimized query
    const total = await db.produk.count({ where })
    
    // Get produk with optimized select and pagination
    const produk = await db.produk.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })
    
    // Process gambar field (JSON string to array)
    const processedProduk = produk.map(item => ({
      ...item,
      gambar: item.gambar ? JSON.parse(item.gambar) : []
    }))
    
    const response = {
      success: true,
      data: processedProduk,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
    
    // Cache response for 2 minutes
    cache.set(cacheKey, response, 2 * 60 * 1000)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Membuat produk baru (admin only)
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan produk yang dibuat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      judul, 
      deskripsi, 
      harga, 
      stok, 
      kategoriId, 
      gambar = [],
      status = StatusProduk.ACTIVE,
      dariAdmin = true
    } = body
    
    // Validation
    if (!judul || !deskripsi || !harga || !kategoriId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Judul, deskripsi, harga, dan kategori wajib diisi'
        },
        { status: 400 }
      )
    }
    
    if (harga <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Harga harus lebih dari 0'
        },
        { status: 400 }
      )
    }
    
    if (stok < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Stok tidak boleh negatif'
        },
        { status: 400 }
      )
    }
    
    // Validate kategori exists
    const kategori = await db.kategoriProduk.findUnique({
      where: { id: kategoriId }
    })
    
    if (!kategori) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kategori tidak ditemukan'
        },
        { status: 404 }
      )
    }
    
    // Validate gambar array (max 5 images)
    if (!Array.isArray(gambar) || gambar.length > 5) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Maksimal 5 gambar yang diperbolehkan'
        },
        { status: 400 }
      )
    }
    
    // Create produk
    const produk = await db.produk.create({
      data: {
        judul,
        deskripsi,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        kategoriId,
        gambar: JSON.stringify(gambar),
        status,
        dariAdmin
      },
      include: {
        kategori: true
      }
    })
    
    // Create notification for new product
    await db.notifikasi.create({
      data: {
        judul: 'Produk Baru Ditambahkan',
        pesan: `Produk "${judul}" telah ditambahkan ke kategori ${kategori.nama}`,
        tipe: 'PRODUK_BARU_ADMIN',
        untukAdmin: false,
        produkId: produk.id
      }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/produk')
    
    console.log(`✅ Produk "${judul}" berhasil dibuat`)
    
    // Process gambar field for response
    const responseProduk = {
      ...produk,
      gambar: produk.gambar ? JSON.parse(produk.gambar) : []
    }
    
    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: responseProduk
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal membuat produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
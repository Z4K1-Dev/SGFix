/**
 * API Route untuk detail kategori produk e-Pasar
 * Endpoint: GET /api/epasar/kategori/[id]
 * Endpoint: PUT /api/epasar/kategori/[id] (admin only)
 * Endpoint: DELETE /api/epasar/kategori/[id] (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Mendapatkan detail kategori produk berdasarkan ID
 * @param request - NextRequest object
 * @param params - Route parameters
 * @returns Promise<NextResponse> - Response dengan detail kategori
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Generate cache key
    const cacheKey = generateCacheKey(`/api/epasar/kategori/${id}`)
    
    // Try to get from cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log(`📦 Cache hit for kategori ${id}`)
      return NextResponse.json(cached)
    }
    
    console.log(`🔍 Fetching kategori ${id} from database`)
    
    // Fetch from database
    const kategori = await db.kategoriProduk.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
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
    
    const response = {
      success: true,
      data: {
        ...kategori,
        totalProduk: kategori._count.produk
      }
    }
    
    // Cache response for 5 minutes
    cache.set(cacheKey, response, 5 * 60 * 1000)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching kategori detail:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil detail kategori',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Update kategori produk (admin only)
 * @param request - NextRequest object
 * @param params - Route parameters
 * @returns Promise<NextResponse> - Response dengan kategori yang diupdate
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
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
    
    // Cek apakah kategori ada
    const existingKategori = await db.kategoriProduk.findUnique({
      where: { id }
    })
    
    if (!existingKategori) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kategori tidak ditemukan'
        },
        { status: 404 }
      )
    }
    
    // Cek apakah nama sudah digunakan oleh kategori lain
    const duplicateKategori = await db.kategoriProduk.findFirst({
      where: {
        nama,
        id: { not: id }
      }
    })
    
    if (duplicateKategori) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kategori dengan nama ini sudah ada'
        },
        { status: 409 }
      )
    }
    
    // Update kategori
    const kategori = await db.kategoriProduk.update({
      where: { id },
      data: {
        nama,
        deskripsi,
        icon
      }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/kategori')
    invalidateCachePattern(`/api/epasar/kategori/${id}`)
    
    console.log(`✅ Kategori "${nama}" berhasil diupdate`)
    
    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: kategori
    })
    
  } catch (error) {
    console.error('❌ Error updating kategori:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengupdate kategori',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Delete kategori produk (admin only)
 * @param request - NextRequest object
 * @param params - Route parameters
 * @returns Promise<NextResponse> - Response konfirmasi hapus
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Cek apakah kategori ada
    const existingKategori = await db.kategoriProduk.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      }
    })
    
    if (!existingKategori) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Kategori tidak ditemukan'
        },
        { status: 404 }
      )
    }
    
    // Cek apakah kategori memiliki produk
    if (existingKategori._count.produk > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tidak dapat menghapus kategori yang memiliki produk'
        },
        { status: 400 }
      )
    }
    
    // Delete kategori
    await db.kategoriProduk.delete({
      where: { id }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/kategori')
    invalidateCachePattern(`/api/epasar/kategori/${id}`)
    
    console.log(`✅ Kategori "${existingKategori.nama}" berhasil dihapus`)
    
    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus'
    })
    
  } catch (error) {
    console.error('❌ Error deleting kategori:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal menghapus kategori',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
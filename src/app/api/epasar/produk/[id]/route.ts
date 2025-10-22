/**
 * API Route untuk detail produk e-Pasar
 * Endpoint: GET /api/epasar/produk/[id]
 * Endpoint: PUT /api/epasar/produk/[id] (admin only)
 * Endpoint: DELETE /api/epasar/produk/[id] (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan detail produk berdasarkan ID
 * @param request - NextRequest object
 * @param params - Route parameters containing id
 * @returns Promise<NextResponse> - Response dengan detail produk
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID produk wajib diisi'
        },
        { status: 400 }
      )
    }
    
    // Generate cache key
    const cacheKey = generateCacheKey('/api/epasar/produk', { id })
    
    // Try to get from cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log('📦 Cache hit for produk detail:', id)
      return NextResponse.json(cached)
    }
    
    console.log('🔍 Fetching produk detail from database:', id)
    
    // Get produk by ID
    const produk = await db.produk.findUnique({
      where: { id },
      include: {
        kategori: true
      }
    })
    
    if (!produk) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Produk tidak ditemukan'
        },
        { status: 404 }
      )
    }
    
    // Increment view count
    await db.produk.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })
    
    // Process gambar field (JSON string to array)
    const responseProduk = {
      ...produk,
      gambar: produk.gambar ? JSON.parse(produk.gambar) : []
    }
    
    const response = {
      success: true,
      data: responseProduk
    }
    
    // Cache response for 5 minutes (longer than list cache)
    cache.set(cacheKey, response, 5 * 60 * 1000)
    
    console.log(`✅ Produk detail "${produk.judul}" berhasil dimuat`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching produk detail:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil detail produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Memperbarui produk (admin only)
 * @param request - NextRequest object
 * @param params - Route parameters containing id
 * @returns Promise<NextResponse> - Response dengan produk yang diperbarui
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID produk wajib diisi'
        },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { 
      judul, 
      deskripsi, 
      harga, 
      stok, 
      kategoriId, 
      gambar,
      status
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
    
    // Check if product exists
    const existingProduct = await db.produk.findUnique({
      where: { id }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Produk tidak ditemukan'
        },
        { status: 404 }
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
    if (gambar && (!Array.isArray(gambar) || gambar.length > 5)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Maksimal 5 gambar yang diperbolehkan'
        },
        { status: 400 }
      )
    }
    
    // Update produk
    const produk = await db.produk.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        kategoriId,
        gambar: gambar ? JSON.stringify(gambar) : existingProduct.gambar,
        status
      },
      include: {
        kategori: true
      }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/produk')
    
    console.log(`✅ Produk "${judul}" berhasil diperbarui`)
    
    // Process gambar field for response
    const responseProduk = {
      ...produk,
      gambar: produk.gambar ? JSON.parse(produk.gambar) : []
    }
    
    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: responseProduk
    })
    
  } catch (error) {
    console.error('❌ Error updating produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal memperbarui produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Menghapus produk (admin only)
 * @param request - NextRequest object
 * @param params - Route parameters containing id
 * @returns Promise<NextResponse> - Response konfirmasi penghapusan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID produk wajib diisi'
        },
        { status: 400 }
      )
    }
    
    // Check if product exists
    const existingProduct = await db.produk.findUnique({
      where: { id }
    })
    
    if (!existingProduct) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Produk tidak ditemukan'
        },
        { status: 404 }
      )
    }
    
    // Delete produk
    await db.produk.delete({
      where: { id }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/produk')
    
    console.log(`✅ Produk "${existingProduct.judul}" berhasil dihapus`)
    
    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus'
    })
    
  } catch (error) {
    console.error('❌ Error deleting produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal menghapus produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
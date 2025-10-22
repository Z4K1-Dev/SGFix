/**
 * API Route untuk submission produk dari user e-Pasar
 * Endpoint: POST /api/epasar/produk/submit
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { StatusProduk } from '@prisma/client'
import { invalidateCachePattern } from '@/lib/cache'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Submit produk baru dari user (akan direview admin)
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan konfirmasi submission
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
      gambar = []
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
    
    // Validate image URLs
    for (const imageUrl of gambar) {
      if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
        return NextResponse.json(
          { 
            success: false,
            error: 'URL gambar tidak valid'
          },
          { status: 400 }
        )
      }
    }
    
    // Create produk dengan status PENDING
    const produk = await db.produk.create({
      data: {
        judul,
        deskripsi,
        harga: parseFloat(harga),
        stok: parseInt(stok),
        kategoriId,
        gambar: JSON.stringify(gambar),
        status: StatusProduk.PENDING,
        dariAdmin: false
      },
      include: {
        kategori: true
      }
    })
    
    // Create notification for admin
    await db.notifikasi.create({
      data: {
        judul: 'Pengajuan Produk Baru',
        pesan: `Ada pengajuan produk "${judul}" dari user untuk kategori ${kategori.nama}`,
        tipe: 'PRODUK_PENGGUNAJUAN_BARU',
        untukAdmin: true,
        produkId: produk.id
      }
    })
    
    // Invalidate cache
    invalidateCachePattern('/api/epasar/produk')
    
    console.log(`✅ Produk "${judul}" berhasil diajukan untuk review`)
    
    // Process gambar field for response
    const responseProduk = {
      ...produk,
      gambar: produk.gambar ? JSON.parse(produk.gambar) : []
    }
    
    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diajukan dan menunggu review admin',
      data: responseProduk
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error submitting produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengajukan produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
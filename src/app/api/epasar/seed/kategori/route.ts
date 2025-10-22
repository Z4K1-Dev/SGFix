/**
 * API Route untuk seeding kategori produk e-Pasar
 * Endpoint: POST /api/epasar/seed/kategori
 */

import { NextRequest, NextResponse } from 'next/server'
import { seedKategoriProduk } from '../kategori-produk/route'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Handle POST request untuk seeding kategori produk
 * @param request - NextRequest object
 * @returns Promise<NextResponse> - Response dengan hasil seeding
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Mulai seeding kategori produk e-Pasar')

    const kategori = await seedKategoriProduk()

    return NextResponse.json({
      success: true,
      message: 'Berhasil seeding kategori produk e-Pasar',
      data: {
        total: kategori.created.length,
        created: kategori.created.length,
        skipped: kategori.skipped.length,
        errors: kategori.errors.length,
        kategori: kategori.created.map(k => ({
          id: k.id,
          nama: k.nama,
          icon: k.icon
        }))
      }
    })

  } catch (error) {
    console.error('❌ API Error seeding kategori produk:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal seeding kategori produk',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
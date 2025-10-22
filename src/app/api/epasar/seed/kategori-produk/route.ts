import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const kategoriProdukData = [
  {
    nama: 'Sayuran',
    deskripsi: 'Berbagai macam sayuran segar',
    icon: '🥬'
  },
  {
    nama: 'Buah',
    deskripsi: 'Buah-buahan segar dan lokal',
    icon: '🍎'
  },
  {
    nama: 'Daging',
    deskripsi: 'Daging segar berkualitas',
    icon: '🥩'
  },
  {
    nama: 'Ikan',
    deskripsi: 'Ikan segar laut dan darat',
    icon: '🐟'
  },
  {
    nama: 'Telur',
    deskripsi: 'Telur ayam kampung dan bebek',
    icon: '🥚'
  },
  {
    nama: 'Bumbu Dapur',
    deskripsi: 'Bumbu masak dan rempah-rempah',
    icon: '🧄'
  },
  {
    nama: 'Minuman',
    deskripsi: 'Minuman segar dan tradisional',
    icon: '🥤'
  },
  {
    nama: 'Makanan',
    deskripsi: 'Makanan olahan dan kue',
    icon: '🍜'
  },
  {
    nama: 'Kue',
    deskripsi: 'Aneka kue basah dan kering',
    icon: '🍰'
  },
  {
    nama: 'Lainnya',
    deskripsi: 'Produk lainnya',
    icon: '📦'
  }
]

// Export fungsi seeding untuk digunakan di tempat lain
export async function seedKategoriProduk() {
  const results = {
    created: [] as Array<{ id: string; nama: string; icon: string | null }>,
    skipped: [] as Array<{ nama: string; reason: string }>,
    errors: [] as Array<{ nama: string; error: string }>
  }

  for (const kategori of kategoriProdukData) {
    try {
      // Cek apakah kategori sudah ada
      const existingKategori = await db.kategoriProduk.findFirst({
        where: {
          nama: kategori.nama
        }
      })

      if (existingKategori) {
        results.skipped.push({
          nama: kategori.nama,
          reason: 'Already exists'
        })
        continue
      }

      // Buat kategori baru
      const newKategori = await db.kategoriProduk.create({
        data: {
          nama: kategori.nama,
          deskripsi: kategori.deskripsi,
          icon: kategori.icon
        }
      })

      results.created.push({
        id: newKategori.id,
        nama: newKategori.nama,
        icon: newKategori.icon
      })

    } catch (error) {
      results.errors.push({
        nama: kategori.nama,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    const results = await seedKategoriProduk()

    return NextResponse.json({
      success: true,
      message: 'Seed kategori produk completed',
      data: results,
      summary: {
        total: kategoriProdukData.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      }
    })

  } catch (error) {
    console.error('Error seeding kategori produk:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const kategori = await db.kategoriProduk.findMany({
      orderBy: {
        nama: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: kategori,
      count: kategori.length
    })

  } catch (error) {
    console.error('Error fetching kategori produk:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
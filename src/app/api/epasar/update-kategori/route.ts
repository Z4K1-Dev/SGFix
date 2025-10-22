import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const kategoriUpdates = [
  {
    nama: 'Sembako',
    deskripsi: 'Kebutuhan pokok sehari-hari seperti beras, minyak, gula, dan terigu',
    icon: 'ShoppingCart'
  },
  {
    nama: 'Rumah Tangga',
    deskripsi: 'Peralatan dan kebutuhan untuk rumah tangga sehari-hari',
    icon: 'Home'
  },
  {
    nama: 'Properti',
    deskripsi: 'Tanah, rumah, dan properti lainnya di wilayah Pagesangan',
    icon: 'Building'
  },
  {
    nama: 'Peternakan',
    deskripsi: 'Hewan ternak, pakan, dan kebutuhan peternakan',
    icon: 'Cow'
  },
  {
    nama: 'Pertanian',
    deskripsi: 'Hasil pertanian, benih, pupuk, dan alat pertanian',
    icon: 'Wheat'
  },
  {
    nama: 'Makanan & Minuman',
    deskripsi: 'Makanan olahan, minuman, dan kuliner khas Pagesangan',
    icon: 'Utensils'
  },
  {
    nama: 'Keperluan Pribadi',
    deskripsi: 'Produk keperluan pribadi dan perawatan diri',
    icon: 'User'
  },
  {
    nama: 'Kendaraan',
    deskripsi: 'Kendaraan, suku cadang, dan jasa transportasi',
    icon: 'Car'
  },
  {
    nama: 'Hasil Laut',
    deskripsi: 'Ikan, seafood, dan hasil laut lainnya',
    icon: 'Fish'
  },
  {
    nama: 'Elektronik',
    deskripsi: 'Peralatan elektronik, gadget, dan aksesoris',
    icon: 'Smartphone'
  }
]

export async function POST(request: NextRequest) {
  try {
    const results = {
      updated: [] as Array<{ id: string; nama: string; deskripsi: string | null; icon: string | null }>,
      errors: [] as Array<{ nama: string; error: string }>
    }

    for (const kategori of kategoriUpdates) {
      try {
        // Cari kategori yang akan diupdate
        const existingKategori = await db.kategoriProduk.findFirst({
          where: {
            nama: kategori.nama
          }
        })

        if (!existingKategori) {
          results.errors.push({
            nama: kategori.nama,
            error: 'Kategori not found'
          })
          continue
        }

        // Update kategori
        const updatedKategori = await db.kategoriProduk.update({
          where: {
            id: existingKategori.id
          },
          data: {
            deskripsi: kategori.deskripsi,
            icon: kategori.icon
          }
        })

        results.updated.push({
          id: updatedKategori.id,
          nama: updatedKategori.nama,
          deskripsi: updatedKategori.deskripsi,
          icon: updatedKategori.icon
        })

      } catch (error) {
        results.errors.push({
          nama: kategori.nama,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Update kategori produk completed',
      data: results,
      summary: {
        total: kategoriUpdates.length,
        updated: results.updated.length,
        errors: results.errors.length
      }
    })

  } catch (error) {
    console.error('Error updating kategori produk:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
/**
 * File seed untuk kategori produk e-Pasar
 * Menyediakan 11 kategori tetap dengan icon Lucide
 */

import { db } from '@/lib/db'
import { KategoriProduk } from '@prisma/client'

/**
 * Daftar kategori produk tetap untuk e-Pasar
 */
const PRODUCT_CATEGORIES = [
  { 
    id: 'cmh14fdgn0000qz9k79we00w1', 
    nama: 'Elektronik', 
    deskripsi: 'Peralatan elektronik, gadget, dan aksesoris',
    icon: 'Settings' 
  },
  { 
    id: 'cmh16spta0008qzd3sioowz4y', 
    nama: 'Hasil Laut', 
    deskripsi: 'Ikan, seafood, dan hasil laut lainnya',
    icon: 'Package' 
  },
  { 
    id: 'cmh16spt10006qzd3uw4dkc6a', 
    nama: 'Keperluan Pribadi', 
    deskripsi: 'Produk keperluan pribadi dan perawatan diri',
    icon: 'Users' 
  },
  { 
    id: 'cmh182pd50000qzw4w327mwj7', 
    nama: 'Kerajinan', 
    deskripsi: 'Produk kerajinan tangan dan seni lokal',
    icon: 'Package' 
  },
  { 
    id: 'cmh16spsy0005qzd3iqm2bye1', 
    nama: 'Makanan & Minuman', 
    deskripsi: 'Makanan olahan, minuman, dan kuliner khas Pagesangan',
    icon: 'Package' 
  },
  { 
    id: 'cmh182pdb0001qzw4ycxqhk4f', 
    nama: 'Perkebunan', 
    deskripsi: 'Hasil perkebunan komoditas',
    icon: 'TreePine' 
  },
  { 
    id: 'cmh16spsv0004qzd304plbrzu', 
    nama: 'Pertanian', 
    deskripsi: 'Hasil pertanian, benih, pupuk, dan alat pertanian',
    icon: 'farm' 
  },
  { 
    id: 'cmh16spsr0003qzd3xzbuyqon', 
    nama: 'Peternakan', 
    deskripsi: 'Hewan ternak, pakan, dan kebutuhan peternakan',
    icon: 'cowHead' 
  },
  { 
    id: 'cmh16spso0002qzd36wwxxanp', 
    nama: 'Properti', 
    deskripsi: 'Tanah, rumah, dan properti lainnya di wilayah Pagesangan',
    icon: 'Home' 
  },
  { 
    id: 'cmh16spsl0001qzd3982k539z', 
    nama: 'Rumah Tangga', 
    deskripsi: 'Peralatan dan kebutuhan untuk rumah tangga sehari-hari',
    icon: 'Home' 
  },
  { 
    id: 'cmh16spsh0000qzd3dzrfrmhh', 
    nama: 'Sembako', 
    deskripsi: 'Kebutuhan pokok sehari-hari seperti beras, minyak, gula, dan terigu',
    icon: 'ShoppingCart' 
  },
  { 
    id: 'cmh16mt5q0000qz6zchkndq04', 
    nama: 'Umum', 
    deskripsi: 'Umum',
    icon: null 
  }
] as const

/**
 * Menyimpan kategori produk ke database
 * @returns Promise<KategoriProduk[]> - Daftar kategori yang sudah disimpan
 */
export async function seedKategoriProduk(): Promise<KategoriProduk[]> {
  try {
    console.log('🌱 Mulai seeding kategori produk e-Pasar...')

    const kategoriResults: KategoriProduk[] = []

    for (const kategori of PRODUCT_CATEGORIES) {
      // Cek apakah kategori sudah ada
      const existingKategori = await db.kategoriProduk.findUnique({
        where: { nama: kategori.nama }
      })

      if (!existingKategori) {
        // Buat kategori baru jika belum ada
        const newKategori = await db.kategoriProduk.create({
          data: {
            nama: kategori.nama,
            deskripsi: kategori.deskripsi,
            icon: kategori.icon
          }
        })
        
        kategoriResults.push(newKategori)
        console.log(`✅ Kategori "${kategori.nama}" berhasil dibuat`)
      } else {
        // Gunakan kategori yang sudah ada
        kategoriResults.push(existingKategori)
        console.log(`ℹ️  Kategori "${kategori.nama}" sudah ada`)
      }
    }

    console.log(`🎉 Selesai seeding ${kategoriResults.length} kategori produk e-Pasar`)
    return kategoriResults

  } catch (error) {
    console.error('❌ Error seeding kategori produk:', error)
    throw error
  }
}

/**
 * Mendapatkan daftar kategori produk (dari cache atau database)
 * @returns Promise<KategoriProduk[]> - Daftar kategori produk
 */
export async function getKategoriProduk(): Promise<KategoriProduk[]> {
  try {
    const kategori = await db.kategoriProduk.findMany({
      orderBy: { nama: 'asc' }
    })
    
    return kategori
  } catch (error) {
    console.error('❌ Error mendapatkan kategori produk:', error)
    throw error
  }
}

/**
 * Mendapatkan kategori produk berdasarkan ID
 * @param id - ID kategori produk
 * @returns Promise<KategoriProduk | null> - Data kategori produk
 */
export async function getKategoriProdukById(id: string): Promise<KategoriProduk | null> {
  try {
    const kategori = await db.kategoriProduk.findUnique({
      where: { id }
    })
    
    return kategori
  } catch (error) {
    console.error('❌ Error mendapatkan kategori produk by ID:', error)
    throw error
  }
}

/**
 * Export constant untuk digunakan di frontend
 */
export { PRODUCT_CATEGORIES }

/**
 * Type untuk kategori produk frontend
 */
export type KategoriProdukFrontend = {
  id: string
  nama: string
  deskripsi: string
  icon: string
}
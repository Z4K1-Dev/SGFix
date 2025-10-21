import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function resetBerita() {
  try {
    // Hapus semua berita
    const deletedCount = await db.berita.deleteMany({})
    console.log(`Berhasil menghapus ${deletedCount.count} berita`)

    // Hapus juga kategori agar bisa dibuat ulang
    const deletedKategori = await db.kategori.deleteMany({})
    console.log(`Berhasil menghapus ${deletedKategori.count} kategori`)
    
    // Impor dan panggil fungsi seedData
    const { seedData } = await import('./src/lib/seed')
    await seedData()
    
  } catch (error) {
    console.error('Error saat mereset berita:', error)
  } finally {
    await db.$disconnect()
  }
}

resetBerita()
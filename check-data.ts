import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function checkData() {
  try {
    // Hitung jumlah kategori
    const kategoriCount = await db.kategori.count()
    console.log(`Jumlah kategori: ${kategoriCount}`)
    
    // Ambil semua kategori
    const kategoriList = await db.kategori.findMany()
    console.log('Daftar kategori:')
    kategoriList.forEach(k => {
      console.log(`- ${k.nama}: ${k.deskripsi}`)
    })
    
    // Hitung jumlah berita
    const beritaCount = await db.berita.count()
    console.log(`\nJumlah berita: ${beritaCount}`)
    
    // Ambil semua berita
    const beritaList = await db.berita.findMany({
      include: {
        kategori: true
      }
    })
    console.log('Daftar berita:')
    beritaList.forEach(b => {
      console.log(`- ${b.judul} (Kategori: ${b.kategori.nama})`)
    })
    
    // Cek berita yang terkait dengan kategori baru
    console.log('\nBerita berdasarkan kategori:')
    for (const k of kategoriList) {
      const beritaByKategori = await db.berita.count({
        where: { kategoriId: k.id }
      })
      console.log(`- ${k.nama}: ${beritaByKategori} berita`)
    }
  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await db.$disconnect()
  }
}

// Jalankan fungsi
checkData()
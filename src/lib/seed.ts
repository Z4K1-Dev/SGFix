import { db } from '@/lib/db'

/**
 * Seed data default untuk aplikasi
 */
export async function seedData() {
  try {
    // Cek apakah sudah ada data kategori
    const existingKategori = await db.kategori.findFirst()
    if (existingKategori) {
      console.log('Data already seeded')
      return
    }

    // Buat kategori default
    const kategoriBerita = await db.kategori.create({
      data: {
        nama: 'Berita Umum',
        deskripsi: 'Berita-berita umum dan informasi penting'
      }
    })

    const kategoriPengumuman = await db.kategori.create({
      data: {
        nama: 'Pengumuman',
        deskripsi: 'Pengumuman resmi dari pemerintah'
      }
    })

    const kategoriLayanan = await db.kategori.create({
      data: {
        nama: 'Layanan Publik',
        deskripsi: 'Informasi seputar layanan publik'
      }
    })

    // Buat berita sample
    await db.berita.create({
      data: {
        judul: 'Selamat Datang di Portal Informasi & Pelaporan',
        isi: 'Portal ini merupakan sarana untuk menyampaikan informasi dan menerima laporan dari masyarakat. Melalui portal ini, Anda dapat mengakses berita terkini, pengumuman penting, serta menyampaikan laporan terkait berbagai masalah di lingkungan Anda.',
        kategoriId: kategoriPengumuman.id,
        published: true
      }
    })

    await db.berita.create({
      data: {
        judul: 'Cara Menggunakan Sistem Pelaporan',
        isi: '1. Klik tab "Buat Laporan" \n2. Isi judul dan keterangan laporan dengan jelas \n3. Tambahkan foto jika diperlukan \n4. Masukkan koordinat lokasi (opsional) \n5. Klik "Kirim Laporan" \n\nTim kami akan segera memproses laporan Anda dan memberikan update status secara berkala.',
        kategoriId: kategoriLayanan.id,
        published: true
      }
    })

    console.log('Data seeded successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}
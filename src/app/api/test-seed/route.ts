import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * API endpoint untuk mengetes data seed
 */
export async function GET() {
  try {
    // Ambil jumlah data untuk masing-masing tabel
    const totalKategori = await db.kategori.count()
    const totalBerita = await db.berita.count()
    const totalPengaduan = await db.pengaduan.count()
    const totalLayanan = await db.layanan.count()
    const totalNotifikasi = await db.notifikasi.count()
    
    // Ambil semua kategori
    const kategori = await db.kategori.findMany({
      orderBy: { nama: 'asc' }
    })
    
    // Ambil semua berita
    const berita = await db.berita.findMany({
      include: { kategori: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      status: 'success',
      data: {
        totalKategori,
        totalBerita,
        totalPengaduan,
        totalLayanan,
        totalNotifikasi,
        kategori,
        beritaCount: berita.length,
        sampleBerita: berita.slice(0, 5) // Ambil 5 berita pertama sebagai sampel
      }
    })
  } catch (error) {
    console.error('Error testing seed data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data seed' },
      { status: 500 }
    )
  }
}
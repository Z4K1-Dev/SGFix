import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * API endpoint untuk menambahkan dummy berita
 */
export async function POST(request: NextRequest) {
  try {
    // Cek dan buat kategori jika belum ada
    const kategoriData = [
      { nama: "Teknologi", deskripsi: "Berita seputar teknologi dan digitalisasi" },
      { nama: "Ekonomi", deskripsi: "Berita seputar ekonomi dan bisnis" },
      { nama: "Budaya", deskripsi: "Berita seputar budaya dan seni" },
      { nama: "Infrastruktur", deskripsi: "Berita seputar infrastruktur dan pembangunan" },
      { nama: "Pendidikan", deskripsi: "Berita seputar pendidikan dan beasiswa" }
    ]

    // Buat mapping dari nama kategori ke ID
    const kategoriMap = new Map()
    
    // Periksa kategori yang sudah ada
    const existingKategori = await db.kategori.findMany({
      where: {
        nama: { in: kategoriData.map(k => k.nama) }
      }
    })
    
    // Isi mapping dengan kategori yang sudah ada
    existingKategori.forEach(k => {
      kategoriMap.set(k.nama, k.id)
    })
    
    // Buat kategori yang belum ada
    for (const kategori of kategoriData) {
      if (!kategoriMap.has(kategori.nama)) {
        const createdKategori = await db.kategori.create({
          data: {
            nama: kategori.nama,
            deskripsi: kategori.deskripsi
          }
        })
        kategoriMap.set(kategori.nama, createdKategori.id)
      }
    }

    // Dummy berita data
    const dummyBerita = [
      {
        judul: "Pemerintah Luncurkan Program Digitalisasi Desa",
        isi: "Pemerintah resmi meluncurkan program digitalisasi desa yang bertujuan untuk meningkatkan akses teknologi di pedesaan. Program ini mencakup penyediaan internet cepat, pelatihan digital, dan infrastruktur teknologi informasi. Diharapkan dengan program ini, masyarakat desa dapat lebih produktif dan terhubung dengan ekonomi digital.",
        gambar: "https://picsum.photos/seed/berita1/800/400.jpg",
        kategoriId: kategoriMap.get("Teknologi"),
        published: true,
        author: "Admin",
        views: 1250,
        likes: 87,
        comments: 23
      },
      {
        judul: "Workshop Kewirausahaan untuk UMKM Lokal",
        isi: "Dinas Koperasi dan UMKM mengadakan workshop kewirausahaan untuk membantu pengusaha lokal mengembangkan bisnis mereka. Workshop ini mencakup topik seperti strategi pemasaran digital, manajemen keuangan, dan akses permodalan. Lebih dari 10 peserta hadir dalam workshop yang berlangsung selama dua hari ini.",
        gambar: null, // Tanpa foto
        kategoriId: kategoriMap.get("Ekonomi"),
        published: true,
        author: "Admin",
        views: 890,
        likes: 65,
        comments: 15
      },
      {
        judul: "Festival Budaya tahunan akan digelar bulan depan",
        isi: "Festival Budaya tahunan akan kembali digelar bulan depan dengan menampilkan berbagai pertunjukan seni tradisional dari seluruh negeri. Festival ini bertujuan untuk melestarikan budaya lokal dan meningkatkan pariwisata daerah. Berbagai artis lokal dan nasional akan tampil dalam acara yang berlangsung selama seminggu ini.",
        gambar: "https://picsum.photos/seed/berita3/800/400.jpg",
        kategoriId: kategoriMap.get("Budaya"),
        published: true,
        author: "Admin",
        views: 2100,
        likes: 156,
        comments: 42
      },
      {
        judul: "Peningkatan Infrastruktur Jalan Protokol",
        isi: "Pemerintah daerah mengumumkan rencana peningkatan infrastruktur jalan protokol untuk meningkatkan estetika kota dan kenyamanan pengendara. Proyek ini mencakup perbaikan jalan, penambahan jalur hijau, dan pemasangan lampu hias yang lebih hemat energi. Diharapkan proyek ini selesai dalam waktu 6 bulan.",
        gambar: "https://picsum.photos/seed/berita4/800/400.jpg",
        kategoriId: kategoriMap.get("Infrastruktur"),
        published: true,
        author: "Admin",
        views: 1670,
        likes: 98,
        comments: 31
      },
      {
        judul: "Program Beasiswa untuk Pelajar Berprestasi",
        isi: "Pemerintah menyediakan program beasiswa baru untuk pelajar berprestasi yang kurang mampu. Program ini mencakup biaya pendidikan penuh hingga jenjang universitas, serta tunjangan hidup bulanan. Beasiswa ini diharapkan dapat membantu mengurangi angka putus sekolah dan meningkatkan kualitas sumber daya manusia di daerah.",
        gambar: null, // Tanpa foto
        kategoriId: kategoriMap.get("Pendidikan"),
        published: true,
        author: "Admin",
        views: 3200,
        likes: 234,
        comments: 67
      }
    ]

    // Insert dummy berita ke database
    const createdBerita: any[] = []
    for (const berita of dummyBerita) {
      const created = await db.berita.create({
        data: berita
      })
      createdBerita.push(created)
    }

    return NextResponse.json({
      message: "Berhasil menambahkan 5 dummy berita",
      data: createdBerita
    })
  } catch (error) {
    console.error('Error seeding berita:', error)
    return NextResponse.json(
      { error: 'Gagal menambahkan dummy berita' },
      { status: 500 }
    )
  }
}

/**
* GET endpoint untuk melihat status dummy berita
 */
export async function GET() {
  try {
    const totalBerita = await db.berita.count()
    const beritaWithGambar = await db.berita.count({
      where: {
        gambar: {
          not: null
        }
      }
    })
    const beritaWithoutGambar = totalBerita - beritaWithGambar

    return NextResponse.json({
      totalBerita,
      beritaWithGambar,
      beritaWithoutGambar,
      message: "Status dummy berita"
    })
  } catch (error) {
    console.error('Error getting berita status:', error)
    return NextResponse.json(
      { error: 'Gagal mendapatkan status berita' },
      { status: 500 }
    )
  }
}
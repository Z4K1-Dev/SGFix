import { db } from '@/lib/db'
import { JenisLayanan, Status, StatusLayanan } from '@prisma/client'

/**
 * Seed data default untuk aplikasi
 */
export async function seedData() {
  try {
    // Cek apakah sudah ada data kategori
    const existingKategori = await db.kategori.findFirst()
    let kategoriBerita, kategoriPengumuman, kategoriLayanan, kategoriKemajuanDesa, kategoriPedesaan
    
    if (!existingKategori) {

    // Buat kategori default
    kategoriBerita = await db.kategori.create({
      data: {
        nama: 'Berita Umum',
        deskripsi: 'Berita-berita umum dan informasi penting'
      }
    })

    kategoriPengumuman = await db.kategori.create({
      data: {
        nama: 'Pengumuman',
        deskripsi: 'Pengumuman resmi dari pemerintah'
      }
    })

    kategoriLayanan = await db.kategori.create({
      data: {
        nama: 'Layanan Publik',
        deskripsi: 'Informasi seputar layanan publik'
      }
    })

    kategoriKemajuanDesa = await db.kategori.create({
      data: {
        nama: 'Kemajuan Desa Lombok',
        deskripsi: 'Berita seputar kemajuan dan pembangunan desa di pulau Lombok'
      }
    })

    kategoriPedesaan = await db.kategori.create({
      data: {
        nama: 'Pedesaan NTB',
        deskripsi: 'Berita seputar pembangunan dan kehidupan pedesaan di Nusa Tenggara Barat'
      }
    })

    console.log('Kategori data seeded successfully')
    } else {
      // Ambil kategori yang sudah ada
      kategoriBerita = await db.kategori.findUnique({ where: { nama: 'Berita Umum' } })
      kategoriPengumuman = await db.kategori.findUnique({ where: { nama: 'Pengumuman' } })
      kategoriLayanan = await db.kategori.findUnique({ where: { nama: 'Layanan Publik' } })
      kategoriKemajuanDesa = await db.kategori.findUnique({ where: { nama: 'Kemajuan Desa Lombok' } })
      kategoriPedesaan = await db.kategori.findUnique({ where: { nama: 'Pedesaan NTB' } })
      
      // Buat kategori jika belum ada
      if (!kategoriKemajuanDesa) {
        kategoriKemajuanDesa = await db.kategori.create({
          data: {
            nama: 'Kemajuan Desa Lombok',
            deskripsi: 'Berita seputar kemajuan dan pembangunan desa di pulau Lombok'
          }
        })
      }
      
      if (!kategoriPedesaan) {
        kategoriPedesaan = await db.kategori.create({
          data: {
            nama: 'Pedesaan NTB',
            deskripsi: 'Berita seputar pembangunan dan kehidupan pedesaan di Nusa Tenggara Barat'
          }
        })
      }
      
      console.log('Kategori data already exists')
    }

    // Cek apakah sudah ada data berita
    const existingBerita = await db.berita.findFirst()
    if (!existingBerita) {
      // Buat berita sample
      await db.berita.create({
        data: {
          judul: 'Selamat Datang di Portal Informasi & Pengaduan',
          isi: 'Portal ini merupakan sarana untuk menyampaikan informasi dan menerima pengaduan dari masyarakat. Melalui portal ini, Anda dapat mengakses berita terkini, pengumuman penting, serta menyampaikan pengaduan terkait berbagai masalah di lingkungan Anda.',
          kategoriId: kategoriPengumuman.id,
          published: true
        }
      })

      await db.berita.create({
        data: {
          judul: 'Cara Menggunakan Sistem Pengaduan',
          isi: '1. Klik tab "Buat Pengaduan" \n2. Isi judul dan keterangan pengaduan dengan jelas \n3. Tambahkan foto jika diperlukan \n4. Masukkan koordinat lokasi (opsional) \n5. Klik "Kirim Pengaduan" \n\nTim kami akan segera memproses pengaduan Anda dan memberikan update status secara berkala.',
          kategoriId: kategoriLayanan.id,
          published: true
        }
      })

      console.log('Berita data seeded successfully')
    } else {
      console.log('Berita data already exists')
    }

    // Tambahkan berita kemajuan desa Lombok (selalu cek dan tambah jika belum ada)
    const existingBeritaLombok = await db.berita.findFirst({
      where: { judul: 'Desa Wisata Digital Lombok Barat Jadi Teladan Kemajuan Teknologi' }
    })
    
    if (!existingBeritaLombok && kategoriKemajuanDesa) {
      // Berita tentang Kemajuan Desa Lombok
      await db.berita.create({
        data: {
          judul: 'Desa Wisata Digital Lombok Barat Jadi Teladan Kemajuan Teknologi',
          isi: 'Desa Senggigi di Lombok Barat berhasil bertransformasi menjadi desa wisata digital pertama di NTB. Dengan dukungan pemerintah pusat, desa ini kini dilengkapi dengan WiFi publik gratis, pusat belajar digital untuk anak-anak, dan aplikasi manajemen desa berbasis mobile. Para pelaku UMKM lokal juga dilatih untuk berjualan secara online, meningkatkan omzet hingga 200%. Wisatawan yang datang pun dapat menikmati kemudahan akses informasi dan pemesanan secara digital.',
          gambar: 'images/berita/pedesaan-lombok-sawah.webp',
          kategoriId: kategoriKemajuanDesa.id,
          published: true,
          author: 'Tim Teknologi Pedesaan',
          views: 456,
          likes: 32
        }
      })

      await db.berita.create({
        data: {
          judul: 'Energi Terbarukan Desa Lombok Tengah Listriki 500 Rumah',
          isi: 'Program pembangkit listrik tenaga surya di Desa Sukaraja, Lombok Tengah, berhasil memberikan listrik kepada 500 kepala keluarga. Program ini tidak hanya mengatasi masalah penerangan, tetapi juga membuka peluang ekonomi baru. Masyarakat kini dapat mengoperasikan mesin pertanian, kulkas untuk penyimpanan hasil panen, dan usaha kecil di malam hari. Kelebihan energi bahkan dapat dijual ke PLN, memberikan tambahan penghasilan bagi desa.',
          gambar: 'images/berita/energi-terbarukan-lombok.webp',
          kategoriId: kategoriKemajuanDesa.id,
          published: true,
          author: 'Tim Energi Pedesaan',
          views: 389,
          likes: 28
        }
      })

      await db.berita.create({
        data: {
          judul: 'Koperasi Wanita Lombok Timur Ekspor Tenun Ikat ke 5 Negara',
          isi: 'Koperasi "Sasak Weaving" di Desa Sembalun, Lombok Timur, berhasil menembus pasar internasional. Berawal dari 10 anggota, kini koperasi ini memiliki 150 anggota wanita yang memproduksi tenun ikat berkualitas ekspor. Produk mereka telah diekspor ke Jepang, Australia, Amerika Serikat, Prancis, dan Malaysia. Omzet koperasi mencapai Rp 2.5 miliar per tahun, memberikan kesejahteraan ekonomi bagi ratusan keluarga di desa.',
          gambar: 'images/berita/koperasi-wanita-lombok.webp',
          kategoriId: kategoriKemajuanDesa.id,
          published: true,
          author: 'Tim Ekonomi Kreatif',
          views: 523,
          likes: 41
        }
      })

      await db.berita.create({
        data: {
          judul: 'Sistem Irigasi Modern Tingkatkan Produksi Pertanian Organik Lombok Utara',
          isi: 'Desa Bayan di Lombok Utara berhasil menerapkan sistem irigasi modern dengan teknologi drip irrigation. Program ini menghemat penggunaan air hingga 60% dan meningkatkan produksi pertanian organik hingga 80%. Petani kini dapat menanam berbagai jenis sayuran organik yang memiliki nilai jual tinggi. Hasil panen langsung diserap oleh hotel-hotel bintang lima di Lombok dan Bali, menciptakan rantai pasok yang berkelanjutan.',
          gambar: 'images/berita/irigasi-modern-lombok.webp',
          kategoriId: kategoriKemajuanDesa.id,
          published: true,
          author: 'Tim Pertanian Pedesaan',
          views: 367,
          likes: 25
        }
      })

      console.log('Berita Kemajuan Desa Lombok seeded successfully')
    }

    // Cek apakah sudah ada data layanan
    const existingLayanan = await db.layanan.findFirst()
    if (!existingLayanan) {
      // Buat data layanan sample
      await db.layanan.createMany({
        data: [
          {
            judul: 'Pengajuan KTP Hilang',
            jenisLayanan: JenisLayanan.KTP_HILANG,
            status: StatusLayanan.DITERIMA,
            namaLengkap: 'Ahmad Rizki',
            nik: '3201011234560001',
            tempatLahir: 'Jakarta',
            tanggalLahir: new Date('1990-05-15'),
            jenisKelamin: 'LAKI_LAKI',
            alamat: 'Jl. Merdeka No. 123',
            rt: '01',
            rw: '02',
            kelurahan: 'Menteng',
            kecamatan: 'Menteng',
            kabupaten: 'Jakarta Pusat',
            provinsi: 'DKI Jakarta',
            kodePos: '10310',
            telepon: '08123456789',
            email: 'ahmad.rizki@example.com',
            formData: JSON.stringify({ keperluan: 'Penggantian KTP hilang' }),
            dokumen: JSON.stringify({ kk: 'kk.pdf', akta: 'akta.pdf' })
          },
          {
            judul: 'Pengajuan Akta Kelahiran',
            jenisLayanan: JenisLayanan.AKTA_KELAHIRAN,
            status: StatusLayanan.DIPROSES,
            namaLengkap: 'Siti Nurhaliza',
            nik: '3201011234560002',
            tempatLahir: 'Bandung',
            tanggalLahir: new Date('2024-01-10'),
            jenisKelamin: 'PEREMPUAN',
            alamat: 'Jl. Sudirman No. 456',
            rt: '03',
            rw: '04',
            kelurahan: 'Gambir',
            kecamatan: 'Gambir',
            kabupaten: 'Jakarta Pusat',
            provinsi: 'DKI Jakarta',
            kodePos: '10120',
            telepon: '08234567890',
            email: 'siti.nurhaliza@example.com',
            formData: JSON.stringify({ namaBayi: 'Muhammad Rizki', tempatLahir: 'Jakarta' }),
            dokumen: JSON.stringify({ suratKeterangan: 'surat.pdf' })
          },
          {
            judul: 'Pengajuan IMB',
            jenisLayanan: JenisLayanan.SURAT_KETERANGAN,
            status: StatusLayanan.DITOLAK,
            namaLengkap: 'Budi Santoso',
            nik: '3201011234560003',
            tempatLahir: 'Surabaya',
            tanggalLahir: new Date('1985-08-20'),
            jenisKelamin: 'LAKI_LAKI',
            alamat: 'Jl. Gatot Subroto No. 789',
            rt: '05',
            rw: '06',
            kelurahan: 'Tanah Abang',
            kecamatan: 'Tanah Abang',
            kabupaten: 'Jakarta Pusat',
            provinsi: 'DKI Jakarta',
            kodePos: '10260',
            telepon: '08345678901',
            email: 'budi.santoso@example.com',
            formData: JSON.stringify({ luasBangunan: '120', jenisBangunan: 'Rumah Tinggal' }),
            dokumen: JSON.stringify({ sertifikat: 'sertifikat.pdf', gambar: 'gambar.jpg' })
          },
          {
            judul: 'Pengajuan KK Baru',
            jenisLayanan: JenisLayanan.KK_BARU,
            status: StatusLayanan.DIVERIFIKASI,
            namaLengkap: 'Dewi Lestari',
            nik: '3201011234560004',
            tempatLahir: 'Yogyakarta',
            tanggalLahir: new Date('1992-12-05'),
            jenisKelamin: 'PEREMPUAN',
            alamat: 'Jl. Thamrin No. 321',
            rt: '07',
            rw: '08',
            kelurahan: 'Kemayoran',
            kecamatan: 'Kemayoran',
            kabupaten: 'Jakarta Pusat',
            provinsi: 'DKI Jakarta',
            kodePos: '10610',
            telepon: '08456789012',
            email: 'dewi.lestari@example.com',
            formData: JSON.stringify({ alasan: 'Pembuatan KK baru' }),
            dokumen: JSON.stringify({ ktp: 'ktp.pdf', akta: 'akta.pdf' })
          },
          {
            judul: 'Pengajuan Surat Pindah',
            jenisLayanan: JenisLayanan.SURAT_PINDAH,
            status: StatusLayanan.SELESAI,
            namaLengkap: 'Eko Prasetyo',
            nik: '3201011234560005',
            tempatLahir: 'Semarang',
            tanggalLahir: new Date('1988-03-25'),
            jenisKelamin: 'LAKI_LAKI',
            alamat: 'Jl. Rasuna Said No. 654',
            rt: '09',
            rw: '10',
            kelurahan: 'Setiabudi',
            kecamatan: 'Setiabudi',
            kabupaten: 'Jakarta Selatan',
            provinsi: 'DKI Jakarta',
            kodePos: '12920',
            telepon: '08567890123',
            email: 'eko.prasetyo@example.com',
            formData: JSON.stringify({ keperluan: 'Pindah domisili', alamatTujuan: 'Jl. Sudirman No. 123' }),
            dokumen: JSON.stringify({ ktp: 'ktp.pdf', kk: 'kk.pdf' })
          }
        ]
      })

      // Buat data balasan layanan sample
      const layananList = await db.layanan.findMany()
      
      for (const layanan of layananList) {
        if (layanan.id) {
          // Balasan dari admin
          await db.balasanLayanan.create({
            data: {
              layananId: layanan.id,
              isi: 'Terima kasih atas pengajuan Anda. Dokumen sedang kami verifikasi.',
              dariAdmin: true
            }
          })
          
          // Balasan dari user (jika status bukan DITERIMA)
          if (layanan.status !== StatusLayanan.DITERIMA) {
            await db.balasanLayanan.create({
              data: {
                layananId: layanan.id,
                isi: 'Baik, saya tunggu informasi selanjutnya. Terima kasih.',
                dariAdmin: false
              }
            })
          }
        }
      }

      console.log('Layanan data seeded successfully')
    } else {
      console.log('Layanan data already exists')
    }

    // Cek apakah sudah ada data pengaduan
    const existingPengaduan = await db.pengaduan.findFirst()
    if (!existingPengaduan) {
      // Buat data pengaduan sample
      await db.pengaduan.createMany({
        data: [
          {
            judul: 'Jalan Berlubang di Jl. Merdeka',
            keterangan: 'Ada beberapa jalan berlubang yang cukup berbahaya bagi pengendara, terutama pada malam hari. Lokasi tepatnya di depan kantor kelurahan Menteng.',
            foto: 'jalan-berlubang.webp',
            latitude: -6.1944,
            longitude: 106.8229,
            status: Status.BARU
          },
          {
            judul: 'Sampah Menumpuk di Taman Kota',
            keterangan: 'Sampah sudah menumpuk selama 3 hari dan belum ada yang mengangkut. Ini menyebabkan bau tidak sedap dan potensi penyakit.',
            foto: 'sampah-menumpuk.webp',
            latitude: -6.2088,
            longitude: 106.8456,
            status: Status.DITAMPUNG
          },
          {
            judul: 'Lampu Jalan Mati',
            keterangan: 'Lampu jalan di sepanjang Jl. Sudirman mati sudah seminggu. Ini membahayakan pengendara pada malam hari.',
            foto: 'lampu-jalan-mati.webp',
            latitude: -6.2297,
            longitude: 106.8295,
            status: Status.DITERUSKAN
          },
          {
            judul: 'Pohon Tumbang',
            keterangan: 'Sebuah pohon besar tumbang menutupi jalan akibat hujan deras kemarin. Butuh penanganan segera.',
            foto: 'pohon-tumbang.webp',
            latitude: -6.1751,
            longitude: 106.8650,
            status: Status.DIKERJAKAN
          },
          {
            judul: 'Saluran Air Mampet',
            keterangan: 'Saluran air di kompleks perumahan mampet menyebabkan banjir kecil saat hujan. Sudah dilaporkan sebulan lalu tapi belum ada tindakan.',
            foto: 'saluran-mampet.webp',
            latitude: -6.2382,
            longitude: 106.8036,
            status: Status.SELESAI
          }
        ]
      })

      // Buat data balasan pengaduan sample
      const pengaduanList = await db.pengaduan.findMany()
      
      for (const pengaduan of pengaduanList) {
        if (pengaduan.id) {
          // Balasan dari admin
          await db.balasan.create({
            data: {
              pengaduanId: pengaduan.id,
              isi: 'Terima kasih atas pengaduannya. Kami akan segera menindaklanjuti.',
              dariAdmin: true
            }
          })
          
          // Balasan dari user (jika status bukan BARU)
          if (pengaduan.status !== Status.BARU) {
            await db.balasan.create({
              data: {
                pengaduanId: pengaduan.id,
                isi: 'Baik, saya tunggu informasi selanjutnya. Terima kasih.',
                dariAdmin: false
              }
            })
          }
        }
      }

      console.log('Pengaduan data seeded successfully')
    } else {
      console.log('Pengaduan data already exists')
    }

    // Cek apakah sudah ada data notifikasi
    const existingNotifikasi = await db.notifikasi.findFirst()
    if (!existingNotifikasi) {
      // Buat data notifikasi sample
      await db.notifikasi.createMany({
        data: [
          {
            judul: 'Pengaduan Baru',
            pesan: 'Ada pengaduan baru tentang jalan berlubang di Jl. Merdeka yang perlu ditindaklanjuti.',
            tipe: 'PENGADUAN_BARU',
            untukAdmin: true,
            dibaca: false
          },
          {
            judul: 'Pengajuan Layanan',
            pesan: 'Pengguna baru mengajukan layanan pembuatan KTP hilang.',
            tipe: 'LAYANAN_BARU',
            untukAdmin: true,
            dibaca: false
          },
          {
            judul: 'Sistem Maintenance',
            pesan: 'Sistem akan melakukan maintenance pada hari Sabtu pukul 23:00 - 01:00 WIB.',
            tipe: 'PENGADUAN_UPDATE',
            untukAdmin: true,
            dibaca: true
          },
          {
            judul: 'Pengaduan Selesai',
            pesan: 'Pengaduan tentang lampu jalan mati sudah selesai ditangani.',
            tipe: 'PENGADUAN_UPDATE',
            untukAdmin: false,
            dibaca: false
          },
          {
            judul: 'Status Layanan Diubah',
            pesan: 'Status pengajuan layanan Anda telah berubah menjadi "Diproses".',
            tipe: 'LAYANAN_UPDATE',
            untukAdmin: false,
            dibaca: false
          }
        ]
      })

      console.log('Notifikasi data seeded successfully')
    } else {
      console.log('Notifikasi data already exists')
    }

    // Cek apakah sudah ada data kategori produk
    const existingKategoriProduk = await db.kategoriProduk.findFirst()
    if (!existingKategoriProduk) {
      // Buat data kategori produk dari database
      await db.kategoriProduk.createMany({
        data: [
          {
            nama: 'Elektronik',
            deskripsi: 'Elektronik dan gadget',
            icon: 'Smartphone'
          },
          {
            nama: 'Hasil Laut',
            deskripsi: 'Ikan dan hasil laut lainnya',
            icon: 'Fish'
          },
          {
            nama: 'Kendaraan',
            deskripsi: 'Kendaraan dan sparepart',
            icon: 'Car'
          },
          {
            nama: 'Keperluan Pribadi',
            deskripsi: 'Produk keperluan pribadi dan fashion',
            icon: 'User'
          },
          {
            nama: 'Kerajinan',
            deskripsi: 'Produk kerajinan tangan dan seni lokal',
            icon: 'Palette'
          },
          {
            nama: 'Makanan & Minuman',
            deskripsi: 'Produk makanan dan minuman olahan',
            icon: 'Utensils'
          },
          {
            nama: 'Perkebunan',
            deskripsi: 'Hasil perkebunan komoditas',
            icon: 'TreePine'
          },
          {
            nama: 'Pertanian',
            deskripsi: 'Hasil pertanian dan perkebunan',
            icon: 'Wheat'
          },
          {
            nama: 'Peternakan',
            deskripsi: 'Hewan ternak dan produk peternakan',
            icon: 'cow-head'
          },
          {
            nama: 'Properti',
            deskripsi: 'Tanah, rumah, dan properti lainnya',
            icon: 'Home'
          },
          {
            nama: 'Sembako',
            deskripsi: 'Kebutuhan pokok sehari-hari seperti beras, minyak, gula, dll',
            icon: 'ShoppingBasket'
          }
        ]
      })

      console.log('Kategori Produk data seeded successfully')
    } else {
      console.log('Kategori Produk data already exists')
    }

    console.log('Data seeding completed')
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}
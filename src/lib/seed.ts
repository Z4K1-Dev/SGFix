import { db } from '@/lib/db'
import { JenisLayanan, StatusLayanan, Status } from '@prisma/client'

/**
 * Seed data default untuk aplikasi
 */
export async function seedData() {
  try {
    // Cek apakah sudah ada data kategori
    const existingKategori = await db.kategori.findFirst()
    if (!existingKategori) {

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

    console.log('Kategori data seeded successfully')
    } else {
      console.log('Kategori data already exists')
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
            status: StatusLayanan.BARU,
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
            status: StatusLayanan.DITAMPAH,
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
            status: StatusLayanan.DIKERJAKAN,
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
          
          // Balasan dari user (jika status bukan BARU)
          if (layanan.status !== StatusLayanan.BARU) {
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

    // Cek apakah sudah ada data laporan
    const existingLaporan = await db.laporan.findFirst()
    if (!existingLaporan) {
      // Buat data laporan sample
      await db.laporan.createMany({
        data: [
          {
            judul: 'Jalan Berlubang di Jl. Merdeka',
            keterangan: 'Ada beberapa jalan berlubang yang cukup berbahaya bagi pengendara, terutama pada malam hari. Lokasi tepatnya di depan kantor kelurahan Menteng.',
            foto: 'jalan-berlubang.jpg',
            latitude: -6.1944,
            longitude: 106.8229,
            status: Status.BARU
          },
          {
            judul: 'Sampah Menumpuk di Taman Kota',
            keterangan: 'Sampah sudah menumpuk selama 3 hari dan belum ada yang mengangkut. Ini menyebabkan bau tidak sedap dan potensi penyakit.',
            foto: 'sampah-menumpuk.jpg',
            latitude: -6.2088,
            longitude: 106.8456,
            status: Status.DITAMPUNG
          },
          {
            judul: 'Lampu Jalan Mati',
            keterangan: 'Lampu jalan di sepanjang Jl. Sudirman mati sudah seminggu. Ini membahayakan pengendara pada malam hari.',
            foto: 'lampu-jalan-mati.jpg',
            latitude: -6.2297,
            longitude: 106.8295,
            status: Status.DITERUSKAN
          },
          {
            judul: 'Pohon Tumbang',
            keterangan: 'Sebuah pohon besar tumbang menutupi jalan akibat hujan deras kemarin. Butuh penanganan segera.',
            foto: 'pohon-tumbang.jpg',
            latitude: -6.1751,
            longitude: 106.8650,
            status: Status.DIKERJAKAN
          },
          {
            judul: 'Saluran Air Mampet',
            keterangan: 'Saluran air di kompleks perumahan mampet menyebabkan banjir kecil saat hujan. Sudah dilaporkan sebulan lalu tapi belum ada tindakan.',
            foto: 'saluran-mampet.jpg',
            latitude: -6.2382,
            longitude: 106.8036,
            status: Status.SELESAI
          }
        ]
      })

      // Buat data balasan laporan sample
      const laporanList = await db.laporan.findMany()
      
      for (const laporan of laporanList) {
        if (laporan.id) {
          // Balasan dari admin
          await db.balasan.create({
            data: {
              laporanId: laporan.id,
              isi: 'Terima kasih atas laporannya. Kami akan segera menindaklanjuti.',
              dariAdmin: true
            }
          })
          
          // Balasan dari user (jika status bukan BARU)
          if (laporan.status !== Status.BARU) {
            await db.balasan.create({
              data: {
                laporanId: laporan.id,
                isi: 'Baik, saya tunggu informasi selanjutnya. Terima kasih.',
                dariAdmin: false
              }
            })
          }
        }
      }

      console.log('Laporan data seeded successfully')
    } else {
      console.log('Laporan data already exists')
    }

    // Cek apakah sudah ada data notifikasi
    const existingNotifikasi = await db.notifikasi.findFirst()
    if (!existingNotifikasi) {
      // Buat data notifikasi sample
      await db.notifikasi.createMany({
        data: [
          {
            judul: 'Laporan Baru',
            pesan: 'Ada laporan baru tentang jalan berlubang di Jl. Merdeka yang perlu ditindaklanjuti.',
            tipe: 'info',
            untukAdmin: true,
            dibaca: false
          },
          {
            judul: 'Pengajuan Layanan',
            pesan: 'Pengguna baru mengajukan layanan pembuatan KTP hilang.',
            tipe: 'info',
            untukAdmin: true,
            dibaca: false
          },
          {
            judul: 'Sistem Maintenance',
            pesan: 'Sistem akan melakukan maintenance pada hari Sabtu pukul 23:00 - 01:00 WIB.',
            tipe: 'warning',
            untukAdmin: true,
            dibaca: true
          },
          {
            judul: 'Laporan Selesai',
            pesan: 'Laporan tentang lampu jalan mati sudah selesai ditangani.',
            tipe: 'success',
            untukAdmin: false,
            dibaca: false
          },
          {
            judul: 'Status Layanan Diubah',
            pesan: 'Status pengajuan layanan Anda telah berubah menjadi "Diproses".',
            tipe: 'info',
            untukAdmin: false,
            dibaca: false
          }
        ]
      })

      console.log('Notifikasi data seeded successfully')
    } else {
      console.log('Notifikasi data already exists')
    }

    console.log('Data seeding completed')
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}
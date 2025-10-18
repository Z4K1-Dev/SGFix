-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Berita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "gambar" TEXT,
    "kategoriId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "author" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Berita_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pengaduan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "foto" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Balasan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengaduanId" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "dariAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Balasan_pengaduanId_fkey" FOREIGN KEY ("pengaduanId") REFERENCES "Pengaduan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "untukAdmin" BOOLEAN NOT NULL DEFAULT false,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beritaId" TEXT,
    "pengaduanId" TEXT,
    "layananId" TEXT,
    "balasanId" TEXT,
    CONSTRAINT "Notifikasi_balasanId_fkey" FOREIGN KEY ("balasanId") REFERENCES "Balasan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notifikasi_pengaduanId_fkey" FOREIGN KEY ("pengaduanId") REFERENCES "Pengaduan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notifikasi_beritaId_fkey" FOREIGN KEY ("beritaId") REFERENCES "Berita" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notifikasi_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Layanan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "jenisLayanan" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "rt" TEXT,
    "rw" TEXT,
    "kelurahan" TEXT,
    "kecamatan" TEXT,
    "kabupaten" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DITERIMA',
    "dokumen" TEXT,
    "formData" TEXT,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BalasanLayanan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "layananId" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "dariAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BalasanLayanan_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_nama_key" ON "Kategori"("nama");

-- CreateIndex
CREATE INDEX "Kategori_nama_idx" ON "Kategori"("nama");

-- CreateIndex
CREATE INDEX "Kategori_createdAt_idx" ON "Kategori"("createdAt");

-- CreateIndex
CREATE INDEX "Berita_published_idx" ON "Berita"("published");

-- CreateIndex
CREATE INDEX "Berita_kategoriId_idx" ON "Berita"("kategoriId");

-- CreateIndex
CREATE INDEX "Berita_createdAt_idx" ON "Berita"("createdAt");

-- CreateIndex
CREATE INDEX "Berita_published_createdAt_idx" ON "Berita"("published", "createdAt");

-- CreateIndex
CREATE INDEX "Berita_kategoriId_published_idx" ON "Berita"("kategoriId", "published");

-- CreateIndex
CREATE INDEX "Berita_views_idx" ON "Berita"("views");

-- CreateIndex
CREATE INDEX "Berita_likes_idx" ON "Berita"("likes");

-- CreateIndex
CREATE INDEX "Pengaduan_status_idx" ON "Pengaduan"("status");

-- CreateIndex
CREATE INDEX "Pengaduan_createdAt_idx" ON "Pengaduan"("createdAt");

-- CreateIndex
CREATE INDEX "Pengaduan_status_createdAt_idx" ON "Pengaduan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Pengaduan_latitude_longitude_idx" ON "Pengaduan"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Balasan_pengaduanId_idx" ON "Balasan"("pengaduanId");

-- CreateIndex
CREATE INDEX "Balasan_createdAt_idx" ON "Balasan"("createdAt");

-- CreateIndex
CREATE INDEX "Balasan_dariAdmin_idx" ON "Balasan"("dariAdmin");

-- CreateIndex
CREATE INDEX "Balasan_pengaduanId_createdAt_idx" ON "Balasan"("pengaduanId", "createdAt");

-- CreateIndex
CREATE INDEX "Notifikasi_untukAdmin_idx" ON "Notifikasi"("untukAdmin");

-- CreateIndex
CREATE INDEX "Notifikasi_dibaca_idx" ON "Notifikasi"("dibaca");

-- CreateIndex
CREATE INDEX "Notifikasi_tipe_idx" ON "Notifikasi"("tipe");

-- CreateIndex
CREATE INDEX "Notifikasi_createdAt_idx" ON "Notifikasi"("createdAt");

-- CreateIndex
CREATE INDEX "Notifikasi_untukAdmin_dibaca_idx" ON "Notifikasi"("untukAdmin", "dibaca");

-- CreateIndex
CREATE INDEX "Notifikasi_beritaId_idx" ON "Notifikasi"("beritaId");

-- CreateIndex
CREATE INDEX "Notifikasi_pengaduanId_idx" ON "Notifikasi"("pengaduanId");

-- CreateIndex
CREATE INDEX "Notifikasi_layananId_idx" ON "Notifikasi"("layananId");

-- CreateIndex
CREATE INDEX "Notifikasi_balasanId_idx" ON "Notifikasi"("balasanId");

-- CreateIndex
CREATE INDEX "Layanan_jenisLayanan_idx" ON "Layanan"("jenisLayanan");

-- CreateIndex
CREATE INDEX "Layanan_status_idx" ON "Layanan"("status");

-- CreateIndex
CREATE INDEX "Layanan_createdAt_idx" ON "Layanan"("createdAt");

-- CreateIndex
CREATE INDEX "Layanan_status_createdAt_idx" ON "Layanan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Layanan_nik_idx" ON "Layanan"("nik");

-- CreateIndex
CREATE INDEX "BalasanLayanan_layananId_idx" ON "BalasanLayanan"("layananId");

-- CreateIndex
CREATE INDEX "BalasanLayanan_createdAt_idx" ON "BalasanLayanan"("createdAt");

-- CreateIndex
CREATE INDEX "BalasanLayanan_dariAdmin_idx" ON "BalasanLayanan"("dariAdmin");

-- CreateIndex
CREATE INDEX "BalasanLayanan_layananId_createdAt_idx" ON "BalasanLayanan"("layananId", "createdAt");

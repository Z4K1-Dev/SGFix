# Dokumentasi Arsitektur dan Sistem SGFix

## Gambaran Umum

SGFix (SmartGov Fix) adalah platform pemerintahan digital yang menyediakan layanan pengajuan layanan publik, pepengaduan masyarakat, dan sistem informasi berita. Aplikasi ini dibangun menggunakan teknologi modern seperti Next.js 15, TypeScript, dan Socket.IO untuk komunikasi real-time.

## Arsitektur Sistem

### 1. Teknologi yang Digunakan

- **Frontend**: Next.js 15 (App Router), React 19
- **Backend**: Next.js API Routes, Socket.IO
- **Database**: SQLite (Prisma ORM)
- **UI Components**: shadcn/ui
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS, Tailwind CSS Animate
- **State Management**: React Hooks, Zustand
- **Form Handling**: React Hook Form, Zod
- **Testing**: Vitest

### 2. Struktur Proyek

```
SGFix/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── admin/          # Admin API routes
│   │   │   ├── berita/         # Berita API routes
│   │   │   ├── pengaduan/        # Pengaduan API routes
│   │   │   └── layanan/        # Layanan API routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── layanan/            # Layanan pages
│   │   └── pengaduan/            # Pengaduan pages
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   ├── layanan/            # Layanan-specific components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── virtualized/        # Performance components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   └── utils/                  # Utility functions
├── prisma/                     # Database schema
├── public/                     # Static assets
├── DOCS/                       # Documentation
└── server.ts                   # Custom server with Socket.IO
```

### 3. Komponen Utama

#### A. Sistem Layanan (Layanan)
- **Multi-step Form**: Formulir pengajuan layanan dengan beberapa tahapan
- **Status Tracker**: Pelacakan status pengajuan layanan
- **Komunikasi Real-time**: Sistem balasan antara pengguna dan admin
- **Jenis Layanan**: KTP, Akta, KK, Surat, dan lainnya

#### B. Sistem Pengaduan (Pengaduan)
- **Pengajuan Pengaduan**: Formulir pepengaduan dengan foto
- **Status Pengaduan**: Pelacakan status pengaduan masyarakat
- **Geolokasi**: Dukungan pepengaduan berbasis lokasi

#### C. Sistem Berita (Berita)
- **Manajemen Berita**: Pembuatan dan pengelolaan berita
- **Kategori Berita**: Pengelompokan berita berdasarkan kategori
- **Statistik**: Pelacakan views, likes, dan komentar

#### D. Sistem Real-time (Socket.IO)
- **Notifikasi Real-time**: Pengiriman notifikasi langsung
- **Update Status**: Update status layanan dan pengaduan secara real-time
- **Chat Balasan**: Sistem komunikasi antara pengguna dan admin

## Desain Database

### Model Utama

#### 1. Layanan
- **Deskripsi**: Menyimpan data pengajuan layanan publik
- **Relasi**: Banyak ke BalasanLayanan, Notifikasi
- **Field Utama**: 
  - `judul` (string): Judul pengajuan layanan
 - `jenisLayanan` (enum): Jenis layanan yang diajukan
  - `status` (enum): Status pengajuan (DITERIMA, DIPROSES, DIVERIFIKASI, SELESAI, DITOLAK)
  - `formData` (string): Data formulir dalam format JSON
  - `dokumen` (string): Dokumen dalam format JSON

#### 2. BalasanLayanan
- **Deskripsi**: Menyimpan komunikasi antara pengguna dan admin
- **Relasi**: Satu ke Layanan
- **Field Utama**:
 - `isi` (string): Isi balasan
 - `dariAdmin` (boolean): Indikator apakah balasan dari admin

#### 3. Pengaduan
- **Deskripsi**: Menyimpan pengaduan dari masyarakat
- **Relasi**: Banyak ke Balasan, Notifikasi
- **Field Utama**:
  - `judul` (string): Judul pengaduan
 - `keterangan` (string): Detail pengaduan
  - `foto` (string): URL foto pengaduan
  - `status` (enum): Status pengaduan (BARU, DITAMPUNG, DITERUSKAN, DIKERJAKAN, SELESAI)

#### 4. Berita
- **Deskripsi**: Menyimpan informasi berita
- **Relasi**: Satu ke Kategori, Banyak ke Notifikasi
- **Field Utama**:
 - `judul` (string): Judul berita
 - `isi` (string): Isi berita
  - `gambar` (string): URL gambar berita
  - `published` (boolean): Status publikasi

## Arsitektur Frontend

### 1. Struktur Komponen
- **UI Components**: Komponen dasar dari shadcn/ui
- **Layout Components**: Komponen struktur halaman
- **Feature Components**: Komponen spesifik fitur (layanan, pengaduan, berita)
- **Hook Components**: Logika bisnis dan data fetching

### 2. Manajemen State
- **React Hooks**: useState, useEffect, useMemo, useCallback
- **Custom Hooks**: useSocket, useToast, dan lainnya
- **Server Components**: Data fetching di sisi server

### 3. Routing
- **Next.js App Router**: Sistem routing berbasis file
- **Dynamic Routes**: Rute dinamis untuk detail layanan/pengaduan
- **Client-side Navigation**: Navigasi antar halaman

## Arsitektur Backend

### 1. API Routes
- **RESTful API**: Endpoint untuk CRUD operasi
- **Authentication**: Sistem otentikasi (dalam pengembangan)
- **Validation**: Validasi input menggunakan Zod

### 2. Database Layer
- **Prisma ORM**: Abstraksi database dengan TypeScript
- **SQLite**: Database lokal untuk pengembangan
- **Migrations**: Manajemen skema database

### 3. Real-time Communication
- **Socket.IO**: Server dan client untuk komunikasi real-time
- **Room-based**: Sistem room untuk komunikasi berdasarkan role
- **Event-driven**: Sistem event untuk notifikasi dan update

## Fitur Utama

### 1. Sistem Layanan
- **Multi-step Form**: Formulir pengajuan dengan beberapa tahapan
- **Upload Dokumen**: Upload dokumen pendukung
- **Status Tracking**: Pelacakan status pengajuan
- **Komunikasi**: Sistem balasan antara pengguna dan admin

### 2. Sistem Pengaduan
- **Formulir Pengaduan**: Formulir pepengaduan dengan foto dan lokasi
- **Status Tracking**: Pelacakan status pengaduan
- **Geolokasi**: Dukungan pepengaduan berbasis lokasi

### 3. Sistem Berita
- **Manajemen Berita**: Pembuatan dan pengelolaan berita
- **Kategori**: Pengelompokan berita
- **Statistik**: Pelacakan interaksi pengguna

### 4. Sistem Real-time
- **Notifikasi**: Notifikasi real-time untuk update status
- **Chat System**: Sistem komunikasi antara pengguna dan admin
- **Status Update**: Update status secara real-time

## Konfigurasi Server

### 1. Custom Server
- **Socket.IO Integration**: Server HTTP dengan Socket.IO
- **CORS Configuration**: Konfigurasi CORS untuk cross-origin requests
- **Environment Support**: Dukungan untuk development dan production

### 2. Socket Configuration
- **Transport**: WebSocket dan polling
- **Authentication**: Sistem join room berdasarkan role
- **Event Handling**: Penanganan event untuk notifikasi dan update

## Keamanan dan Otentikasi

### 1. Perlindungan Data
- **Input Validation**: Validasi input di sisi server
- **SQL Injection Prevention**: Prisma ORM mencegah SQL injection
- **CORS Policy**: Konfigurasi CORS untuk keamanan cross-origin

### 2. Otentikasi (dalam pengembangan)
- **Session Management**: Sistem session untuk otentikasi
- **Role-based Access**: Akses berdasarkan role (user/admin)
- **JWT Integration**: Token-based authentication

## Performance dan Optimasi

### 1. Client-side Optimization
- **Code Splitting**: Pembagian kode untuk load time yang lebih cepat
- **Lazy Loading**: Loading komponen secara dinamis
- **Memoization**: Penggunaan React.memo dan useMemo

### 2. Server-side Optimization
- **Caching**: Sistem caching untuk data yang sering diakses
- **Database Indexing**: Indeks database untuk query yang efisien
- **Pagination**: Pagination untuk data dalam jumlah besar

## Deployment dan Production

### 1. Build Configuration
- **Next.js Build**: Optimasi build untuk production
- **Static Assets**: Pengelolaan aset statis
- **Environment Variables**: Konfigurasi environment

### 2. Production Server
- **Custom Server**: Server dengan Socket.IO untuk real-time features
- **Process Management**: Pengelolaan proses server
- **Logging**: Sistem logging untuk monitoring

## Pengembangan dan Kontribusi

### 1. Development Workflow
- **ESLint**: Linting untuk konsistensi kode
- **Prettier**: Formatting kode
- **TypeScript**: Type safety dan development experience

### 2. Testing
- **Vitest**: Unit testing framework
- **Component Testing**: Testing komponen UI
- **Integration Testing**: Testing integrasi antar komponen

## Kesimpulan

SGFix adalah platform pemerintahan digital yang komprehensif dengan arsitektur modular dan skalabel. Sistem ini menyediakan berbagai fitur penting untuk pemerintahan digital termasuk layanan publik, pepengaduan masyarakat, dan sistem informasi berita, semuanya dengan dukungan komunikasi real-time dan antarmuka yang ramah pengguna.
# Portal Informasi & Pengaduan (Mobile App Design)

Aplikasi web sederhana untuk kepentingan DEMO/PROTOTYPE yang menyediakan fitur informasi/berita dan sistem pengaduan masyarakat dengan notifikasi realtime. **Dirancang khusus untuk mobile experience dengan maksimal width 412px dan height 100vh.**

## 🎨 Design Features

### Mobile-First Design
- **Max Width**: 412px (iPhone SE dimensions)
- **Full Height**: 100vh dengan proper viewport handling
- **Top Bar**: Navigation dengan branding dan connection status
- **Bottom Bar**: Tab navigation untuk mobile UX
- **Safe Area Support**: Support untuk modern mobile devices dengan notches
- **Touch Optimized**: Minimum 44px touch targets
- **Smooth Transitions**: Micro-interactions untuk better UX

### 📱 Mobile App Experience
- Responsive design yang terfokus pada mobile
- Bottom navigation yang intuitif
- Swipe-friendly interface
- Optimized untuk one-handed usage
- Proper scrolling dengan hidden scrollbars
- iOS input zoom prevention

### 📰 Informasi & Berita
- Menampilkan berita dengan kategori
- Filter berita berdasarkan kategori
- Admin dapat membuat, mengedit, dan mengelola berita
- Support untuk gambar berita

### 📝 Sistem Pengaduan
- Masyarakat dapat membuat pengaduan dengan:
  - Judul dan keterangan
  - Foto (URL)
  - Lokasi (latitude, longitude)
- Status pengaduan: Baru, Diproses, Ditampah, Dikerjakan, Selesai
- Admin dapat memperbarui status pengaduan
- Sistem balasan antara admin dan masyarakat

### 🔔 Notifikasi Realtime
- **Admin menerima notifikasi saat:**
  - User membuat pengaduan baru
  - User membalas pengaduan
- **User menerima notifikasi saat:**
  - Admin update status pengaduan
  - Admin membalas pengaduan
- Support browser notifications

## Arsitektur

### Frontend
- **Next.js 15** dengan App Router
- **TypeScript** untuk type safety
- **Tailwind CSS** untuk styling
- **shadcn/ui** untuk UI components
- **Socket.io Client** untuk notifikasi realtime

### Backend
- **Next.js API Routes** untuk REST API
- **Prisma ORM** dengan database SQLite
- **Socket.io** untuk realtime communication
- **Z.ai Web Dev SDK** (tersedia jika needed)

## Struktur Database

```sql
Kategori {
  id, nama, deskripsi, createdAt, updatedAt
}

Berita {
  id, judul, isi, gambar, kategoriId, published, createdAt, updatedAt
}

Pengaduan {
  id, judul, keterangan, foto, latitude, longitude, status, createdAt, updatedAt
}

Balasan {
  id, pengaduanId, isi, dariAdmin, createdAt, updatedAt
}

Notifikasi {
  id, judul, pesan, tipe, untukAdmin, dibaca, createdAt
}
```

## Cara Menggunakan

### 📱 Mobile Experience (Recommended)
Buka `http://localhost:3000` di browser mobile atau dev tools dengan mobile view untuk:
- **Bottom Navigation**: Gunakan bottom bar untuk navigasi (Beranda, Pengaduan, Admin)
- **Top Bar**: Lihat connection status dan akses admin panel
- **Touch Interface**: Tap dan swipe untuk navigasi yang intuitif
- **Responsive Design**: Optimized untuk mobile screen sizes

### 💻 Desktop Access
Buka `http://localhost:3000` untuk:
- Mobile experience dalam desktop browser (max-width 412px)
- Akses admin panel melalui bottom navigation
- Testing dengan browser dev tools mobile view

### 🔧 Admin Panel
Buka `http://localhost:3000/admin` untuk:
- Mengelola berita dan kategori
- Memproses pengaduan dari masyarakat
- Memperbarui status pengaduan
- Membalas pengaduan

### 🚀 Seed Data Awal
Jalankan endpoint berikut untuk membuat data awal:
```bash
curl -X POST http://localhost:3000/api/seed
```

## Flow Notifikasi

### Admin → User
1. Admin update berita → Notifikasi ke user
2. Admin update status pengaduan → Notifikasi ke user
3. Admin balas pengaduan → Notifikasi ke user

### User → Admin
1. User buat pengaduan → Notifikasi ke admin
2. User balas pengaduan → Notifikasi ke admin

## Instalasi & Development

### Prerequisites
- Node.js 18+
- npm atau yarn

### Setup
```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Seed initial data
curl -X POST http://localhost:3000/api/seed

# Start development server
npm run dev
```

### Build & Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Berita
- `GET /api/berita` - Get all berita
- `GET /api/berita?published=true` - Get published berita only
- `GET /api/berita?kategoriId={id}` - Get berita by kategori
- `POST /api/berita` - Create new berita

### Kategori
- `GET /api/kategori` - Get all kategori
- `POST /api/kategori` - Create new kategori

### Pengaduan
- `GET /api/pengaduan` - Get all pengaduan
- `POST /api/pengaduan` - Create new pengaduan
- `PUT /api/pengaduan/{id}/status` - Update pengaduan status
- `POST /api/pengaduan/{id}/balasan` - Add balasan to pengaduan

### Notifikasi
- `GET /api/notifikasi` - Get all notifikasi
- `GET /api/notifikasi?untukAdmin=true` - Get admin notifikasi
- `PUT /api/notifikasi` - Mark notifikasi as read

### Socket.io
- `GET /api/socket/io` - Socket.io connection endpoint

## Status Pengaduan

1. **BARU** - Pengaduan baru masuk
2. **DITAMPUNG** - Pengaduan ditampung untuk diproses
3. **DITERUSKAN** - Pengaduan diteruskan ke unit terkait
4. **DIKERJAKAN** - Sedang dikerjakan
5. **SELESAI** - Pengaduan selesai

## Teknologi

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Realtime**: Socket.io
- **Icons**: Lucide React
- **Notifications**: Browser Notifications API

## Catatan

- **Mobile-Only Design**: Aplikasi dirancang khusus untuk mobile experience dengan max-width 412px
- **No Authentication**: Tidak menggunakan sistem autentikasi (sesuai requirement)
- **Database**: SQLite untuk kemudahan development
- **Socket.io**: Menggunakan rooms untuk memisahkan notifikasi admin dan user
- **Responsive**: Support responsive design untuk mobile dan desktop (dengan constraints)
- **Touch Optimized**: Semua interactive elements memiliki minimum 44px touch targets
- **Safe Area**: Support untuk modern mobile devices dengan notches/home indicators

## License

Demo/Prototype - Internal Use Only
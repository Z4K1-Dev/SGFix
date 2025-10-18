# 📡 API Routes Documentation Index

## 🔗 **API Overview**

SGFix Project provides RESTful APIs with caching, pagination, and real-time capabilities. All APIs follow consistent patterns for error handling and response formatting. The API system now includes comprehensive support for government service applications with multi-step forms and status tracking.

---

## 🏗️ **API Architecture**

### 📊 **Response Format**
```typescript
// Success Response (with pagination)
{
  data: T[],                    // Array of data
  pagination: {                 // Pagination metadata
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}

// Success Response (single item)
{
  id: string,
  // ...other fields
}

// Error Response
{
  error: string,               // Error message
  status: number               // HTTP status code
}
```

### ⚡ **Caching Strategy**
| Endpoint | Cache Duration | Cache Key Pattern | Invalidation |
|----------|----------------|-------------------|--------------|
| `GET /api/berita` | 5 minutes | `berita:list:${params}` | On POST/PUT/DELETE |
| `GET /api/pengaduan` | 3 minutes | `pengaduan:list:${params}` | On POST/PUT/DELETE |
| `GET /api/layanan` | 3 minutes | `layanan:list:${params}` | On POST/PUT/DELETE |
| `GET /api/kategori` | No cache | - | - |
| `GET /api/notifikasi` | No cache | - | On create |

---

## 📋 **API Endpoints Index**

### 📰 **Berita API**
#### `GET /api/berita`
**Purpose**: Retrieve paginated list of news articles

**Query Parameters**:
```typescript
{
  published?: "true" | "false",    // Filter by published status
 kategoriId?: string,             // Filter by category ID
 page?: number,                   // Page number (default: 1)
  limit?: number                   // Items per page (default: 10, max: 50)
}
```

**Response Example**:
```json
{
  "data": [
    {
      "id": "cls123abc",
      "judul": "Berita Terbaru",
      "isi": "Konten berita lengkap...",
      "gambar": "https://example.com/image.jpg",
      "published": true,
      "kategori": {
        "id": "cat123",
        "nama": "Pemerintahan"
      },
      "createdAt": "2025-06-17T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
 }
}
```

**Performance**: ⭐⭐⭐⭐⭐ Optimized with caching and indexes

---

#### `POST /api/berita`
**Purpose**: Create new news article

**Request Body**:
```typescript
{
  judul: string,                   // Required - News title
 isi: string,                     // Required - News content
  gambar?: string,                 // Optional - Image URL
  kategoriId: string,              // Required - Category ID
 published?: boolean              // Optional - Default: false
}
```

**Response Example**:
```json
{
  "id": "cls123abc",
  "judul": "Berita Baru",
  "isi": "Konten berita...",
  "gambar": "https://example.com/image.jpg",
  "published": false,
  "kategori": {
    "id": "cat123",
    "nama": "Pemerintahan"
  },
  "createdAt": "2025-06-17T10:00:00Z"
}
```

**Side Effects**: 
- ✅ Invalidates all `berita:*` cache keys
- ✅ Triggers socket notifications to admin users

---

#### `GET /api/berita/[id]`
**Purpose**: Retrieve single news article

**Path Parameters**:
- `id`: News article ID

**Response Example**:
```json
{
  "id": "cls123abc",
  "judul": "Berita Spesifik",
  "isi": "Konten lengkap...",
  "gambar": "https://example.com/image.jpg",
  "published": true,
  "views": 150,
  "kategori": {
    "id": "cat123",
    "nama": "Pemerintahan"
  },
  "createdAt": "2025-06-17T10:00:00Z"
}
```

---

#### `PUT /api/berita/[id]`
**Purpose**: Update existing news article

**Path Parameters**:
- `id`: News article ID

**Request Body**:
```typescript
{
  judul?: string,
  isi?: string,
  gambar?: string,
  kategoriId?: string,
  published?: boolean
}
```

**Side Effects**: 
- ✅ Invalidates `berita:*` cache keys
- ✅ Triggers socket notifications for updates

---

#### `DELETE /api/berita/[id]`
**Purpose**: Delete news article

**Path Parameters**:
- `id`: News article ID

**Side Effects**: 
- ✅ Invalidates `berita:*` cache keys
- ✅ Cascades delete related notifications

---

#### `PUT /api/berita/[id]/view`
**Purpose**: Increment view count for news article

**Path Parameters**:
- `id`: News article ID

**Response Example**:
```json
{
  "success": true,
  "views": 151
}
```

---

#### `GET /api/berita/related/[id]`
**Purpose**: Retrieve related news articles

**Path Parameters**:
- `id`: News article ID to find related articles for

**Response Example**:
```json
{
  "data": [
    {
      "id": "cls456def",
      "judul": "Berita Terkait",
      "isi": "Konten berita terkait...",
      "gambar": "https://example.com/image2.jpg",
      "published": true,
      "kategori": {
        "id": "cat123",
        "nama": "Pemerintahan"
      },
      "createdAt": "2025-06-16T10:00:00Z"
    }
  ]
}
```

---

#### `GET /api/berita/optimized`
**Purpose**: Optimized endpoint for news with performance enhancements

**Query Parameters**:
```typescript
{
  published?: "true" | "false",
  kategoriId?: string,
  page?: number,
  limit?: number
}
```

---

### 📝 **Pengaduan API**
#### `GET /api/pengaduan`
**Purpose**: Retrieve paginated list of reports

**Query Parameters**:
```typescript
{
  status?: "BARU" | "DITAMPUNG" | "DITERUSKAN" | "DIKERJAKAN" | "SELESAI",
  page?: number,                   // Default: 1
  limit?: number                   // Default: 10, max: 50
}
```

**Response Example**:
```json
{
  "data": [
    {
      "id": "lap123abc",
      "judul": "Jalan Rusak",
      "keterangan": "Jalan di desa X rusak parah...",
      "foto": "https://example.com/report.jpg",
      "status": "BARU",
      "createdAt": "2025-06-17T10:00:00Z",
      "balasan": [
        {
          "id": "bal123",
          "isi": "Akan segera ditindaklanjuti",
          "dariAdmin": true,
          "createdAt": "2025-06-17T11:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Performance**: ⭐⭐⭐⭐⭐ Optimized with caching and limited balasan

---

#### `POST /api/pengaduan`
**Purpose**: Create new report

**Request Body**:
```typescript
{
  judul: string,                   // Required - Report title
  keterangan: string,              // Required - Report description
 foto?: string,                   // Optional - Photo URL
  latitude?: number,               // Optional - GPS latitude
  longitude?: number               // Optional - GPS longitude
}
```

**Response Example**:
```json
{
  "id": "lap123abc",
  "judul": "Pengaduan Baru",
  "keterangan": "Deskripsi pengaduan...",
  "foto": "https://example.com/photo.jpg",
  "status": "BARU",
  "createdAt": "2025-06-17T10:00:00Z"
}
```

**Side Effects**: 
- ✅ Creates notification for admin users
- ✅ Sends real-time socket notification
- ✅ Invalidates `pengaduan:*` cache keys

---

#### `GET /api/pengaduan/[id]`
**Purpose**: Retrieve single report with all details

**Path Parameters**:
- `id`: Report ID

**Response Example**:
```json
{
  "id": "lap123abc",
  "judul": "Pengaduan Spesifik",
  "keterangan": "Deskripsi lengkap...",
  "foto": "https://example.com/photo.jpg",
  "latitude": -6.200000,
  "longitude": 106.816666,
  "status": "DITAMPUNG",
  "createdAt": "2025-06-17T10:00:00Z",
 "updatedAt": "2025-06-17T11:0:00Z",
  "balasan": [
    {
      "id": "bal123",
      "isi": "Akan segera ditindaklanjuti",
      "dariAdmin": true,
      "createdAt": "2025-06-17T11:0:00Z"
    }
  ],
  "notifikasi": [
    {
      "id": "not123",
      "judul": "Pengaduan Diterima",
      "pesan": "Pengaduan Anda sedang ditangani",
      "tipe": "PENGADUAN_UPDATE",
      "createdAt": "2025-06-17T11:0:00Z"
    }
 ]
}
```

---

#### `PUT /api/pengaduan/[id]`
**Purpose**: Update existing report

**Path Parameters**:
- `id`: Report ID

**Request Body**:
```typescript
{
  judul?: string,
  keterangan?: string,
  foto?: string,
  latitude?: number,
  longitude?: number
}
```

**Side Effects**: 
- ✅ Invalidates `pengaduan:*` cache keys

---

#### `DELETE /api/pengaduan/[id]`
**Purpose**: Delete report

**Path Parameters**:
- `id`: Report ID

**Side Effects**: 
- ✅ Invalidates `pengaduan:*` cache keys
- ✅ Cascades delete related notifications and replies

---

#### `PUT /api/pengaduan/[id]/status`
**Purpose**: Update report status

**Path Parameters**:
- `id`: Report ID

**Request Body**:
```typescript
{
  status: "BARU" | "DITAMPUNG" | "DITERUSKAN" | "DIKERJAKAN" | "SELESAI"
}
```

**Side Effects**: 
- ✅ Creates status change notification
- ✅ Sends real-time socket notification
- ✅ Invalidates `pengaduan:*` cache keys

---

#### `POST /api/pengaduan/[id]/balasan`
**Purpose**: Add reply to report

**Path Parameters**:
- `id`: Report ID

**Request Body**:
```typescript
{
  isi: string,                     // Required - Reply content
  dariAdmin?: boolean              // Default: false
}
```

**Response Example**:
```json
{
  "id": "bal123",
  "isi": "Balasan untuk pengaduan",
  "dariAdmin": true,
  "createdAt": "2025-06-17T11:00:00Z",
  "pengaduanId": "lap123abc"
}
```

**Side Effects**: 
- ✅ Creates notification for report creator
- ✅ Sends real-time socket notification
- ✅ Invalidates `pengaduan:*` cache keys

---

#### `GET /api/pengaduan/optimized`
**Purpose**: Optimized endpoint for reports with performance enhancements

**Query Parameters**:
```typescript
{
  status?: "BARU" | "DITAMPUNG" | "DITERUSKAN" | "DIKERJAKAN" | "SELESAI",
  page?: number,
  limit?: number
}
```

---

### 🏛️ **Layanan API (Government Services)**
#### `GET /api/layanan`
**Purpose**: Retrieve paginated list of service applications

**Query Parameters**:
```typescript
{
  jenisLayanan?: "KTP_EL" | "KTP_BARU" | "KTP_HILANG" | "KTP_RUSAK" | "AKTA_KELAHIRAN" | "AKTA_KEMATIAN" | "AKTA_PERKAWINAN" | "AKTA_CERAI" | "SURAT_PINDAH" | "SURAT_KEHILANGAN" | "SURAT_KETERANGAN" | "KK_BARU" | "KK_PERUBAHAN" | "KK_HILANG" | "IMB" | "SIUP" | "SKDU",
  status?: "DITERIMA" | "DIPROSES" | "DIVERIFIKASI" | "SELESAI" | "DITOLAK",
  page?: number,                   // Default: 1
  limit?: number                   // Default: 10, max: 50
}
```

**Response Example**:
```json
{
  "data": [
    {
      "id": "lay123abc",
      "judul": "Permohonan KTP Elektronik",
      "jenisLayanan": "KTP_EL",
      "namaLengkap": "Budi Santoso",
      "nik": "1234567890123456",
      "status": "DIPROSES",
      "createdAt": "2025-06-17T10:00:00Z",
      "balasan": [
        {
          "id": "bal123",
          "isi": "Dokumen sedang diverifikasi",
          "dariAdmin": true,
          "createdAt": "2025-06-17T11:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
 }
}
```

**Performance**: ⭐⭐⭐⭐ Optimized with caching and limited replies

---

#### `POST /api/layanan`
**Purpose**: Create new service application with multi-step form support

**Request Body**:
```typescript
{
  judul: string,                   // Required - Application title
  jenisLayanan: "KTP_EL" | "KTP_BARU" | "KTP_HILANG" | "KTP_RUSAK" | "AKTA_KELAHIRAN" | "AKTA_KEMATIAN" | "AKTA_PERKAWINAN" | "AKTA_CERAI" | "SURAT_PINDAH" | "SURAT_KEHILANGAN" | "SURAT_KETERANGAN" | "KK_BARU" | "KK_PERUBAHAN" | "KK_HILANG" | "IMB" | "SIUP" | "SKDU",
  namaLengkap: string,             // Required - Full name
 nik: string,                     // Required - National ID
  tempatLahir: string,             // Required - Place of birth
  tanggalLahir: string,            // Required - Date of birth (ISO string)
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN", // Required - Gender
  alamat: string,                  // Required - Address
  rt?: string,                     // Optional - RT number
  rw?: string,                     // Optional - RW number
 kelurahan?: string,              // Optional - Village
  kecamatan?: string,              // Optional - Subdistrict
  kabupaten?: string,              // Optional - District
  provinsi?: string,               // Optional - Province
  kodePos?: string,                // Optional - Postal code
 telepon?: string,                // Optional - Phone number
  email?: string,                  // Optional - Email address
  dokumen?: string,                // Optional - JSON string for multiple documents
  formData?: string,               // Optional - JSON string for multi-step form data
 keterangan?: string              // Optional - Additional information
}
```

**Response Example**:
```json
{
  "id": "lay123abc",
  "judul": "Permohonan KTP Elektronik",
  "jenisLayanan": "KTP_EL",
  "namaLengkap": "Budi Santoso",
  "nik": "1234567890123456",
  "status": "DITERIMA",
  "createdAt": "2025-06-17T10:00:00Z"
}
```

**Side Effects**: 
- ✅ Creates notification for admin users
- ✅ Sends real-time socket notification
- ✅ Invalidates `layanan:*` cache keys

---

#### `GET /api/layanan/[id]`
**Purpose**: Retrieve single service application with all details

**Path Parameters**:
- `id`: Service application ID

**Response Example**:
```json
{
  "id": "lay123abc",
  "judul": "Permohonan KTP Elektronik",
  "jenisLayanan": "KTP_EL",
  "namaLengkap": "Budi Santoso",
  "nik": "1234567890123456",
  "tempatLahir": "Jakarta",
  "tanggalLahir": "1990-01-01T00:00:00Z",
  "jenisKelamin": "LAKI_LAKI",
  "alamat": "Jl. Contoh No. 123",
  "rt": "001",
  "rw": "002",
  "kelurahan": "Kelurahan Contoh",
  "kecamatan": "Kecamatan Contoh",
  "kabupaten": "Kota Contoh",
  "provinsi": "DKI Jakarta",
  "kodePos": "12345",
  "telepon": "081234567890",
  "email": "budi@example.com",
  "status": "DIPROSES",
  "dokumen": "[{\"name\":\"ktp.jpg\",\"url\":\"https://example.com/ktp.jpg\"}]",
  "formData": "{\"step1\":{\"field\":\"value\"},\"step2\":{\"field\":\"value\"}}",
  "keterangan": "Permohonan tambahan",
  "createdAt": "2025-06-17T10:00:00Z",
  "updatedAt": "2025-06-17T11:00:00Z",
  "balasan": [
    {
      "id": "bal123",
      "isi": "Dokumen sedang diverifikasi",
      "dariAdmin": true,
      "createdAt": "2025-06-17T11:00:00Z"
    }
  ],
  "notifikasi": [
    {
      "id": "not123",
      "judul": "Layanan Diterima",
      "pesan": "Permohonan Anda sedang diproses",
      "tipe": "LAYANAN_UPDATE",
      "createdAt": "2025-06-17T11:00:00Z"
    }
  ]
}
```

---

#### `PUT /api/layanan/[id]`
**Purpose**: Update existing service application

**Path Parameters**:
- `id`: Service application ID

**Request Body**:
```typescript
{
  judul?: string,
  jenisLayanan?: "KTP_EL" | "KTP_BARU" | "KTP_HILANG" | "KTP_RUSAK" | "AKTA_KELAHIRAN" | "AKTA_KEMATIAN" | "AKTA_PERKAWINAN" | "AKTA_CERAI" | "SURAT_PINDAH" | "SURAT_KEHILANGAN" | "SURAT_KETERANGAN" | "KK_BARU" | "KK_PERUBAHAN" | "KK_HILANG" | "IMB" | "SIUP" | "SKDU",
  namaLengkap?: string,
  nik?: string,
  tempatLahir?: string,
  tanggalLahir?: string,
  jenisKelamin?: "LAKI_LAKI" | "PEREMPUAN",
  alamat?: string,
  rt?: string,
  rw?: string,
  kelurahan?: string,
  kecamatan?: string,
  kabupaten?: string,
  provinsi?: string,
  kodePos?: string,
 telepon?: string,
  email?: string,
  dokumen?: string,
  formData?: string,
  keterangan?: string
}
```

**Side Effects**: 
- ✅ Invalidates `layanan:*` cache keys

---

#### `DELETE /api/layanan/[id]`
**Purpose**: Delete service application

**Path Parameters**:
- `id`: Service application ID

**Side Effects**: 
- ✅ Invalidates `layanan:*` cache keys
- ✅ Cascades delete related notifications and replies

---

#### `POST /api/layanan/[id]/balasan`
**Purpose**: Add reply to service application

**Path Parameters**:
- `id`: Service application ID

**Request Body**:
```typescript
{
  isi: string,                     // Required - Reply content
  dariAdmin?: boolean              // Default: false
}
```

**Response Example**:
```json
{
  "id": "bal123",
 "isi": "Balasan untuk permohonan layanan",
  "dariAdmin": true,
  "createdAt": "2025-06-17T11:00:00Z",
  "layananId": "lay123abc"
}
```

**Side Effects**: 
- ✅ Creates notification for application creator
- ✅ Sends real-time socket notification
- ✅ Invalidates `layanan:*` cache keys

---

#### `GET /api/layanan/optimized`
**Purpose**: Optimized endpoint for services with performance enhancements

**Query Parameters**:
```typescript
{
  jenisLayanan?: "KTP_EL" | "KTP_BARU" | "KTP_HILANG" | "KTP_RUSAK" | "AKTA_KELAHIRAN" | "AKTA_KEMATIAN" | "AKTA_PERKAWINAN" | "AKTA_CERAI" | "SURAT_PINDAH" | "SURAT_KEHILANGAN" | "SURAT_KETERANGAN" | "KK_BARU" | "KK_PERUBAHAN" | "KK_HILANG" | "IMB" | "SIUP" | "SKDU",
  status?: "DITERIMA" | "DIPROSES" | "DIVERIFIKASI" | "SELESAI" | "DITOLAK",
  page?: number,
  limit?: number
}
```

---

### 🏛️ **Admin Layanan API**
#### `GET /api/admin/layanan`
**Purpose**: Retrieve all service applications (admin only)

**Query Parameters**:
```typescript
{
  jenisLayanan?: "KTP_EL" | "KTP_BARU" | "KTP_HILANG" | "KTP_RUSAK" | "AKTA_KELAHIRAN" | "AKTA_KEMATIAN" | "AKTA_PERKAWINAN" | "AKTA_CERAI" | "SURAT_PINDAH" | "SURAT_KEHILANGAN" | "SURAT_KETERANGAN" | "KK_BARU" | "KK_PERUBAHAN" | "KK_HILANG" | "IMB" | "SIUP" | "SKDU",
  status?: "DITERIMA" | "DIPROSES" | "DIVERIFIKASI" | "SELESAI" | "DITOLAK",
  page?: number,
  limit?: number
}
```

**Response Example**:
```json
{
  "data": [
    {
      "id": "lay123abc",
      "judul": "Permohonan KTP Elektronik",
      "jenisLayanan": "KTP_EL",
      "namaLengkap": "Budi Santoso",
      "nik": "1234567890123456",
      "status": "DIPROSES",
      "createdAt": "2025-06-17T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

#### `PUT /api/admin/layanan/[id]/status`
**Purpose**: Update service application status (admin only)

**Path Parameters**:
- `id`: Service application ID

**Request Body**:
```typescript
{
  status: "DITERIMA" | "DIPROSES" | "DIVERIFIKASI" | "SELESAI" | "DITOLAK"
}
```

**Side Effects**: 
- ✅ Creates status change notification
- ✅ Sends real-time socket notification
- ✅ Invalidates `layanan:*` cache keys

---

#### `POST /api/admin/layanan/[id]/balasan`
**Purpose**: Add admin reply to service application

**Path Parameters**:
- `id`: Service application ID

**Request Body**:
```typescript
{
  isi: string                      // Required - Reply content
}
```

**Response Example**:
```json
{
  "id": "bal123",
  "isi": "Balasan admin untuk permohonan layanan",
  "dariAdmin": true,
  "createdAt": "2025-06-17T11:00:00Z",
  "layananId": "lay123abc"
}
```

**Side Effects**: 
- ✅ Creates notification for application creator
- ✅ Sends real-time socket notification
- ✅ Invalidates `layanan:*` cache keys

---

### 🏷️ **Kategori API**
#### `GET /api/kategori`
**Purpose**: Retrieve all categories

**Response Example**:
```json
[
  {
    "id": "cat123",
    "nama": "Pemerintahan",
    "deskripsi": "Berita seputar pemerintahan",
    "createdAt": "2025-06-17T10:00:00Z"
  }
]
```

**Performance**: ⭐⭐⭐ Standard (no caching)

---

#### `POST /api/kategori`
**Purpose**: Create new category

**Request Body**:
```typescript
{
  nama: string,                    // Required - Category name
  deskripsi?: string               // Optional - Description
}
```

---

#### `GET /api/kategori/[id]`
**Purpose**: Retrieve single category

**Path Parameters**:
- `id`: Category ID

**Response Example**:
```json
{
  "id": "cat123",
  "nama": "Pemerintahan",
  "deskripsi": "Berita seputar pemerintahan",
  "createdAt": "2025-06-17T10:00:00Z",
  "updatedAt": "2025-06-17T10:00:00Z"
}
```

---

#### `PUT /api/kategori/[id]`
**Purpose**: Update existing category

**Path Parameters**:
- `id`: Category ID

**Request Body**:
```typescript
{
  nama?: string,
  deskripsi?: string
}
```

---

#### `DELETE /api/kategori/[id]`
**Purpose**: Delete category

**Path Parameters**:
- `id`: Category ID

**Side Effects**: 
- ✅ Cascades delete related news articles

---

### 🔔 **Notifikasi API**
#### `GET /api/notifikasi`
**Purpose**: Retrieve notifications (admin only)

**Query Parameters**:
```typescript
{
  untukAdmin?: boolean,            // Filter by admin target
 dibaca?: boolean,                // Filter by read status
  limit?: number                   // Limit results
}
```

**Response Example**:
```json
[
  {
    "id": "not123",
    "judul": "Pengaduan Baru",
    "pesan": "Pengaduan 'Jalan Rusak' telah dibuat",
    "tipe": "PENGADUAN_BARU",
    "untukAdmin": true,
    "dibaca": false,
    "createdAt": "2025-06-17T10:00:00Z"
 }
]
```

---

#### `POST /api/notifikasi`
**Purpose**: Create new notification

**Request Body**:
```typescript
{
  judul: string,                   // Required - Notification title
  pesan: string,                   // Required - Notification message
  tipe: "BERITA_BARU" | "BERITA_UPDATE" | "PENGADUAN_BARU" | "PENGADUAN_UPDATE" | "PENGADUAN_BALASAN" | "LAYANAN_BARU" | "LAYANAN_UPDATE" | "LAYANAN_BALASAN", // Required - Notification type
 untukAdmin?: boolean,            // Default: false
  beritaId?: string,               // Optional - Related news ID
 pengaduanId?: string,              // Optional - Related report ID
 layananId?: string,              // Optional - Related service ID
  balasanId?: string               // Optional - Related reply ID
}
```

---

#### `PUT /api/notifikasi/[id]`
**Purpose**: Mark notification as read

**Path Parameters**:
- `id`: Notification ID

**Request Body**:
```typescript
{
  dibaca: boolean                  // Required - Read status
}
```

---

#### `DELETE /api/notifikasi/[id]`
**Purpose**: Delete notification

**Path Parameters**:
- `id`: Notification ID

---

### 💾 **Database Seed API**
#### `POST /api/seed`
**Purpose**: Seed database with sample data

**Response Example**:
```json
{
  "message": "Database seeded successfully",
  "created": {
    "kategori": 5,
    "berita": 20,
    "pengaduan": 15,
    "layanan": 10
  }
}
```

**⚠️ Warning**: Development only - clears existing data

---

#### `GET /api/seed/berita`
**Purpose**: Seed database with sample news data only

**Response Example**:
```json
{
  "message": "Berita seeded successfully",
  "created": {
    "berita": 20
  }
}
```

---

### 🔍 **Health Check API**
#### `GET /api/health`
**Purpose**: System health check

**Response Example**:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-17T10:00:00Z",
  "database": "connected",
  "cache": "active",
  "socket": "running"
}
```

---

### 📊 **Monitoring API**
#### `GET /api/monitoring`
**Purpose**: System monitoring and performance metrics

**Response Example**:
```json
{
  "status": "operational",
  "timestamp": "2025-06-17T10:00:00Z",
  "database": {
    "connected": true,
    "queriesPerSecond": 15.2,
    "avgQueryTime": 25.3
 },
  "cache": {
    "hitRate": 85.2,
    "items": 120
  },
  "api": {
    "requestsPerSecond": 8.7,
    "avgResponseTime": 120.5
  }
}
```

---

#### `GET /api/aktivitas`
**Purpose**: Activity monitoring and statistics

**Response Example**:
```json
{
  "timestamp": "2025-06-17T10:00:00Z",
  "berita": {
    "today": 3,
    "week": 12,
    "month": 45
  },
  "pengaduan": {
    "today": 8,
    "week": 32,
    "month": 128
  },
  "layanan": {
    "today": 5,
    "week": 21,
    "month": 87
 }
}
```

---

### 📡 **Socket API**
#### `GET /api/socket`
**Purpose**: Socket configuration endpoint

**Response Example**:
```json
{
  "socketUrl": "/api/socket",
  "transports": ["websocket", "polling"],
  "reconnection": true,
  "reconnectionAttempts": 5
}
```

---

#### `GET /api/socket/io`
**Purpose**: Socket.io connection endpoint

**Usage**: Used internally by Socket.io client

---

## 🔄 **Real-time APIs (Socket.io)**

### 📡 **Socket Events**
| Event | Direction | Purpose | Data |
|-------|-----------|---------|------|
| `join-admin` | Client → Server | Join admin room | - |
| `join-user` | Client → Server | Join user room | - |
| `join-room` | Client → Server | Join specific room | `room: string` |
| `leave-room` | Client → Server | Leave specific room | `room: string` |
| `notification` | Server → Client | Push notification | `Notification` |
| `pengaduan-update` | Server → Client | Report status update | `{ pengaduanId, status, timestamp }` |
| `layanan-update` | Server → Client | Service status update | `{ layananId, status, timestamp }` |
| `berita-update` | Server → Client | News update | `Berita` |
| `send-notification` | Client → Server | Send notification | `{ type, message, room? }` |
| `update-pengaduan-status` | Client → Server | Update report status | `{ pengaduanId, status, room? }` |
| `update-layanan-status` | Client → Server | Update service status | `{ layananId, status, room? }` |
| `new-balasan` | Client → Server | New reply to report/service | `{ type, id, balasan, room? }` |
| `heartbeat` | Client → Server | Keep-alive signal | - |
| `heartbeat-response` | Server → Client | Keep-alive response | `{ timestamp }` |

### 🔌 **Socket Configuration**
```typescript
// Client connection
const socket = io('/api/socket', {
  path: '/api/socket',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 5000,
  pingTimeout: 60000,
  pingInterval: 2500
})

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data)
})

// Listen for report status updates
socket.on('pengaduan-status-updated', (data) => {
  console.log('Report status updated:', data)
})

// Listen for service status updates
socket.on('layanan-status-updated', (data) => {
  console.log('Service status updated:', data)
})
```

---

## 🛡️ **Error Handling**

### 📋 **HTTP Status Codes**
| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | Success | Successful GET/PUT/DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid authentication |
| `404` | Not Found | Resource not found |
| `500` | Internal Error | Server/database error |

### 🚨 **Error Response Format**
```json
{
  "error": "Judul, isi, dan kategoriId wajib diisi",
  "status": 400
}
```

### 🔄 **Retry Strategy**
- **Network Errors**: Automatic retry with exponential backoff
- **Timeout**: 5 second timeout for all requests
- **Cache Fallback**: Serve stale cache if available
- **Graceful Degradation**: Show appropriate UI for errors

---

## 📊 **Performance Metrics**

### ⚡ **API Performance**
| Endpoint | Avg Response | Cache Hit Rate | Status |
|----------|--------------|----------------|--------|
| `GET /api/berita` | ~10ms | 85% | ✅ Excellent |
| `GET /api/pengaduan` | ~120ms | 80% | ✅ Excellent |
| `GET /api/layanan` | ~130ms | 80% | ✅ Excellent |
| `POST /api/berita` | ~200ms | N/A | ✅ Good |
| `POST /api/pengaduan` | ~250ms | N/A | ✅ Good |
| `POST /api/layanan` | ~300ms | N/A | ✅ Good |

### 🗄️ **Database Performance**
| Query | Avg Time | Index Used | Optimization |
|-------|----------|------------|--------------|
| Berita list | ~25ms | ✅ published, createdAt | Composite index |
| Pengaduan list | ~30ms | ✅ status, createdAt | Composite index |
| Layanan list | ~35ms | ✅ jenisLayanan, status, createdAt | Composite index |
| Category filter | ~15ms | ✅ kategoriId | Single index |
| Status filter | ~20ms | ✅ status | Single index |

---

## 🔧 **Development Tools**

### 🧪 **Testing Endpoints**
```bash
# Test berita API
curl "http://localhost:3000/api/berita?published=true&page=1&limit=5"

# Test pengaduan API
curl "http://localhost:3000/api/pengaduan?status=BARU&page=1"

# Test layanan API
curl "http://localhost:3000/api/layanan?status=DITERIMA&page=1"

# Create new berita
curl -X POST "http://localhost:3000/api/berita" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Test","isi":"Content","kategoriId":"cat123"}'

# Create new pengaduan
curl -X POST "http://localhost:3000/api/pengaduan" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Test Pengaduan","keterangan":"Deskripsi pengaduan"}'

# Create new layanan
curl -X POST "http://localhost:3000/api/layanan" \
  -H "Content-Type: application/json" \
  -d '{"judul":"Test Layanan","jenisLayanan":"KTP_EL","namaLengkap":"Budi Santoso","nik":"1234567890123456","tempatLahir":"Jakarta","tanggalLahir":"1990-01-01T00:00:00.000Z","jenisKelamin":"LAKI_LAKI","alamat":"Jl. Contoh No. 123"}'
```

### 📊 **Monitoring**
- **Cache Performance**: Check console logs for cache hits/misses
- **Database Queries**: Enable Prisma query logging
- **Socket Events**: Monitor browser console for socket events
- **API Response**: Use browser DevTools Network tab

---

## 🔄 **API Versioning**

### 📝 **Current Version**: v1.0.0
- **Stable**: All endpoints are production-ready
- **Backward Compatible**: Changes will be versioned
- **Deprecation**: 30-day notice for breaking changes

### 🚀 **Future Enhancements**
- **GraphQL API**: For complex queries
- **File Upload API**: For image/document uploads
- **Search API**: Full-text search capabilities
- **Advanced Analytics**: User behavior tracking
- **API Rate Limiting**: Enhanced protection

---

*Last Updated: 2025-10-12*
*API Version: v1.0.0*
*Performance: Optimized with caching and indexes*
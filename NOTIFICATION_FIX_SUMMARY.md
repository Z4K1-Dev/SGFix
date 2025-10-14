# Notifikasi Real-Time Fix Summary

## Masalah Awal
- Balasan dari admin/user masuk ke database tapi tidak trigger toast dan sound
- Test notifikasi via `/test-notif` berhasil untuk admin dan user
- API balasan tidak mengirim notifikasi real-time via Socket.IO

## Root Cause Analysis
1. **API Balasan Layanan** - Hanya menyimpan ke database, tidak mengirim Socket.IO event
2. **API Balasan Admin** - Sama, hanya database tanpa real-time notification
3. **Socket Utils Room Mismatch** - Mengirim ke room 'user' tapi client join room 'public'

## Solusi Implementasi

### 1. API Balasan Layanan (`src/app/api/layanan/[id]/balasan/route.ts`)
**Perbaikan:**
- Tambahkan Socket.IO server import
- Kirim notifikasi ke admin room saat user balas
- Kirim event `balasan-added` untuk real-time update
- Logging untuk debugging

```typescript
// Send real-time notification via Socket.IO
const { getSocketServer } = await import('@/lib/socket')
const io: Server = getSocketServer()

io.to('admin').emit('notification', {
  id: notifikasi.id,
  judul: notifikasi.judul,
  pesan: notifikasi.pesan,
  tipe: notifikasi.tipe,
  data: { layananId: id, balasanId: balasan.id, dariAdmin: false },
  timestamp: new Date().toISOString()
})
```

### 2. API Balasan Admin (`src/app/api/admin/layanan/[id]/balasan/route.ts`)
**Perbaikan:**
- Kirim notifikasi ke public room (users) saat admin balas
- Kirim event `balasan-added` untuk real-time update
- Set `untukAdmin: false` untuk notifikasi user

```typescript
// Send to public room (users)
io.to('public').emit('notification', {
  id: notifikasi.id,
  judul: notifikasi.judul,
  pesan: notifikasi.pesan,
  tipe: notifikasi.tipe,
  data: { layananId: id, balasanId: balasan.id, dariAdmin: true },
  timestamp: new Date().toISOString()
})
```

### 3. Socket Utils (`src/lib/socket-utils.ts`)
**Perbaikan:**
- Room correction: `'user'` → `'public'`
- Tambahkan `balasan-added` event
- Tambahkan parameter `balasanId`
- Logging untuk debugging

```typescript
// Before: io.to('user').emit('notification', ...)
// After:  io.to('public').emit('notification', ...)
```

### 4. API Laporan Balasan (`src/app/api/laporan/[id]/balasan/route.ts`)
**Perbaikan:**
- Tambahkan parameter `balasanId` ke fungsi notifikasi
- Memastikan event `balasan-added` terkirim

## Flow Notifikasi Sekarang

### User → Admin
1. User kirim balasan via form
2. API simpan ke database
3. API kirim Socket.IO event ke `admin` room
4. Admin terima toast + sound + real-time update

### Admin → User
1. Admin kirim balasan via form
2. API simpan ke database
3. API kirim Socket.IO event ke `public` room
4. User terima toast + sound + real-time update

## Testing Instructions

### Test Balasan User → Admin
1. Buka halaman layanan sebagai user
2. Kirim balasan
3. Di halaman admin, seharusnya muncul:
   - Toast notification
   - Sound notification
   - Real-time update di balasan list

### Test Balasan Admin → User
1. Buka halaman admin
2. Kirim balasan ke layanan
3. Di halaman user, seharusnya muncul:
   - Toast notification
   - Sound notification
   - Real-time update di balasan list

### Test Notifikasi Manual
1. Buka `http://localhost:3000/test-notif`
2. Kirim test notifikasi
3. Baik admin dan user seharusnya muncul toast + sound

## Debugging

### Server Log
Cari log seperti:
```
Real-time notification sent for layanan balasan: {
  layananId: "xxx",
  balasanId: "xxx",
  notifikasiId: "xxx"
}
```

### Browser Console
Cari log seperti:
```
=== SOCKET NOTIFICATION EVENT ===
Raw notification data received: {...}
Sound enabled status: true
```

### Room Membership
Pastikan client join room yang benar:
- Admin: `admin` room
- User: `public` room

## Architecture Benefits

1. **Real-time Communication** - Notifikasi instan tanpa refresh
2. **Proper Room Management** - Admin dan user terpisah
3. **Event Consistency** - Sama untuk semua jenis balasan
4. **Error Handling** - Continue response even if Socket.IO fails
5. **Debugging Support** - Comprehensive logging

## Notifikasi Status Update

### Status Laporan
✅ **Sudah Implementasi**
- API: `src/app/api/laporan/[id]/status/route.ts`
- User menerima notifikasi real-time saat status laporan berubah
- Event: `notification` ke `public` room

### Status Layanan
✅ **Baru Implementasi**
- API: `src/app/api/admin/layanan/[id]/route.ts`
- User menerima notifikasi real-time saat status layanan berubah
- Event: `notification` dan `layanan-status-updated` ke `public` room

### Status Types
- **DITERIMA** - "Pengajuan layanan Anda telah diterima"
- **DIPROSES** - "Pengajuan layanan Anda sedang dalam proses"
- **DIVERIFIKASI** - "Pengajuan layanan Anda sedang diverifikasi"
- **SELESAI** - "Layanan Anda telah selesai diproses"
- **DITOLAK** - "Pengajuan layanan Anda ditolak. Alasan: ..."

## Testing Status Update Notifications

### Test Status Laporan
1. Admin update status laporan
2. User harus terima toast + sound + real-time update

### Test Status Layanan
1. Admin update status layanan
2. User harus terima toast + sound + real-time update

## Component Lifecycle Issues

### Rapid Remounting Problem
**Masalah:** Setiap ketik huruf di input balasan, component unmount/mount berulang

**Solusi:**
1. **Increased delay** - 300ms → 500ms untuk Socket initialization
2. **Prevent rapid remount** - Interval check setiap 1 detik untuk memperbaiki socket reference
3. **Foreign key constraint fix** - Remove `balasanId` dari notifikasi untuk sementara

### Debug Logs yang Diperbaiki
```
useSocket: Socket exists but ref is null, fixing reference...
Status layanan notification sent: { layananId: "xxx", status: "xxx", notifikasiId: "xxx" }
```

## Future Improvements

1. **Notification Queue** - Handle offline users
2. **Notification History** - Track delivered notifications
3. **User Preferences** - Allow disable sound/toast per user
4. **Batch Notifications** - Reduce frequency for multiple updates
5. **Push Notifications** - Extend to mobile push notifications
6. **Status Tracking** - Visual timeline untuk status changes
7. **Component Stability** - Prevent rapid remounting pada input fields
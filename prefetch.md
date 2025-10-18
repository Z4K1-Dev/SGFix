# Rencana Implementasi Prefetch & Cache Management

## 🎯 **Tujuan Utama**
Mengimplementasikan sistem prefetch dan cache management untuk meningkatkan performa navigasi antar halaman (berita, laporan, layanan) dengan:
- TTL 60 menit untuk data freshness
- Memory limit untuk mencegah over-cache
- Error handling untuk prefetch failures
- Cache invalidation saat user manual refresh atau ada notifikasi baru

## 📋 **Rencana Implementasi**

### **1. Cache Management System**
**File:** `src/lib/cache-manager.ts`

**Fitur:**
- Class CacheManager dengan TTL 60 menit
- Memory limit (maksimum 50 items)
- Auto cleanup expired items
- Event broadcasting untuk cache updates
- LRU eviction saat memory limit tercapai

**Struktur:**
```typescript
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // 60 menit default
}

class CacheManager {
  private cache: Map<string, CacheItem>
  private config: CacheConfig
  
  // Methods: set, get, delete, has, cleanup, evictOldest
  // Event broadcasting: cache-updated, cache-invalidated
}
```

### **2. Prefetch di Home Page**
**File:** `src/app/page.tsx`

**Implementasi:**
- Prefetch data setelah home loading selesai
- Prefetch 3 halaman: berita, laporan, layanan
- Error handling untuk prefetch failures
- Logging untuk monitoring

**Struktur:**
```typescript
useEffect(() => {
  if (!loading && mounted) {
    // Prefetch all pages
    Promise.all([
      prefetchPageData('/berita', '/api/berita?published=true'),
      prefetchPageData('/laporan', '/api/laporan'),
      prefetchPageData('/layanan', '/api/layanan')
    ]).then(() => {
      console.log('✅ All pages prefetched')
    }).catch(error => {
      console.error('❌ Prefetch failed:', error)
    })
  }
}, [loading, mounted])
```

### **3. Cache Invalidation pada Notifikasi**
**File:** `src/app/page.tsx` (socket listeners)

**Implementasi:**
- Update cache berdasarkan tipe notifikasi
- Auto refetch data terbaru
- Broadcast update ke semua components

**Struktur:**
```typescript
const handleNotif = (data: any) => {
  // Update cache berdasarkan tipe notifikasi
  if (data.tipe === 'BERITA_BARU') {
    invalidateCache('/berita')
    refetchPageData('/berita', '/api/berita?published=true')
  }
  
  if (data.tipe === 'LAPORAN_BARU' || data.tipe === 'LAPORAN_UPDATE') {
    invalidateCache('/laporan')
    refetchPageData('/laporan', '/api/laporan')
  }
  
  if (data.tipe === 'LAYANAN_BARU' || data.tipe === 'LAYANAN_UPDATE') {
    invalidateCache('/layanan')
    refetchPageData('/layanan', '/api/layanan')
  }
  
  // Show notification
  appToast({
    title: data?.judul || 'Notifikasi',
    description: data?.pesan || 'Pesan masuk',
  })
}
```

### **4. Cache Sync di Page Components**
**Files:** 
- `src/app/berita/page.tsx`
- `src/app/laporan/page.tsx`
- `src/app/layanan/page.tsx`

**Implementasi:**
- Load data dari cache atau fetch baru
- Listen untuk cache updates
- Auto refresh saat cache invalidated

**Struktur:**
```typescript
export default function BeritaPage() {
  const [berita, setBerita] = useState<Berita[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    // Load dari cache atau fetch baru
    const loadBerita = async () => {
      const cached = pageCache.get('/berita')
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        setBerita(cached.data)
        setIsDataLoaded(true)
        return
      }
      
      // Fetch baru jika tidak ada cache
      try {
        const res = await fetch('/api/berita?published=true')
        if (res.ok) {
          const data = await res.json()
          setBerita(data)
          pageCache.set('/berita', {
            data,
            timestamp: Date.now(),
            ttl: 60 * 60 * 1000 // 60 menit
          })
        }
      } finally {
        setIsDataLoaded(true)
      }
    }

    loadBerita()

    // Listen untuk cache updates
    const handleCacheUpdate = (event: CustomEvent) => {
      if (event.detail.key === '/berita') {
        setBerita(event.detail.data)
      }
    }

    const handleCacheInvalidate = (event: CustomEvent) => {
      if (event.detail.key === '/berita') {
        loadBerita() // Refetch otomatis
      }
    }

    window.addEventListener('cache-updated', handleCacheUpdate as EventListener)
    window.addEventListener('cache-invalidated', handleCacheInvalidate as EventListener)

    return () => {
      window.removeEventListener('cache-updated', handleCacheUpdate as EventListener)
      window.removeEventListener('cache-invalidated', handleCacheInvalidate as EventListener)
    }
  }, [])
}
```

## 🔄 **Flow Cache Update Real-Time**

### **Scenario 1: Berita Baru Ditambahkan**
1. **Admin publish berita baru** → Socket emit `BERITA_BARU`
2. **User terima notifikasi** → Cache `/berita` di-invalidate
3. **Auto refetch** → Data berita di-update
4. **Cache ter-sync** → Semua components menggunakan data terbaru

### **Scenario 2: User di Halaman Berita**
1. **Berita baru masuk** → Cache update
2. **User di halaman berita** → Component auto-update
3. **No refresh needed** → Data muncul dengan transisi smooth

### **Scenario 3: User Manual Refresh**
1. **User refresh halaman** → Cache di-invalidate
2. **Fresh data fetched** → Cache di-update
3. **Latest data displayed** → User dapat data terbaru

## 🛠️ **Utility Functions**

### **Prefetch Functions**
```typescript
// Prefetch data untuk halaman tertentu
export async function prefetchPageData(page: string, api: string): Promise<void>

// Invalidate cache untuk halaman tertentu
export function invalidatePageCache(page: string): void

// Refetch data untuk halaman tertentu dan update cache
export async function refetchPageData(page: string, api: string): Promise<void>
```

### **Cache Management**
```typescript
// Setup cache cleanup interval
export function setupCacheCleanup(intervalMs: number = 5 * 60 * 1000): void

// Get cache statistics
export function getCacheStats(): CacheStats
```

## 📊 **Manfaat Implementasi**

### **Performance:**
- **Instant navigation** - Data sudah tersedia di cache
- **Reduced API calls** - Tidak perlu fetch ulang saat navigasi
- **Better perceived performance** - User merasa aplikasi sangat responsif

### **User Experience:**
- **Seamless transitions** - Tidak ada jeda saat pindah page
- **Consistent loading** - Data fresh dengan TTL management
- **Progressive enhancement** - Cache sebagai fallback

### **Resource Management:**
- **Memory efficient** - LRU eviction dengan memory limit
- **Bandwidth optimized** - Hanya fetch yang diperlukan
- **Error resilient** - Graceful handling untuk prefetch failures

## 🎯 **Prioritas Implementasi**

1. **High Priority:** Cache Manager class
2. **High Priority:** Prefetch di home page
3. **Medium Priority:** Cache invalidation pada notifikasi
4. **Medium Priority:** Cache sync di page components

## 📝 **Catatan Implementasi**

- Gunakan singleton pattern untuk global cache
- Implementasi event system untuk real-time sync
- Tambahkan logging untuk monitoring cache performance
- Consider localStorage untuk cache persistence (opsional)
- Test dengan berbagai skenario (slow network, error, etc.)

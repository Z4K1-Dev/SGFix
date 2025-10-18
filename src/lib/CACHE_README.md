# Cache Management System

Sistem cache management yang telah diimplementasikan untuk meningkatkan performa navigasi antar halaman dengan fitur prefetch dan cache synchronization.

## 📁 File Structure

```
src/lib/
├── cache-manager.ts     # Core cache manager class
├── cache-utils.ts       # Centralized exports dan utilities
└── CACHE_README.md      # Dokumentasi ini

src/hooks/
└── usePageCache.ts      # Custom hooks untuk React integration
```

## 🚀 Fitur Utama

### 1. Cache Manager (`cache-manager.ts`)
- **TTL (Time To Live)**: 60 menit default untuk data freshness
- **Memory Limit**: Maksimum 50 items dengan LRU eviction
- **Auto Cleanup**: Automatic cleanup expired items setiap 5 menit
- **Event Broadcasting**: Real-time cache updates via CustomEvents
- **LRU Eviction**: Least Recently Used algorithm untuk memory management

### 2. Custom Hooks (`usePageCache.ts`)
- **usePageCache**: Hook untuk cache management di components
- **usePrefetchPages**: Hook untuk prefetch multiple pages
- **useCacheStats**: Hook untuk monitoring cache statistics

### 3. Utilities (`cache-utils.ts`)
- Centralized exports untuk kemudahan penggunaan
- Helper functions untuk batch operations
- Configuration constants
- Initialization dan cleanup functions

## 📖 Penggunaan

### Basic Usage dengan Custom Hook

```typescript
import { usePageCache } from '@/lib/cache-utils'

function MyComponent() {
  const { data, loading, error, refetch, isFromCache } = usePageCache({
    cacheKey: '/berita',
    apiEndpoint: '/api/berita?published=true',
    ttl: 60 * 60 * 1000 // 60 menit
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <p>Data from cache: {isFromCache ? 'Yes' : 'No'}</p>
      {/* Render data */}
    </div>
  )
}
```

### Manual Cache Management

```typescript
import { 
  pageCache, 
  prefetchPageData, 
  invalidatePageCache, 
  refetchPageData 
} from '@/lib/cache-utils'

// Prefetch data
await prefetchPageData('/berita', '/api/berita?published=true')

// Get data dari cache
const data = pageCache.get('/berita')

// Invalidate cache
invalidatePageCache('/berita')

// Refetch dan update cache
await refetchPageData('/berita', '/api/berita?published=true')
```

### Prefetch Multiple Pages

```typescript
import { usePrefetchPages, CACHE_CONFIG } from '@/lib/cache-utils'

function HomePage() {
  const { prefetchAll } = usePrefetchPages(CACHE_CONFIG.PREFETCH_PAGES)

  useEffect(() => {
    // Prefetch semua halaman utama
    prefetchAll()
  }, [])

  return <div>Home Page</div>
}
```

## 🔄 Cache Update Flow

### Scenario 1: Real-time Updates via Socket
1. **Admin publish berita baru** → Socket emit `BERITA_BARU`
2. **Cache invalidation** → `invalidatePageCache('/berita')`
3. **Auto refetch** → `refetchPageData('/berita', '/api/berita?published=true')`
4. **Event broadcast** → Semua components ter-update otomatis

### Scenario 2: User Navigation
1. **User navigasi ke halaman** → Cek cache terlebih dahulu
2. **Cache hit** → Tampilkan data dari cache (instant)
3. **Cache miss** → Fetch dari API dan simpan ke cache

### Scenario 3: Manual Refresh
1. **User refresh halaman** → Cache di-invalidate
2. **Fresh data fetched** → Cache di-update dengan data terbaru

## 🎯 Best Practices

### 1. Cache Key Naming
Gunakan path-based naming untuk konsistensi:
```typescript
// ✅ Good
'/berita'
'/pengaduan'
'/layanan'

// ❌ Avoid
'berita-data'
'pengaduan-list'
```

### 2. TTL Configuration
Sesuaikan TTL dengan karakteristik data:
```typescript
// Data yang sering berubah (5-15 menit)
pageCache.set('/notifications', data, 5 * 60 * 1000)

// Data yang jarang berubah (1-2 jam)
pageCache.set('/berita', data, 2 * 60 * 60 * 1000)

// Data statis (24 jam)
pageCache.set('/settings', data, 24 * 60 * 60 * 1000)
```

### 3. Error Handling
Selalu wrap cache operations dengan error handling:
```typescript
try {
  await refetchPageData('/berita', '/api/berita?published=true')
} catch (error) {
  console.error('Failed to refetch:', error)
  // Fallback ke cache lama atau show error message
}
```

### 4. Memory Management
Monitor cache usage untuk optimal performance:
```typescript
import { useCacheStats } from '@/lib/cache-utils'

function CacheMonitor() {
  const stats = useCacheStats()
  
  return (
    <div>
      <p>Cache size: {stats.size}/{stats.maxItems}</p>
      <p>Memory usage: {stats.memoryUsage}</p>
    </div>
  )
}
```

## 🔧 Configuration

### Default Configuration
```typescript
const CACHE_CONFIG = {
  DEFAULT_TTL: 60 * 60 * 1000,        // 60 menit
  MAX_ITEMS: 50,                      // Maksimum items
  CLEANUP_INTERVAL: 5 * 60 * 1000,    // 5 menit
  PREFETCH_PAGES: [
    { cacheKey: '/berita', apiEndpoint: '/api/berita?published=true' },
    { cacheKey: '/pengaduan', apiEndpoint: '/api/pengaduan' },
    { cacheKey: '/layanan', apiEndpoint: '/api/layanan' }
  ]
}
```

### Custom Configuration
```typescript
import { CacheManager } from '@/lib/cache-manager'

const customCache = new CacheManager({
  maxItems: 100,
  defaultTtl: 30 * 60 * 1000, // 30 menit
  cleanupInterval: 2 * 60 * 1000 // 2 menit
})
```

## 📊 Monitoring

### Cache Statistics
```typescript
import { getCacheStats } from '@/lib/cache-utils'

const stats = getCacheStats()
console.log('Cache Stats:', stats)
// Output: { size: 15, maxItems: 50, keys: [...], memoryUsage: "2.5 KB" }
```

### Expiring Items
```typescript
import { getSoonToExpirePages } from '@/lib/cache-utils'

const expiringSoon = getSoonToExpirePages()
console.log('Pages expiring soon:', expiringSoon)
```

## 🚨 Troubleshooting

### Common Issues

1. **Cache tidak ter-update**
   - Pastikan event listeners ter-setup dengan benar
   - Cek console untuk error logs
   - Verify cache key consistency

2. **Memory usage tinggi**
   - Kurangi `maxItems` configuration
   - Perkecil TTL untuk data yang sering berubah
   - Monitor cache stats regularly

3. **Prefetch gagal**
   - Cek network connectivity
   - Verify API endpoints
   - Pastikan error handling tidak blocking

### Debug Logging
Enable debug logging untuk troubleshooting:
```typescript
// Di browser console
localStorage.setItem('cache-debug', 'true')

// Atau di code
console.log('[Cache] Debug:', pageCache.getStats())
```

## 🔄 Migration dari Cache Lama

Jika migrasi dari cache system lama:

1. **Backup existing cache** (jika perlu)
2. **Update imports** ke new cache system
3. **Replace cache calls** dengan new API
4. **Test thoroughly** di development environment
5. **Gradual rollout** ke production

## 📝 Performance Tips

1. **Prefetch strategis**: Hanya prefetch halaman yang sering diakses
2. **TTL optimization**: Sesuaikan dengan data update frequency
3. **Memory monitoring**: Regular monitoring cache stats
4. **Error resilience**: Graceful fallback untuk cache failures
5. **Batch operations**: Gunakan batch functions untuk multiple operations

## 🎉 Benefits

### Performance Improvements
- **Instant navigation**: Data sudah tersedia di cache
- **Reduced API calls**: Tidak perlu fetch ulang saat navigasi
- **Better perceived performance**: User merasa aplikasi sangat responsif

### User Experience
- **Seamless transitions**: Tidak ada jeda saat pindah page
- **Consistent loading**: Data fresh dengan TTL management
- **Progressive enhancement**: Cache sebagai fallback

### Resource Management
- **Memory efficient**: LRU eviction dengan memory limit
- **Bandwidth optimized**: Hanya fetch yang diperlukan
- **Error resilient**: Graceful handling untuk prefetch failures
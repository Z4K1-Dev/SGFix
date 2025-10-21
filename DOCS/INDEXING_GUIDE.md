# Panduan Indexing dan Optimasi Performa Aplikasi

## 📋 Overview

Dokumen ini menjelaskan implementasi indexing dan optimasi performa yang telah ditambahkan ke aplikasi Next.js Anda.

## 🚀 Fitur yang Telah Diimplementasikan

### 1. Database Indexing

**File:** `prisma/schema.prisma`

Index yang telah ditambahkan:

#### Tabel Kategori
- `@@index([nama])` - untuk pencarian berdasarkan nama kategori
- `@@index([createdAt])` - untuk sorting berdasarkan waktu

#### Tabel Berita
- `@@index([published])` - untuk filter berita yang dipublish
- `@@index([kategoriId])` - untuk join dengan kategori
- `@@index([createdAt])` - untuk sorting berdasarkan waktu
- `@@index([published, createdAt])` - untuk query kombinasi
- `@@index([kategoriId, published])` - untuk query kombinasi
- `@@index([views])` - untuk sorting berdasarkan views
- `@@index([likes])` - untuk sorting berdasarkan likes

#### Tabel Pengaduan
- `@@index([status])` - untuk filter berdasarkan status
- `@@index([createdAt])` - untuk sorting berdasarkan waktu
- `@@index([status, createdAt])` - untuk query kombinasi
- `@@index([latitude, longitude])` - untuk query lokasi

#### Tabel Balasan
- `@@index([pengaduanId])` - untuk join dengan pengaduan
- `@@index([createdAt])` - untuk sorting berdasarkan waktu
- `@@index([dariAdmin])` - untuk filter balasan admin
- `@@index([pengaduanId, createdAt])` - untuk query kombinasi

#### Tabel Notifikasi
- `@@index([untukAdmin])` - untuk filter notifikasi admin
- `@@index([dibaca])` - untuk filter notifikasi yang dibaca
- `@@index([tipe])` - untuk filter berdasarkan tipe
- `@@index([createdAt])` - untuk sorting berdasarkan waktu
- `@@index([untukAdmin, dibaca])` - untuk query kombinasi
- `@@index([beritaId])` - untuk join dengan berita
- `@@index([pengaduanId])` - untuk join dengan pengaduan
- `@@index([balasanId])` - untuk join dengan balasan

### 2. API Caching

**File:** `src/lib/cache.ts`

Fitur caching yang diimplementasikan:
- In-memory cache dengan TTL (Time To Live)
- Cache invalidation otomatis
- Cache statistics dan cleanup
- Higher-order function untuk API routes

**Penggunaan:**
```typescript
import { withCache, generateCacheKey } from '@/lib/cache'

// Dalam API route
export async function GET() {
  const cacheKey = generateCacheKey('/api/berita', { published: true })
  
  return withCache(cacheKey, async () => {
    // Fetch data dari database
    const data = await db.berita.findMany()
    return NextResponse.json(data)
  }, 2 * 60 * 1000) // 2 minutes cache
}
```

### 3. Optimized Database Queries

**File:** `src/lib/db-optimized.ts`

Query yang dioptimalkan:
- Pagination dengan proper indexing
- Batch operations
- Statistics queries
- Search functionality
- Count queries untuk pagination

**Contoh penggunaan:**
```typescript
import { beritaQueries } from '@/lib/db-optimized'

// Get published berita dengan pagination
const result = await beritaQueries.getPublished(1, 10, 'kategoriId')

// Search berita
const searchResult = await beritaQueries.search('query', 1, 10)
```

### 4. Lazy Loading Components

**Files:**
- `src/components/lazy/berita-card.tsx`
- `src/components/lazy/pengaduan-card.tsx`
- `src/hooks/useInfiniteScroll.ts`

Fitur lazy loading:
- Suspense boundaries dengan loading skeletons
- Infinite scroll dengan Intersection Observer
- Virtualized lists untuk performa optimal

### 5. Performance Monitoring

**Files:**
- `src/lib/db-monitoring.ts`
- `src/app/api/monitoring/route.ts`

Fitur monitoring:
- Query performance tracking
- Slow query detection
- Cache statistics
- Performance recommendations

## 🛠️ Cara Penggunaan

### Setup Indexing

1. Jalankan script setup indexing:
```bash
npm run db:setup-indexing
```

2. Generate Prisma client:
```bash
npm run db:generate
```

3. Push schema ke database:
```bash
npm run db:push
```

### Menggunakan Optimized API

Gunakan endpoint yang dioptimalkan:
- `/api/berita/optimized` - untuk berita dengan pagination
- `/api/pengaduan/optimized` - untuk pengaduan dengan pagination

### Monitoring Performa

1. Lihat report monitoring:
```bash
npm run db:monitor
```

2. Lihat statistik query:
```bash
npm run db:stats
```

3. Access via API:
```bash
GET /api/monitoring
```

### Implementasi Lazy Loading

```typescript
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import BeritaCard from '@/components/lazy/berita-card'

const { data, loading, hasMore, lastElementRef } = useInfiniteScroll({
  fetchData: async (page) => {
    const response = await fetch(`/api/berita/optimized?page=${page}`)
    const result = await response.json()
    return result.data
  }
})

// Render dengan lazy loading
{data.map((item, index) => (
  <div key={item.id} ref={index === data.length - 1 ? lastElementRef : null}>
    <BeritaCard item={item} />
  </div>
))}
```

## 📊 Expected Performance Improvements

### Database Performance
- **50-80% faster query response** dengan proper indexing
- **Reduced database load** dengan caching
- **Better scalability** untuk data yang lebih besar

### Frontend Performance
- **Faster initial load** dengan lazy loading
- **Smoother scrolling** dengan virtualized lists
- **Better user experience** dengan loading states

### API Performance
- **Reduced response time** dengan caching
- **Lower server load** dengan optimized queries
- **Better resource utilization** dengan pagination

## 🔧 Konfigurasi

### Cache TTL Settings
- Berita: 2 menit
- Pengaduan: 1 menit
- Notifikasi: 30 detik

### Monitoring Thresholds
- Slow query: > 1000ms
- Good performance: < 500ms
- Excellent performance: < 100ms

## 🚨 Troubleshooting

### Common Issues

1. **Index tidak bekerja**
   - Pastikan `npm run db:push` telah dijalankan
   - Check database connection

2. **Cache tidak bekerja**
   - Pastikan `src/lib/cache.ts` diimport dengan benar
   - Check cache key generation

3. **Lazy loading tidak bekerja**
   - Pastikan `Suspense` boundary di-setup dengan benar
   - Check Intersection Observer support

### Debug Commands

```bash
# Check database connection
npm run db:push

# Check cache stats
curl http://localhost:3000/api/monitoring

# Clear cache
curl -X DELETE http://localhost:3000/api/monitoring

# Check query performance
npm run db:stats
```

## 📈 Best Practices

1. **Gunakan optimized API endpoints** untuk production
2. **Monitor performa secara berkala** dengan `/api/monitoring`
3. **Implementasi lazy loading** untuk lists yang panjang
4. **Gunakan caching** untuk data yang tidak sering berubah
5. **Optimalkan query** dengan proper indexing

## 🔄 Maintenance

### Weekly Tasks
- Check performance reports
- Clear cache jika needed
- Monitor slow queries

### Monthly Tasks
- Review indexing strategy
- Update cache TTL settings
- Optimize queries based on usage patterns

## 📚 Additional Resources

- [Prisma Indexing Documentation](https://www.prisma.io/docs/concepts/components/orm/indexing)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Lazy Loading Best Practices](https://react.dev/reference/react/lazy)
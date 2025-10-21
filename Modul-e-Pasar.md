# Modul e-Pasar - E-Commerce untuk Komunitas Lokal

## 📋 Overview

Modul e-Pasar adalah fitur e-commerce sederhana yang dirancang khusus untuk komunitas lokal dengan fokus pada:
- **User-friendly**: Submission produk multi-step dengan gambar
- **Admin-managed**: Review dan approval system
- **WhatsApp Integration**: Direct order via WA
- **Mobile-First**: Optimized untuk mobile experience (412px width)

---

## 🗄️ Database Schema

### Model Tambahan

```prisma
model KategoriProduk {
  id          String   @id @default(cuid())
  nama        String   @unique
  deskripsi   String?
  icon        String?  // Optional icon URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  produk      Produk[]
  
  @@index([nama])
  @@index([createdAt])
}

model Produk {
  id           String        @id @default(cuid())
  judul        String
  deskripsi    String
  harga        Float
  stok         Int           @default(0)
  kategoriId   String
  gambar       String[]      // Array image URLs (max 5)
  status       StatusProduk  @default(PENDING)
  dariAdmin    Boolean       @default(false)
  views        Int           @default(0) // Page view counter
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  kategori     KategoriProduk @relation(fields: [kategoriId], references: [id])
  pesanan      Pesanan[]
  notifikasi   Notifikasi[]
  
  @@index([kategoriId])
  @@index([status])
  @@index([dariAdmin])
  @@index([createdAt])
  @@index([views])
  @@index([status, createdAt])
}

model Pesanan {
  id         String       @id @default(cuid())
  produkId   String
  nama       String
  nomorWA    String       // Format: 62xxx
  jumlah     Int          @default(1)
  total      Float
  status     StatusPesanan @default(BARU)
  pesan      String?      // Optional message from buyer
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  produk     Produk       @relation(fields: [produkId], references: [id])
  
  @@index([produkId])
  @@index([nama])
  @@index([status])
  @@index([createdAt])
}

// Enums
enum StatusProduk {
  DRAFT        // Draft admin (belum tersedia)
  PENDING      // Pending review dari user submission
  APPROVED     // Approved dan aktif di marketplace
  REJECTED     // Rejected oleh admin
  ACTIVE       // Aktif di marketplace
  INACTIVE     // Non-aktif (dihapus admin)
}

enum StatusPesanan {
  BARU         // Order baru
  DIPROSES     // Sedang diproses penjual
  SELESAI      // Transaksi selesai
  BATAL        // Order dibatalkan
}

// Update existing Notifikasi enum
enum TipeNotif {
  // Existing enums...
  PRODUK_PENGGUNAJUAN_BARU
  PRODUK_PENGGUNAJUAN_DITERIMA
  PRODUK_PENGGUNAJUAN_DITOLAK
  PRODUK_BARU_ADMIN
  PESANAN_BARU
}
```

### Kategori Produk Fixed List

```typescript
const PRODUCT_CATEGORIES = [
  { id: 'sembako', nama: 'Sembako', icon: 'ShoppingBasket' },
  { id: 'kerajinan', nama: 'Kerajinan', icon: 'Palette' },
  { id: 'properti', nama: 'Properti', icon: 'Home' },
  { id: 'peternakan', nama: 'Peternakan', icon: 'Cow' },
  { id: 'pertanian', nama: 'Pertanian', icon: 'Wheat' },
  { id: 'perkebunan', nama: 'Perkebunan', icon: 'TreePine' },
  { id: 'makanan_minuman', nama: 'Makanan & Minuman', icon: 'Utensils' },
  { id: 'keperluan_pribadi', nama: 'Keperluan Pribadi', icon: 'User' },
  { id: 'kendaraan', nama: 'Kendaraan', icon: 'Car' },
  { id: 'hasil_laut', nama: 'Hasil Laut', icon: 'Fish' },
  { id: 'elektronik', nama: 'Elektronik', icon: 'Smartphone' }
]
```

**Lucide Icon Imports:**
```typescript
import { 
  ShoppingBasket, Palette, Home, Cow, Wheat, TreePine, 
  Utensils, User, Car, Fish, Smartphone 
} from 'lucide-react'
```

---

## 📱 User Flow

### 1. User Submission Flow
```
User → Multi-step Form → Review → Submit → Admin Review → Notification → Product Active
```

**Steps:**
1. **Step 1**: Pilih Kategori Produk
2. **Step 2**: Informasi Produk (Judul, Deskripsi, Harga, Stok)
3. **Step 3**: Upload Gambar (max 5, max 10MB each)
4. **Step 4**: Review & Submit
5. **Admin Review**: Approve/Reject
6. **Notification**: User menerima notifikasi
7. **Product Active**: Produk muncul di marketplace

### 2. Admin Creation Flow
```
Admin → Create Product Directly → Active Immediately
```

### 3. Order Flow
```
User → View Product → Click Order → WhatsApp Integration → Call/Chat Options
```

### 4. Prefetching & Caching Strategy
```
App Load → Prefetch e-Pasar Data (6 latest items) → Cache First → API Fallback → Manual Refresh Invalidation
```

**Cache Strategy:**
- **Initial Load**: Prefetch 6 latest products from cache
- **Cache Miss**: Fetch from API and update cache
- **Manual Refresh**: Invalidate cache and refetch
- **Socket Updates**: Invalidate cache on product changes
- **TTL**: 5 minutes for products, 1 minute for categories

---

## 🚀 API Endpoints

### Produk API
```typescript
// GET /api/epasar/produk
// GET /api/epasar/produk?kategori=sembako
// GET /api/epasar/produk?status=ACTIVE
// GET /api/epasar/produk?sort=terbaru
// GET /api/epasar/produk?sort=terlama
// GET /api/epasar/produk?search=laptop

// POST /api/epasar/produk (admin only)
// PUT /api/epasar/produk/[id] (admin only)
// DELETE /api/epasar/produk/[id] (admin only)
// PUT /api/epasar/produk/[id]/status (admin only)
```

### 2. Kategori API
```typescript
// GET /api/epasar/kategori
// POST /api/epasar/kategori (admin only)
```

### 3. Prefetching & Caching API
```typescript
// GET /api/epasar/prefetch/products (6 latest products)
// GET /api/epasar/prefetch/categories (all categories)
// POST /api/epasar/cache/invalidate/products (manual refresh)
```

### 4. Pesanan API
```typescript
// GET /api/epasar/pesanan
// POST /api/epasar/pesanan/create
// GET /api/epasar/pesanan/[id]
```

### 5. Submission API
```typescript
// POST /api/epasar/produk/submit (user submission)
// GET /api/epasar/produk/submissions (admin review)
```

---

## 🎨 UI Components

### 1. Multi-step Form (User Submission)
```typescript
interface ProductFormData {
  step: 1 | 2 | 3 | 4
  kategoriId: string
  judul: string
  deskripsi: string
  harga: number
  stok: number
  gambar: File[] // max 5 files, 10MB each
}

// Step 1: Kategori Selection
- Grid of categories with icons
- Search functionality
- Validation: must select one category

// Step 2: Product Information
- Title input (required)
- Description textarea (required)
- Price input (Rp format, required)
- Stock input (number, required)

// Step 3: Image Upload
- Drag & drop interface
- Preview thumbnails
- File size validation (max 10MB)
- File type validation (jpg, png, webp)
- Progress indicators
- Remove individual images

// Step 4: Review & Submit
- Summary of all entered data
- Image preview gallery
- Submit button
- Back navigation
```

### 2. Product Listing
```typescript
interface ProductCardProps {
  id: string
  judul: string
  harga: number
  gambar: string[]
  kategori: string
  views: number
  status: StatusProduk
  dariAdmin: boolean
}

// Features:
- Image carousel (swipeable)
- Category badge with Lucide icon
- Price display (Rp format)
- View counter
- Order button (WhatsApp integration)
- Status indicator

// Icon Usage:
import { 
  ShoppingCart, Eye, Package, CheckCircle, XCircle, Clock 
} from 'lucide-react'

// Status Icons:
const StatusIcon = ({ status }: { status: StatusProduk }) => {
  switch (status) {
    case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />
    case 'REJECTED': return <XCircle className="h-4 w-4 text-red-500" />
    default: return <Package className="h-4 w-4 text-gray-500" />
  }
}
```

### 3. WhatsApp Integration
```typescript
interface WhatsAppOrderProps {
  produkId: string
  produkJudul: string
  harga: number
  nomorWA: string // Format: 62xxx
}

// Components:
- WhatsApp Button with Call/Chat options
- Pre-filled message template
- Phone number validation (62xxx format)
- Fallback to WhatsApp Web if app not available

// Icon Usage:
import { Phone, MessageCircle, WhatsApp } from 'lucide-react'

// WhatsApp Action Buttons:
const WhatsAppActions = ({ nomorWA }: { nomorWA: string }) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={`tel:${nomorWA}`} className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Call
        </a>
      </Button>
      <Button variant="default" size="sm" asChild>
        <a 
          href={`https://wa.me/${nomorWA}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </a>
      </Button>
    </div>
  )
}
```

### 4. Admin Panel
```typescript
interface AdminProductManagementProps {
  search: string
  kategoriFilter: string
  statusFilter: StatusProduk
  sortOption: 'terbaru' | 'terlama' | 'termurah' | 'termahal'
}

// Features:
- Advanced search with filters
- Category dropdown
- Status filter (All, Pending, Approved, Rejected, Active)
- Sort options (newest, oldest, cheapest, most expensive)
- Bulk actions (approve, reject, delete)
- View statistics
- Quick edit inline

// Icon Usage:
import { 
  Search, Filter, CheckCircle, XCircle, Clock, Edit, Trash2, 
  SortAsc, SortDesc, BarChart3, Users, ShoppingCart 
} from 'lucide-react'

// Admin Action Buttons:
const AdminActions = ({ productId, status }: { productId: string; status: StatusProduk }) => {
  const handleApprove = () => { /* approve logic */ }
  const handleReject = () => { /* reject logic */ }
  const handleDelete = () => { /* delete logic */ }

  return (
    <div className="flex gap-1">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleApprove}
        disabled={status === 'ACTIVE'}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Approve
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleReject}
        disabled={status === 'REJECTED'}
      >
        <XCircle className="h-4 w-4 mr-1" />
        Reject
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  )
}
```

### 5. Cache Management Components
```typescript
interface EPasarCacheManagerProps {
  cacheKey: string
  ttl: number
  onRefresh: () => void
  children: (data: any, isLoading: boolean) => React.ReactNode
}

// Features:
- Automatic cache checking
- Fallback to API on cache miss
- Manual refresh button
- Loading states
- Error handling
- Socket-based cache invalidation

// Icon Usage:
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

// Cache Status Indicator:
const CacheStatus = ({ hasCache, isLoading }: { hasCache: boolean; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }
  
  if (hasCache) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">From Cache</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2 text-blue-600">
      <Wifi className="h-4 w-4" />
      <span className="text-sm">From API</span>
    </div>
  )
}
```

### 6. Navigation Tab Integration
```typescript
interface NavigationTabProps {
  icon: keyof typeof LucideIcons // Lucide icon component name
  label: string
  badge?: number
  isActive: boolean
  onClick: () => void
}

// Integration with existing MobileLayout:
- Add e-Pasar tab to bottom navigation
- Use ShoppingCart icon from lucide-react
- Optional badge for pending submissions
- Consistent styling with existing tabs

// Navigation Tabs Configuration:
const navigationTabs = [
  { id: 'beranda', icon: 'Home', label: 'Beranda' },
  { id: 'berita', icon: 'Newspaper', label: 'Berita' },
  { id: 'pengaduan', icon: 'FileText', label: 'Pengaduan' },
  { id: 'layanan', icon: 'ClipboardList', label: 'Layanan' },
  { id: 'epasar', icon: 'ShoppingCart', label: 'e-Pasar', badge: pendingCount }, // NEW: e-Pasar tab
  { id: 'profile', icon: 'User', label: 'Profil' },
]

// Lucide Icon Imports for Navigation:
import { 
  Home, Newspaper, FileText, ClipboardList, ShoppingCart, User 
} from 'lucide-react'
```

---

## 📊 Dashboard Analytics

### Statistics Component
```typescript
interface EPasarStats {
  totalProduk: number
  totalPesanan: number
  totalViews: number
  kategoriStats: Array<{
    nama: string
    count: number
    icon: string
  }>
}

// Chart Implementation:
- Bar chart using recharts
- X-axis: Categories (11 categories)
- Y-axis: Product count
- Legend: Category icons
- Color coding by category
- Responsive design
```

### Analytics Features:
1. **Overview Cards**:
   - Total Products
   - Total Orders
   - Total Views
   - Pending Submissions

2. **Category Distribution**:
   - Bar chart showing products per category
   - Percentage breakdown
   - Clickable segments for filtering

3. **Performance Metrics**:
   - Most viewed products
   - Most ordered products
   - Category popularity trends

### 4. Cache Analytics
```typescript
interface CacheAnalytics {
  hitRate: number
  missRate: number
  averageResponseTime: number
  totalRequests: number
  invalidatedRequests: number
}

// Features:
- Real-time cache performance monitoring
- Hit/miss ratio tracking
- Response time analysis
- Cache invalidation logging
- Optimization recommendations
```

---

## 🚀 Implementation Steps

### Phase 1: Database Setup
1. Update Prisma schema with new models
2. Create and run migrations
3. Seed initial categories
4. Setup database indexes

### Phase 2: Core Features
1. Product listing page
2. Product detail page
3. Multi-step form for submissions
4. Admin product management
5. WhatsApp integration

### Phase 3: Advanced Features
1. Search and filtering
2. Analytics dashboard
3. Notification system
4. **Cache management with prefetching**
5. Mobile optimization

### Phase 4: Polish & Testing
1. UI/UX improvements
2. Error handling
3. Loading states
4. Responsive testing
5. Performance testing

### Phase 5: Integration
1. **Add e-Pasar tab to navigation**
2. **Implement prefetching system**
3. **Socket integration for real-time updates**
4. **Cache invalidation on manual refresh**

---

## 📱 Page Structure

### Main Pages:
- `/epasar` - Product listing (main page)
- `/epasar/[id]` - Product detail page
- `/epasar/submit` - Multi-step submission form
- `/epasar/admin` - Admin management panel

### Cache Implementation:
```typescript
// Cache Keys:
- 'epasar:products:latest' (6 latest products, 5min TTL)
- 'epasar:products:all' (all products, 5min TTL)
- 'epasar:categories' (all categories, 1min TTL)
- 'epasar:search:query' (search results, 2min TTL)

// Prefetch Strategy:
- On app load: Prefetch categories + 6 latest products
- On tab switch: Prefetch relevant data
- On manual refresh: Invalidate cache and refetch
- On socket update: Invalidate affected cache keys
```

### Navigation Integration:
```typescript
// MobileLayout Navigation Tabs:
const navigationTabs = [
  { id: 'beranda', icon: Home, label: 'Beranda' },
  { id: 'berita', icon: Newspaper, label: 'Berita' },
  { id: 'pengaduan', icon: FileText, label: 'Pengaduan' },
  { id: 'layanan', icon: ClipboardList, label: 'Layanan' },
  { id: 'epasar', icon: ShoppingCart, label: 'e-Pasar', badge: pendingCount }, // NEW: e-Pasar tab
  { id: 'profile', icon: User, label: 'Profil' },
]

// Lucide Icon Imports for Navigation:
import { 
  Home, Newspaper, FileText, ClipboardList, ShoppingCart, User 
} from 'lucide-react'

// Tab Component with Icon:
const NavigationTab = ({ icon: Icon, label, isActive, badge, onClick }: NavigationTabProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-lg transition-colors ${
        isActive 
          ? 'text-primary bg-primary/10' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}
```

---

## 🔧 Technical Implementation Details

### Cache Manager Hook:
```typescript
function useEPasarCache(cacheKey: string, ttl: number) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const fetchFromCache = async () => {
    const cached = pageCache.get(cacheKey)
    if (cached) {
      setData(cached)
      return cached
    }
    return null
  }
  
  const fetchFromAPI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/epasar/${cacheKey.split(':')[1]}`)
      const freshData = await response.json()
      pageCache.set(cacheKey, freshData, ttl)
      setData(freshData)
      return freshData
    } catch (error) {
      console.error('API fetch failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  const refresh = async () => {
    pageCache.invalidate(cacheKey)
    return fetchFromAPI()
  }
  
  return { data, isLoading, refresh, fetchFromCache, fetchFromAPI }
}
```

### Socket Integration for Cache:
```typescript
// Socket Listeners:
const handleProductUpdate = (data: any) => {
  // Invalidate related cache keys
  pageCache.invalidate('epasar:products:latest')
  pageCache.invalidate('epasar:products:all')
  pageCache.invalidate('epasar:search:query')
  
  // Show notification if needed
  if (data.type === 'PRODUCT_APPROVED' || data.type === 'PRODUCT_REJECTED') {
    showNotification(data)
  }
}

// Connection setup:
const socket = connectSocket('user')
socket.on('product-update', handleProductUpdate)
```

### Manual Refresh Implementation:
```typescript
// Pull-to-refresh functionality:
const handlePullToRefresh = async () => {
  setIsRefreshing(true)
  try {
    await Promise.all([
      pageCache.invalidate('epasar:products:latest'),
      pageCache.invalidate('epasar:products:all'),
      pageCache.invalidate('epasar:categories')
    ])
    
    // Refetch data
    await Promise.all([
      fetch('/api/epasar/prefetch/products'),
      fetch('/api/epasar/prefetch/categories')
    ])
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    setIsRefreshing(false)
  }
}
```

---

## 📱 Mobile Optimization

### Design Specifications:
- **Max Width**: 412px (consistent with existing app)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Scrolling**: Smooth scrolling with hidden scrollbars
- **Images**: Optimized loading with lazy loading
- **Forms**: Mobile-friendly input validation
- **WhatsApp**: Deep link integration

### Performance Considerations:
- Image compression on upload
- Lazy loading for product images
- Infinite scroll for product listing
- Cache management for categories
- Optimized API calls

---

## 🔒 Security & Validation

### Input Validation:
- **Phone Number**: Regex validation for 62xxx format
- **Price**: Number validation with minimum/maximum limits
- **Images**: File type, size, and count validation
- **Text**: XSS prevention, length limits
- **Category**: Whitelist validation

### Admin Access:
- Role-based access control
- Input sanitization for admin forms
- Audit logging for product changes
- Rate limiting for API endpoints

---

## 🚀 Integration with Existing System

### Database Integration:
- Extend existing `Notifikasi` model
- Use existing database connection
- Maintain consistent naming conventions
- Optimize queries with existing indexes

### UI Integration:
- Use existing MobileLayout component
- Consistent styling with shadcn/ui
- Reuse existing UI components
- Follow existing color scheme

### Real-time Features:
- Socket.io integration for notifications
- Cache invalidation on product changes
- Real-time view counter updates
- Live status updates

---

## 📝 Testing Checklist

### Functionality Testing:
- [ ] Multi-step form navigation
- [ ] Image upload with validation
- [ ] Product listing with filters
- [ ] WhatsApp integration
- [ ] Admin panel features
- [ ] Search functionality
- [ ] Mobile responsiveness

### Performance Testing:
- [ ] Image upload performance
- [ ] Page load times
- [ ] Search response time
- [ ] Mobile performance
- [ ] Memory usage

### Security Testing:
- [ ] Input validation
- [ ] File upload security
- [ ] Admin access control
- [ ] XSS prevention
- [ ] Rate limiting

---

## 📈 Future Enhancements

### Phase 5 Features:
1. **User Profiles**: Optional registration for better tracking
2. **Product Reviews**: User feedback system
3. **Favorites**: Save favorite products
4. **Notifications**: Email/SMS notifications
5. **Advanced Analytics**: Sales trends, popular items
6. **Multi-language Support**: Regional language options
7. **Payment Integration**: Optional payment gateway
8. **Location-based**: Filter by proximity

### Technical Improvements:
1. **Image CDN**: Cloud storage for product images
2. **Caching Strategy**: Redis for better performance
3. **Database Optimization**: Read replicas for scaling
4. **API Rate Limiting**: Prevent abuse
5. **Monitoring**: Application performance monitoring

---

## 🎯 Success Metrics

### Key Performance Indicators:
1. **User Engagement**: Daily active users, submission rate
2. **Product Quality**: Approved vs rejected ratio
3. **Order Conversion**: Order to view ratio
4. **Performance**: Page load time, API response time
5. **Mobile Experience**: Mobile vs desktop usage ratio
6. **Admin Efficiency**: Review time, approval rate

### User Satisfaction:
- User feedback collection
- Ease of use surveys
- Bug tracking and resolution
- Feature request prioritization

---

## 📚 Documentation

### API Documentation:
- OpenAPI/Swagger documentation
- Request/response examples
- Error handling documentation
- Rate limiting information

### Admin Guide:
- User manual for admin panel
- Best practices for product review
- Troubleshooting common issues
- Performance optimization tips

---

*Modul e-Pasar dirancang untuk meningkatkan ekonomi lokal dengan platform yang mudah digunakan dan dikelola oleh komunitas.*
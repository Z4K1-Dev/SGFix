'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast as appToast } from '@/hooks/use-toast'
import { usePrefetch, debounce } from '@/lib/epasar-cache'

import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  MapPin, 
  Phone, 
  Star, 
  Store,
  Package,
  DollarSign,
  Grid,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Types
interface Produk {
  id: string
  judul: string
  deskripsi: string
  harga: number
  stok: number
  kategoriId: string
  gambar: string[]
  status: string
  dariAdmin: boolean
  views: number
  createdAt: string
  updatedAt: string
  kategori: {
    id: string
    nama: string
    deskripsi: string
    icon: string
  }
}

interface KategoriProduk {
  id: string
  nama: string
  deskripsi: string
  icon: string
}

interface ProdukListProps {
  className?: string
}

export function ProdukList({ className }: ProdukListProps) {
  const [produk, setProduk] = useState<Produk[]>([])
  const [kategori, setKategori] = useState<KategoriProduk[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKategori, setSelectedKategori] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('terbaru')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const router = useRouter()
  const { prefetchProduct } = usePrefetch()

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term)
    }, 300),
    []
  )

  // Combined data fetching with caching
  const fetchCombinedData = async (reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '12',
        search: searchTerm,
        kategori: selectedKategori === 'all' ? '' : selectedKategori,
        sort: sortBy
      })
      
      const cacheKey = `combined:${params.toString()}`
      
      // Try to get from cache first
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData && reset) {
        const { data, timestamp } = JSON.parse(cachedData)
        // Use cache if it's less than 2 minutes old
        if (Date.now() - timestamp < 2 * 60 * 1000) {
          setKategori(data.kategori)
          setProduk(data.produk)
          setPage(2)
          setHasMore(data.produk.length === 12)
          setLoading(false)
          return
        }
      }

      const response = await fetch(`/api/epasar/combined?${params}`)
      if (!response.ok) throw new Error('Gagal memuat data e-Pasar')
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal memuat data')
      }
      
      const { kategori: kategoriData, produk: produkData } = result.data
      
      // Cache the results
      if (reset) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result.data,
          timestamp: Date.now()
        }))
        setKategori(kategoriData)
        setProduk(produkData)
        setPage(2)
      } else {
        setProduk(prev => [...prev, ...produkData])
        setPage(prev => prev + 1)
      }
      
      setHasMore(produkData.length === 12)
    } catch (error: any) {
      console.error('Fetch combined data error:', error)
      appToast({
        title: 'Error',
        description: error.message || 'Gagal memuat data e-Pasar',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchCombinedData(true)
  }, [searchTerm, selectedKategori, sortBy])

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCombinedData(false)
    }
  }

  // Format harga
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(harga)
  }

  // Format tanggal
  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TERSEDIA: 'bg-green-100 text-green-800 border-green-200',
      HABIS: 'bg-red-100 text-red-800 border-red-200',
      PREORDER: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Handle product click with prefetch
  const handleProductClick = (produkId: string) => {
    // Prefetch product data before navigation
    prefetchProduct(produkId)
    router.push(`/epasar/produk/${produkId}`)
  }

  // Handle product hover for prefetch
  const handleProductHover = (produkId: string) => {
    // Prefetch when user hovers over a product
    prefetchProduct(produkId)
  }

  // Handle order click
  const handleOrder = (e: React.MouseEvent, produk: Produk) => {
    e.stopPropagation()
    // This will be implemented when we add WhatsApp integration
    appToast({
      title: 'Fitur Pemesanan',
      description: 'Fitur pemesanan akan segera tersedia',
    })
  }

  // Product Card Component with prefetch
  const ProductCard = ({ produk, isListView = false }: { produk: Produk; isListView?: boolean }) => (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 group",
        isListView ? "flex gap-4 p-4" : "overflow-hidden"
      )}
      onClick={() => handleProductClick(produk.id)}
      onMouseEnter={() => handleProductHover(produk.id)}
    >
      {/* Product Image */}
      <div className={cn(
        "relative overflow-hidden bg-muted",
        isListView ? "w-24 h-24 rounded-lg flex-shrink-0" : "h-48"
      )}>
        {produk.gambar && produk.gambar.length > 0 ? (
          <img
            src={produk.gambar[0]}
            alt={produk.judul}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-muted-foreground" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={cn("text-xs", getStatusColor(produk.status))}>
            {produk.status}
          </Badge>
        </div>

        {/* View Count */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Eye size={12} />
          {produk.views}
        </div>
      </div>

      {/* Product Info */}
      <div className={cn(
        "flex-1 p-4",
        isListView ? "py-0 px-2 flex flex-col justify-center" : "p-4"
      )}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className={cn(
              "font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors",
              isListView ? "text-base" : "text-lg"
            )}>
              {produk.judul}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {produk.kategori.nama}
            </p>
          </div>
        </div>

        <p className={cn(
          "text-muted-foreground line-clamp-2 mb-3",
          isListView ? "text-sm" : "text-sm"
        )}>
          {produk.deskripsi}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-green-600" />
            <span className="font-bold text-green-600 text-lg">
              {formatHarga(produk.harga)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package size={12} />
            <span>Stok: {produk.stok}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Store size={12} />
            <span>{formatTanggal(produk.createdAt)}</span>
          </div>
          
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={(e) => handleOrder(e, produk)}
            disabled={produk.stok === 0}
          >
            <ShoppingCart size={14} className="mr-1" />
            {produk.stok === 0 ? 'Habis' : 'Pesan'}
          </Button>
        </div>
      </div>
    </Card>
  )

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">e-Pasar Pagesangan Timur</h2>
          <p className="text-muted-foreground">Temukan produk terbaik dari warga Pagesangan Timur</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Cari produk..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedKategori} onValueChange={setSelectedKategori}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategori.map((kat) => (
                  <SelectItem key={kat.id} value={kat.id}>
                    {kat.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terbaru">Terbaru</SelectItem>
                <SelectItem value="terlama">Terlama</SelectItem>
                <SelectItem value="harga-asc">Harga Terendah</SelectItem>
                <SelectItem value="harga-desc">Harga Tertinggi</SelectItem>
                <SelectItem value="populer">Terpopuler</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Product Button */}
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push('/?epasar=true')}
            >
              <Store size={16} className="mr-2" />
              Jual Produk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      <div className="space-y-4">
        {loading && produk.length === 0 ? (
          // Loading skeleton
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : produk.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-12 text-center">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Belum ada produk</h3>
              <p className="text-muted-foreground mb-4">
                Belum ada produk yang tersedia saat ini. Jadilah yang pertama menjual produk!
              </p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push('/?epasar=true')}
              >
                <Store size={16} className="mr-2" />
                Jual Produk Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Products */}
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {produk.map((item) => (
                <ProductCard 
                  key={item.id} 
                  produk={item} 
                  isListView={viewMode === 'list'}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
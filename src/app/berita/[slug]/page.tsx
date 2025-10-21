'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Bookmark,
    Calendar,
    Clock,
    Eye,
    RefreshCw,
    Share2,
    Tag,
    User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { pageCache } from '@/lib/cache-manager'

interface BeritaDetail {
  id: string
  judul: string
  isi: string
  gambar?: string
  published: boolean
  kategori: {
    id: string
    nama: string
  }
  createdAt: string
  updatedAt: string
  author?: string
  views?: number
  likes?: number
  comments?: number
}

interface RelatedBerita {
  id: string
  judul: string
  gambar?: string
  kategori: {
    nama: string
  }
  createdAt: string
}

export default function BeritaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [berita, setBerita] = useState<BeritaDetail | null>(null)
  const [relatedBerita, setRelatedBerita] = useState<RelatedBerita[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('berita')
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * Mengambil detail berita dari cache atau API
   * @returns Promise<void>
   */
  const fetchBeritaDetail = async () => {
    try {
      const slug = params?.slug
      const cacheKey = `/berita/${slug}`
      
      // Check cache first (from list page or previous visits)
      const cached = pageCache.get(cacheKey) as BeritaDetail | null
      if (cached) {
        setBerita(cached)
        setIsLoading(false)
        return
      }
      
      // Only fetch if not in cache
      const response = await fetch(`/api/berita/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setBerita(data)
        setIsLoading(false)
        // Cache with TTL 30 minutes for detail pages
        pageCache.set(cacheKey, data, 30 * 60 * 1000)
        
        // Increment views
        try {
          await fetch(`/api/berita/${slug}/view`, { method: 'POST' })
        } catch (viewError) {
          console.log('View increment failed:', viewError)
        }
      } else {
        setIsLoading(false)
        toast.error('Berita tidak ditemukan')
        router.push('/berita')
      }
    } catch (error) {
      console.error('Error fetching berita detail:', error)
      setIsLoading(false)
      toast.error('Gagal memuat berita')
    }
  }

  /**
   * Mengambil berita terkait dari API dengan cache
   * @returns Promise<void>
   */
  const fetchRelatedBerita = async () => {
    try {
      const slug = params?.slug
      const cacheKey = `/berita/related/${slug}`
      
      // Check cache first
      const cached = pageCache.get(cacheKey) as RelatedBerita[] | null
      if (cached) {
        setRelatedBerita(cached.slice(0, 3))
        return
      }
      
      const response = await fetch(`/api/berita/related/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setRelatedBerita(data.slice(0, 3)) // Show max 3 related articles
        // Cache with TTL 30 minutes
        pageCache.set(cacheKey, data, 30 * 60 * 1000)
      }
    } catch (error) {
      console.error('Error fetching related berita:', error)
    }
  }

  useEffect(() => {
    if (params?.slug && !isInitialized) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setIsInitialized(true), 0)
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        fetchBeritaDetail()
        fetchRelatedBerita()
      }, 0)
    }
  }, [params?.slug, isInitialized])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: berita?.judul,
          text: berita?.isi.substring(0, 150) + '...',
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link berhasil disalin!')
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? 'Dihapus dari bookmark' : 'Ditambahkan ke bookmark')
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // Here you would typically make an API call to update likes
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
    const target = routes[index]
    if (!target || target === "/berita") return
    router.push(target)
  };

  /**
   * Handle manual refresh - invalidate cache and fetch fresh data
   */
  const handleManualRefresh = () => {
    const slug = params?.slug
    if (slug) {
      // Invalidate cache for this specific article
      pageCache.delete(`/berita/${slug}`)
      // Show loading state
      setIsLoading(true)
      // Fetch fresh data
      fetchBeritaDetail()
    }
  };

  // Check for manual refresh on component mount
  useEffect(() => {
    // Check if this is a manual refresh (navigation type 1)
    const isManualRefresh = performance.getEntriesByType && 
      performance.getEntriesByType('navigation').length > 0 &&
      (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type === 'reload';
    
    if (isManualRefresh && params?.slug) {
      // Clear cache for this article on manual refresh
      pageCache.delete(`/berita/${params.slug}`)
    }
  }, [params?.slug])

  if (isLoading) {
    return (
      <MobileLayout title="Memuat Berita" showBackButton={true} backRoute="/berita" activeTab="berita" onTabChange={handleTabChange}>
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat berita...</p>
        </div>
      </MobileLayout>
    )
  }

  if (!berita) {
    return (
      <MobileLayout title="Berita Tidak Ditemukan" showBackButton={true} backRoute="/berita" activeTab="berita" onTabChange={handleTabChange}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Berita yang Anda cari tidak tersedia.</p>
          <Button className="mt-4" onClick={() => router.push('/berita')}>
            Kembali ke Daftar Berita
          </Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Baca Berita" showBackButton={true} backRoute="/berita" activeTab="berita" onTabChange={handleTabChange}>
      {/* Article Image */}
      {berita.gambar && (
        <div className="w-full h-48 bg-muted relative">
          <img
            src={berita.gambar.startsWith('http') ? berita.gambar : `/${berita.gambar}`}
            alt={berita.judul}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-3">
          <Badge variant="secondary" className="text-xs">
            <Tag className="mr-1" size={12} />
            {berita.kategori.nama}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-4 leading-tight">
          {berita.judul}
        </h1>

        {/* Article Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(berita.createdAt)}</span>
          </div>
          {berita.author && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{berita.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{berita.views || 0} dibaca</span>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Article Content */}
        <div className="prose prose-sm max-w-none text-foreground mb-6">
          <div dangerouslySetInnerHTML={{ __html: berita.isi }} />
        </div>

        {/* Related Articles */}
        {relatedBerita.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Berita Terkait</h2>
            <div className="space-y-3">
              {relatedBerita.map((item) => (
                <Card
                  key={item.id}
                  className="active:shadow-none transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/berita/${item.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      {item.gambar && (
                        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                          <img
                            src={item.gambar.startsWith('http') ? item.gambar : `/${item.gambar}`}
                            alt={item.judul}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium line-clamp-2 mb-1">
                          {item.judul}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {item.kategori.nama}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button className="flex-1" onClick={handleShare}>
            <Share2 className="mr-2" size={16} />
            Bagikan
          </Button>
          <Button variant="outline" onClick={handleManualRefresh}>
            <RefreshCw size={16} />
          </Button>
          <Button variant="outline" onClick={handleBookmark}>
            <Bookmark className={`${isBookmarked ? 'fill-current' : ''}`} size={16} />
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
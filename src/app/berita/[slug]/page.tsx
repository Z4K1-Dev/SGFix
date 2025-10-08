'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import DocTabs from '@/components/doctabs'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Bookmark,
  Tag,
  Eye,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

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
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('artikel')

  useEffect(() => {
    if (params?.slug) {
      fetchBeritaDetail()
      fetchRelatedBerita()
    }
  }, [params?.slug])

  const fetchBeritaDetail = async () => {
    try {
      setLoading(true)
      const slug = params?.slug
      const response = await fetch(`/api/berita/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setBerita(data)
        
        // Increment views
        try {
          await fetch(`/api/berita/${slug}/view`, { method: 'POST' })
        } catch (viewError) {
          console.log('View increment failed:', viewError)
        }
      } else {
        toast.error('Berita tidak ditemukan')
        router.push('/berita')
      }
    } catch (error) {
      console.error('Error fetching berita detail:', error)
      toast.error('Gagal memuat berita')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedBerita = async () => {
    try {
      const slug = params?.slug
      const response = await fetch(`/api/berita/related/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setRelatedBerita(data.slice(0, 3)) // Show max 3 related articles
      }
    } catch (error) {
      console.error('Error fetching related berita:', error)
    }
  }

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto bg-background min-h-screen">
          {/* Header */}
          <header className="bg-primary text-primary-foreground p-3 shadow-md">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2" size={18} />
              </Button>
              <h1 className="text-lg font-bold">Memuat...</h1>
            </div>
          </header>

          {/* Loading Content */}
          <div className="p-4 space-y-4">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="h-48 bg-muted rounded-xl animate-pulse"></div>
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!berita) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto bg-background min-h-screen">
          <header className="bg-primary text-primary-foreground p-3 shadow-md">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/berita')}>
                <ArrowLeft className="mr-2" size={18} />
              </Button>
              <h1 className="text-lg font-bold">Berita Tidak Ditemukan</h1>
            </div>
          </header>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Berita yang Anda cari tidak tersedia.</p>
            <Button className="mt-4" onClick={() => router.push('/berita')}>
              Kembali ke Daftar Berita
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="text-primary-foreground" size={18} />
              </Button>
              <h1 className="text-lg font-bold">Baca Berita</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="text-primary-foreground" size={18} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBookmark}>
                <Bookmark className={`text-primary-foreground ${isBookmarked ? 'fill-current' : ''}`} size={18} />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20">
          {/* Article Image */}
          {berita.gambar && (
            <div className="w-full h-48 bg-muted relative">
              <img 
                src={berita.gambar} 
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

            {/* DocTabs Component */}
            <div className="mt-4">
              <DocTabs
                onChange={(index) => {
                  if (index !== null) {
                    const tabMap = ['artikel', 'komentar', 'bagikan'];
                    const tabName = tabMap[index];
                    if (tabName) {
                      setActiveTab(tabName);
                    }
                  }
                }}
              />
            </div>

            {/* Related Articles */}
            {relatedBerita.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Berita Terkait</h2>
                <div className="space-y-3">
                  {relatedBerita.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer"
                      onClick={() => router.push(`/berita/${item.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {item.gambar && (
                            <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                              <img 
                                src={item.gambar} 
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
          </div>
        </main>
      </div>
    </div>
  )
}
'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    MessageSquare
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { pageCache } from '@/lib/cache-manager'

interface Balasan {
  id: string
  isi: string
  dariAdmin: boolean
  createdAt: string
}

interface PengaduanDetail {
  id: string
  judul: string
  keterangan: string
  foto?: string
  latitude?: number
  longitude?: number
  status: string
  createdAt: string
  updatedAt: string
  balasan?: Balasan[]
}

export default function PengaduanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [pengaduan, setPengaduan] = useState<PengaduanDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newBalasan, setNewBalasan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchPengaduanDetail = async () => {
      try {
        const id = params?.id
        const cacheKey = `/pengaduan/${id}`
        
        // Check cache first
        const cached = pageCache.get(cacheKey) as PengaduanDetail | null
        if (cached) {
          setPengaduan(cached)
          setIsLoading(false)
          return
        }
        
        const response = await fetch(`/api/pengaduan/${id}`)
        
        if (!response.ok) {
          throw new Error('Pengaduan tidak ditemukan')
        }
        
        const data = await response.json()
        setPengaduan(data)
        setIsLoading(false)
        // Cache with TTL 30 minutes for detail pages
        pageCache.set(cacheKey, data, 30 * 60 * 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        setIsLoading(false)
      }
    }

    if (params?.id && !isInitialized) {
      setIsInitialized(true)
      fetchPengaduanDetail()
    }
  }, [params?.id, isInitialized])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      BARU: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      DITAMPUNG: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      DITERUSKAN: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
      DIKERJAKAN: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      SELESAI: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    }
    return colors[status] || 'bg-muted text-muted-foreground border-border'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BARU': return <AlertCircle size={16} />
      case 'DITAMPUNG': return <Clock size={16} />
      case 'SELESAI': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const handleShare = async () => {
    if (navigator.share && pengaduan) {
      try {
        await navigator.share({
          title: pengaduan.judul,
          text: pengaduan.keterangan,
          url: window.location.href
        })
      } catch (err) {
        // Fallback ke clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link pengaduan disalin ke clipboard')
      }
    } else {
      // Fallback untuk browser yang tidak support Web Share API
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link pengaduan disalin ke clipboard')
    }
  }

  const handleDownload = () => {
    if (pengaduan) {
      const data = {
        judul: pengaduan.judul,
        keterangan: pengaduan.keterangan,
        status: pengaduan.status,
        createdAt: pengaduan.createdAt,
        lokasi: pengaduan.latitude && pengaduan.longitude
          ? `${pengaduan.latitude}, ${pengaduan.longitude}`
          : 'Tidak ada lokasi'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pengaduan-${pengaduan.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Pengaduan berhasil diunduh')
    }
  }

  const openGoogleMaps = () => {
    if (pengaduan?.latitude && pengaduan?.longitude) {
      const url = `https://www.google.com/maps?q=${pengaduan.latitude},${pengaduan.longitude}`
      window.open(url, '_blank')
    }
  }

  const handleSubmitBalasan = async () => {
    if (!newBalasan.trim()) {
      toast.error('Balasan tidak boleh kosong')
      return
    }

    if (!pengaduan?.id) {
      toast.error('Data pengaduan tidak valid')
      return
    }

    setIsSubmitting(true)
    
    // Show loading toast
    const loadingToast = toast.loading('Mengirim balasan...')

    try {
      const response = await fetch(`/api/pengaduan/${pengaduan.id}/balasan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isi: newBalasan.trim(),
          dariAdmin: false
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal mengirim balasan')
      }

      const balasanBaru = await response.json()
      
      // Update local state dengan balasan baru
      setPengaduan(prev => ({
        ...prev!,
        balasan: [...(prev?.balasan || []), balasanBaru]
      }))

      // Clear form
      setNewBalasan('')
      
      // Show success toast
      toast.success('Balasan berhasil dikirim!', {
        id: loadingToast
      })

    } catch (error) {
      console.error('Error submitting balasan:', error)
      toast.error('Gagal mengirim balasan. Silakan coba lagi.', {
        id: loadingToast
      })
    } finally {
      setIsSubmitting(false)
    }
  }


  if (isLoading) {
    return (
      <MobileLayout
        title="Memuat Pengaduan"
        showBackButton={true}
        backRoute="/pengaduan"
        activeTab="pengaduan"
        onTabChange={(index) => {
          if (index === null) return
          const routes = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
          const target = routes[index]
          if (!target || target === "/pengaduan") return
          router.push(target)
        }}
      >
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat detail pengaduan...</p>
        </div>
      </MobileLayout>
    )
  }

  if (error || !pengaduan) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Pengaduan Tidak Ditemukan</h2>
              <p className="text-muted-foreground mb-4">{error || 'Pengaduan tidak ditemukan'}</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <MobileLayout
      title="Detail Pengaduan"
      showBackButton={true}
      backRoute="/pengaduan"
      activeTab="pengaduan"
      onTabChange={(index) => {
        if (index === null) return
        const routes = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
        const target = routes[index]
        if (!target || target === "/pengaduan") return
        router.push(target)
      }}
    >
      <div className="px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge className={`text-xs border ${getStatusColor(pengaduan.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(pengaduan.status)}
                  {pengaduan.status}
                </div>
              </Badge>
              <h1 className="text-xl font-bold text-foreground">{pengaduan.judul}</h1>
            </div>
          </div>
        </div>

        {/* Single Card Layout */}
        <Card className="space-y-6">
          <CardContent className="px-6 py-6 space-y-6">
            {/* 1. Informasi Pengaduan */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(pengaduan.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(pengaduan.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* 2. Foto */}
            {pengaduan.foto && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Foto</h3>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={pengaduan.foto}
                    alt={pengaduan.judul}
                    className="w-full h-auto max-h-96 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      
                      // Periksa apakah parentElement ada sebelum mengaksesnya
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <div class="w-full h-64 bg-muted flex items-center justify-center rounded-lg">
                            <div class="text-center">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-muted-foreground mb-2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                              </svg>
                              <p class="text-muted-foreground">Gambar tidak tersedia</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* 3. Keterangan Pengaduan */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Keterangan Pengaduan</h3>
              <p className="text-foreground whitespace-pre-wrap">{pengaduan.keterangan}</p>
            </div>

            {/* 4. Lokasi */}
            {pengaduan.latitude && pengaduan.longitude && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Lokasi
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Latitude: {pengaduan.latitude.toFixed(6)}</p>
                  <p>Longitude: {pengaduan.longitude.toFixed(6)}</p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openGoogleMaps}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Buka di Google Maps
                  </Button>
                </div>
              </div>
            )}

            {/* Balasan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Balasan {pengaduan.balasan && `(${pengaduan.balasan.length})`}
              </h3>
              
              {/* Daftar Balasan */}
              {pengaduan.balasan && pengaduan.balasan.length > 0 && (
                <div className="space-y-3">
                  {pengaduan.balasan.map((balasan) => (
                    <Card key={balasan.id} className={`${
                      balasan.dariAdmin
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted border-border'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${
                            balasan.dariAdmin ? 'text-primary' : 'text-foreground'
                          }`}>
                            {balasan.dariAdmin ? 'Admin' : 'Anda'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(balasan.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-foreground">{balasan.isi}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Form Input Balasan */}
              <Card className="border-2 border-dashed border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Tulis balasan Anda..."
                      value={newBalasan}
                      onChange={(e) => setNewBalasan(e.target.value)}
                      className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-transparent"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitBalasan}
                        disabled={!newBalasan.trim() || isSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Kirim Balasan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
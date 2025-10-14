'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { LaporanDetailSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

interface Balasan {
  id: string
  isi: string
  dariAdmin: boolean
  createdAt: string
}

interface LaporanDetail {
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

export default function LaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [laporan, setLaporan] = useState<LaporanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLaporanDetail = async () => {
      try {
        const response = await fetch(`/api/laporan/${params?.id}`)
        
        if (!response.ok) {
          throw new Error('Laporan tidak ditemukan')
        }
        
        const data = await response.json()
        setLaporan(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchLaporanDetail()
    }
  }, [params?.id])

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
    if (navigator.share && laporan) {
      try {
        await navigator.share({
          title: laporan.judul,
          text: laporan.keterangan,
          url: window.location.href
        })
      } catch (err) {
        // Fallback ke clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link laporan disalin ke clipboard')
      }
    } else {
      // Fallback untuk browser yang tidak support Web Share API
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link laporan disalin ke clipboard')
    }
  }

  const handleDownload = () => {
    if (laporan) {
      const data = {
        judul: laporan.judul,
        keterangan: laporan.keterangan,
        status: laporan.status,
        createdAt: laporan.createdAt,
        lokasi: laporan.latitude && laporan.longitude 
          ? `${laporan.latitude}, ${laporan.longitude}` 
          : 'Tidak ada lokasi'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-${laporan.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Laporan berhasil diunduh')
    }
  }

  const openGoogleMaps = () => {
    if (laporan?.latitude && laporan?.longitude) {
      const url = `https://www.google.com/maps?q=${laporan.latitude},${laporan.longitude}`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return <LaporanDetailSkeleton />
  }

  if (error || !laporan) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Laporan Tidak Ditemukan</h2>
              <p className="text-muted-foreground mb-4">{error || 'Laporan tidak ditemukan'}</p>
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
      title="Detail Laporan"
      showBackButton={true}
      backRoute="/laporan"
      activeTab="laporan"
      onTabChange={(index) => {
        if (index === null) return
        const routes = ["/", "/berita", "/laporan", "/layanan", null, "/profile"]
        const target = routes[index]
        if (!target || target === "/laporan") return
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
              <Badge className={`text-xs border ${getStatusColor(laporan.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(laporan.status)}
                  {laporan.status}
                </div>
              </Badge>
              <h1 className="text-xl font-bold text-foreground">{laporan.judul}</h1>
            </div>
          </div>
        </div>

        {/* Single Card Layout */}
        <Card className="space-y-6">
          <CardContent className="px-6 py-6 space-y-6">
            {/* 1. Informasi Laporan */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(laporan.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(laporan.createdAt).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* 2. Foto */}
            {laporan.foto && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Foto</h3>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={laporan.foto?.startsWith('http') || laporan.foto?.startsWith('/') ? laporan.foto : `/${laporan.foto}`}
                    alt={laporan.judul}
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

            {/* 3. Keterangan Laporan */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Keterangan Laporan</h3>
              <p className="text-foreground whitespace-pre-wrap">{laporan.keterangan}</p>
            </div>

            {/* 4. Lokasi */}
            {laporan.latitude && laporan.longitude && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Lokasi
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Latitude: {laporan.latitude.toFixed(6)}</p>
                  <p>Longitude: {laporan.longitude.toFixed(6)}</p>
                  
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
            {laporan.balasan && laporan.balasan.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Balasan ({laporan.balasan.length})
                </h3>
                {laporan.balasan.map((balasan) => (
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
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Camera, CheckCircle, Clock, MessageSquare, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { pageCache } from "@/lib/cache-manager"

interface Pengaduan {
  id: string
  judul: string
  keterangan: string
  foto?: string
  status: string
  createdAt: string
}

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
    case 'BARU': return <AlertCircle size={12} />
    case 'DITAMPUNG': return <Clock size={12} />
    case 'SELESAI': return <CheckCircle size={12} />
    default: return <Clock size={12} />
  }
}

export default function PengaduanPage() {
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const loadPengaduan = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true)
      }
      
      // Coba ambil dari cache terlebih dahulu (kecuali force refresh)
      if (!forceRefresh) {
        const cached = pageCache.get('/pengaduan')
        if (cached) {
          setPengaduan(cached as Pengaduan[])
          setIsDataLoaded(true)
          return
        }
      }
      
      // Fetch baru jika tidak ada cache atau force refresh
      const res = await fetch('/api/pengaduan')
      if (res.ok) {
        const data = await res.json()
        setPengaduan(data as Pengaduan[])
        // Update cache dengan data terbaru
        pageCache.set('/pengaduan', data, 60 * 60 * 1000)
      } else {
        // Fallback ke cache jika API gagal
        const cached = pageCache.get('/pengaduan')
        if (cached) {
          setPengaduan(cached as Pengaduan[])
        } else {
          toast.error('Gagal memuat pengaduan')
        }
      }
    } catch (e) {
      // Fallback ke cache jika koneksi gagal
      const cached = pageCache.get('/pengaduan')
      if (cached) {
        setPengaduan(cached as Pengaduan[])
      } else {
        toast.error('Terjadi kesalahan koneksi')
      }
    } finally {
      setIsDataLoaded(true)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Load data awal
    loadPengaduan()

    // Listen untuk cache updates
    const handleCacheUpdate = (event: CustomEvent) => {
      if (event.detail.key === '/pengaduan') {
        setPengaduan(event.detail.data as Pengaduan[])
      }
    }

    // Listen untuk cache invalidation
    const handleCacheInvalidate = (event: CustomEvent) => {
      if (event.detail.key === '/pengaduan') {
        loadPengaduan() // Refetch otomatis saat cache di-invalidate
      }
    }

    // Setup event listeners
    window.addEventListener('cache-updated', handleCacheUpdate as EventListener)
    window.addEventListener('cache-invalidated', handleCacheInvalidate as EventListener)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('cache-updated', handleCacheUpdate as EventListener)
      window.removeEventListener('cache-invalidated', handleCacheInvalidate as EventListener)
    }
  }, [])

  const handleRefresh = () => {
    loadPengaduan(true)
  }

  return (
    <MobileLayout 
      title="Pengaduan" 
      activeTab="pengaduan"
    >
      <div className={`px-4 pb-6 mt-4 space-y-4 transition-opacity duration-300 ${isDataLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Tombol Buat Pengaduan Selalu Visible */}
        <Card className="shadow-sm bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:shadow-none active:scale-[0.98] transition-all duration-200"
              onClick={() => router.push('/buat-pengaduan')}
            >
              <Camera className="mr-2" size={16} />
              Buat Pengaduan Baru
            </Button>
          </CardContent>
        </Card>

        {pengaduan.map((item) => (
          <Card key={item.id} className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-foreground line-clamp-1">{item.judul}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs border ${getStatusColor(item.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </div>
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.foto && (
                <div className="relative w-full h-32 bg-muted rounded-xl mb-3 overflow-hidden">
                  <img
                    src={item.foto}
                    alt={item.judul}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.keterangan}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full active:shadow-none active:scale-[0.98] transition-all duration-200"
                onClick={() => router.push(`/pengaduan/${item.id}`)}
              >
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        ))}

        {pengaduan.length === 0 && (
          <Card className="shadow-sm bg-card">
            <CardContent className="text-center py-12">
              <MessageSquare size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-base text-muted-foreground font-medium">Belum ada pengaduan</p>
              <p className="text-sm text-muted-foreground mt-1">Buat pengaduan pertama Anda menggunakan tombol di atas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}


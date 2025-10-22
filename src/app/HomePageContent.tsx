'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast as appToast } from '@/hooks/use-toast'
import {
    AlertCircle,
    BarChart3,
    Camera,
    CheckCircle,
    ChevronRight,
    Clock,
    FileText,
    Home,
    MapPin,
    MessageSquare,
    Search,
    ShoppingBag,
    Store
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { playNotifSound } from '@/lib/notif-sound'
import { connectSocket } from '@/lib/socket-client'
import { pageCache, prefetchPageData, invalidatePageCache, refetchPageData } from '@/lib/cache-manager'
import { ProdukForm } from '@/components/epasar'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Berita {
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
}

interface Pengaduan {
  id: string
  judul: string
  keterangan: string
  foto?: string
  status: string
  createdAt: string
}

export function HomePageContent() {
  const [berita, setBerita] = useState<Berita[]>([])
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('beranda')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [showEpasarForm, setShowEpasarForm] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle client-side mounting
  useEffect(() => {
    setTimeout(() => setMounted(true), 0)
  }, [])

  // Handle e-Pasar modal from URL parameter
  useEffect(() => {
    if (mounted && searchParams.get('epasar') === 'true') {
      setTimeout(() => setShowEpasarForm(true), 0)
      // Remove the parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('epasar')
      window.history.replaceState({}, '', url.toString())
    }
  }, [mounted, searchParams])

  /**
   * Mengambil data dari API atau cache
   */
  const fetchData = async () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      console.log('Fetching data...')

      let beritaData = pageCache.get('/berita') as Berita[] | null
      let pengaduanData = pageCache.get('/pengaduan') as Pengaduan[] | null

      if (beritaData && pengaduanData) {
        console.log('Using cached data')
        setBerita(beritaData)
        setPengaduan(pengaduanData)
        return
      }

      const fetchPromises: Promise<any>[] = []
      
      if (!beritaData) {
        const promise = fetch('/api/berita?published=true').then(res => {
          if (res.ok) return res.json()
          throw new Error(`Berita API error: ${res.status}`)
        }).then(data => {
          beritaData = data
          pageCache.set('/berita', data, 60 * 60 * 1000)
          return data
        }).catch(err => {
          console.error('Failed to fetch berita:', err)
          return null
        })
        fetchPromises.push(promise)
      }

      if (!pengaduanData) {
        const promise = fetch('/api/pengaduan').then(res => {
          if (res.ok) return res.json()
          throw new Error(`Pengaduan API error: ${res.status}`)
        }).then(data => {
          pengaduanData = data
          pageCache.set('/pengaduan', data, 60 * 60 * 1000)
          return data
        }).catch(err => {
          console.error('Failed to fetch pengaduan:', err)
          return null
        })
        fetchPromises.push(promise)
      }

      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises)
      }

      if (beritaData) {
        console.log('Berita data received:', beritaData.length, 'items')
        setBerita(beritaData)
      }
      
      if (pengaduanData) {
        console.log('Pengaduan data received:', pengaduanData.length, 'items')
        setPengaduan(pengaduanData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
      appToast({ title: 'Gagal memuat data', variant: 'destructive' })
    }
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    setTouchEnd(clientX)
    const offset = clientX - touchStart
    setDragOffset(offset)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentSlide < 2) {
      setCurrentSlide(currentSlide + 1)
    } else if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }

    setTimeout(() => setDragOffset(0), 50)
  }

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", "/epasar", null, "/profile"]
    const target = routes[index]
    if (!target) return
    if (target === "/") {
      setActiveTab("beranda")
    } else {
      router.push(target)
    }
  }

  useEffect(() => {
    if (mounted) {
      setTimeout(() => fetchData(), 0)
    }
  }, [mounted])

  useEffect(() => {
    if (mounted) {
      Promise.all([
        prefetchPageData('/berita', '/api/berita?published=true&limit=5'),
        prefetchPageData('/pengaduan', '/api/pengaduan?limit=5'),
        prefetchPageData('/layanan', '/api/layanan?limit=5'),
        prefetchPageData('/notifikasi', '/api/notifikasi?limit=5&untukAdmin=false')
      ]).then(() => {
        console.log('✅ All pages prefetched successfully with limit 5')
      }).catch(error => {
        console.error('❌ Prefetch failed:', error)
      })
    }
  }, [mounted])

  useEffect(() => {
    const s = connectSocket('user')

    const handleNotif = (data: any) => {
      if (data.tipe === 'BERITA_BARU') {
        invalidatePageCache('/berita')
        refetchPageData('/berita', '/api/berita?published=true&limit=5')
      }
      
      if (data.tipe === 'PENGADUAN_BARU' || data.tipe === 'PENGADUAN_UPDATE') {
        invalidatePageCache('/pengaduan')
        refetchPageData('/pengaduan', '/api/pengaduan?limit=5')
      }
      
      if (data.tipe === 'LAYANAN_BARU' || data.tipe === 'LAYANAN_UPDATE') {
        invalidatePageCache('/layanan')
        refetchPageData('/layanan', '/api/layanan?limit=5')
      }
      
      invalidatePageCache('/notifikasi')
      refetchPageData('/notifikasi', '/api/notifikasi?limit=5&untukAdmin=false')
      
      appToast({
        title: data?.judul || data?.title || 'Notifikasi',
        description: data?.pesan || data?.message || 'Pesan masuk',
      })
      playNotifSound()
    }

    s.on('notification', handleNotif)
    return () => {
      s.off('notification', handleNotif)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = (clientX: number) => {
    setTouchStart(clientX)
    setTouchEnd(clientX)
    setIsDragging(true)
    setDragOffset(0)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      handleMove(e.clientX)
    }
  }

  const onMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      handleEnd()
    }
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

  if (!mounted) {
    return null
  }

  return (
    <MobileLayout
      title="Pagesangan Timur"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Cari layanan atau informasi..."
            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="beranda" className="px-4 pb-6 mt-4">
          {/* Image Slider */}
          <div className="mb-6">
            <div className={`relative overflow-hidden rounded-xl shadow-sm ${isDragging ? 'shadow-lg' : ''} transition-shadow duration-200`}>
              <div
                className={`relative h-48 bg-muted ${isDragging ? 'select-none' : ''}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{
                  touchAction: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                {/* Slides */}
                <div
                  className={`flex h-full ${isDragging ? '' : 'transition-transform duration-500 ease-in-out'}`}
                  style={{
                    transform: `translateX(calc(-${currentSlide * 100}% + ${isDragging ? dragOffset : 0}px))`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  <div className="min-w-full h-full relative">
                    <img
                      src="/pic1.jpg"
                      alt="Government Services Advertisement 1"
                      className={`w-full h-full object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="text-lg font-semibold">Layanan Digital Pemerintah</h3>
                        <p className="text-sm opacity-90">Akses layanan publik dengan mudah dan cepat</p>
                      </div>
                    </div>
                  </div>
                  <div className="min-w-full h-full relative">
                    <img
                      src="/pic2.jpg"
                      alt="Government Services Advertisement 2"
                      className={`w-full h-full object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="text-lg font-semibold">e-Pasar Pagesangan</h3>
                        <p className="text-sm opacity-90">Jual beli produk lokal dengan mudah</p>
                      </div>
                    </div>
                  </div>
                  <div className="min-w-full h-full relative">
                    <img
                      src="/pic3.jpg"
                      alt="Government Services Advertisement 3"
                      className={`w-full h-full object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                      <div className="text-white">
                        <h3 className="text-lg font-semibold">Pengaduan Masyarakat</h3>
                        <p className="text-sm opacity-90">Sampaikan aspirasi Anda dengan cepat</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slider Indicators */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/pengaduan')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Pengaduan</h3>
                  <p className="text-xs text-muted-foreground">Laporkan masalah</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/layanan')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Layanan</h3>
                  <p className="text-xs text-muted-foreground">Ajukan permohonan</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/epasar')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">e-Pasar</h3>
                  <p className="text-xs text-muted-foreground">Belanja produk lokal</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/berita')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Berita</h3>
                  <p className="text-xs text-muted-foreground">Info terkini</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent News */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Berita Terkini
                <Button variant="ghost" size="sm" onClick={() => router.push('/berita')}>
                  Lihat Semua
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {berita.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada berita</p>
                </div>
              ) : (
                berita.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0 last:pb-0">
                    {item.gambar && (
                      <img
                        src={item.gambar}
                        alt={item.judul}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-1">
                        {item.judul}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.isi}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span>{item.kategori.nama}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Complaints */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Pengaduan Terbaru
                <Button variant="ghost" size="sm" onClick={() => router.push('/pengaduan')}>
                  Lihat Semua
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pengaduan.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada pengaduan</p>
                </div>
              ) : (
                pengaduan.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-1">
                        {item.judul}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.keterangan}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* e-Pasar Form Modal */}
      <Dialog open={showEpasarForm} onOpenChange={setShowEpasarForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Jual Produk di e-Pasar</DialogTitle>
          </DialogHeader>
          <ProdukForm />
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}
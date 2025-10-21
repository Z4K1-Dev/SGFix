'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
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
    Search
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { playNotifSound } from '@/lib/notif-sound'
import { connectSocket } from '@/lib/socket-client'
import { pageCache, prefetchPageData, invalidatePageCache, refetchPageData } from '@/lib/cache-manager'


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

export default function HomePage() {
  const [berita, setBerita] = useState<Berita[]>([])
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('beranda')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  // Handle client-side mounting
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => setMounted(true), 0)
  }, [])

  const router = useRouter()

  /**
   * Mengambil data dari API atau cache
   */
  const fetchData = async () => {
    // Skip data fetching during build time
    if (typeof window === 'undefined') {
      return
    }

    try {
      console.log('Fetching data...')

      // Check cache first for berita
      let beritaData = pageCache.get('/berita') as Berita[] | null
      let pengaduanData = pageCache.get('/pengaduan') as Pengaduan[] | null

      if (beritaData && pengaduanData) {
        // Both data available in cache
        console.log('Using cached data')
        setBerita(beritaData)
        setPengaduan(pengaduanData)
        return
      }

      // Fetch missing data
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

      // Update state with available data
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

  /**
   * Menangani pergerakan saat drag/swipe
   */
  const handleMove = (clientX: number) => {
    if (!isDragging) return

    setTouchEnd(clientX)

    const offset = clientX - touchStart
    setDragOffset(offset)
    console.log('Move:', clientX, 'Offset:', offset)
  }

  /**
   * Menangani akhir dari drag/swipe
   */
  const handleEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    console.log('End:', {
      touchStart,
      touchEnd,
      distance,
      isLeftSwipe,
      isRightSwipe,
      currentSlide
    })

    if (isLeftSwipe && currentSlide < 2) {
      // Swipe left - go to next slide
      console.log('Going to next slide')
      setCurrentSlide(currentSlide + 1)
    } else if (isRightSwipe && currentSlide > 0) {
      // Swipe right - go to previous slide
      console.log('Going to previous slide')
      setCurrentSlide(currentSlide - 1)
    } else {
      console.log('No slide change - boundary or insufficient distance')
    }

    // Reset drag offset after a short delay to allow smooth transition
    setTimeout(() => setDragOffset(0), 50)
  }

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
    const target = routes[index]
    if (!target) return
    if (target === "/") {
      setActiveTab("beranda")
    } else {
      router.push(target)
    }
  };

  useEffect(() => {
    if (mounted) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => fetchData(), 0)
    }
  }, [mounted])

  // Prefetch data setelah home loading selesai
  useEffect(() => {
    if (mounted) {
      // Prefetch semua halaman utama dengan limit 5 untuk performa optimal
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

  // Socket.IO: connect as user and listen for notifications
  useEffect(() => {
    const s = connectSocket('user')

    const handleNotif = (data: any) => {
      // Update cache berdasarkan tipe notifikasi
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
      
      // Always refetch notifikasi when there's new notification
      invalidatePageCache('/notifikasi')
      refetchPageData('/notifikasi', '/api/notifikasi?limit=5&untukAdmin=false')
      
      // Show notification
      appToast({
        title: data?.judul || data?.title || 'Notifikasi',
        description: data?.pesan || data?.message || 'Pesan masuk',
      })
      playNotifSound()
    }

    const handleChatReply = (data: any) => {
      appToast({
        title: 'Balasan Pesan',
        description: data?.pesan || data?.message || 'Ada balasan baru di pesan Anda',
      })
      playNotifSound()
    }

    const handlePengaduanStatus = (data: any) => {
      const status = data?.status || data?.newStatus || 'DIPERBARUI'
      // Invalidate cache pengaduan saat status berubah
      invalidatePageCache('/pengaduan')
      refetchPageData('/pengaduan', '/api/pengaduan?limit=5')
      
      appToast({
        title: 'Status Pengaduan Berubah',
        description: `${data?.judul || data?.pengaduan || 'Pengaduan'} kini ${status}`,
      })
      playNotifSound()
    }

    const handleLayananStatus = (data: any) => {
      const status = data?.status || data?.newStatus || 'DIPERBARUI'
      // Invalidate cache layanan saat status berubah
      invalidatePageCache('/layanan')
      refetchPageData('/layanan', '/api/layanan?limit=5')
      
      appToast({
        title: 'Status Layanan Berubah',
        description: `${data?.judul || data?.layanan || 'Layanan'} kini ${status}`,
      })
      playNotifSound()
    }

    s.on('notification', handleNotif)
    s.on('chat-reply', handleChatReply)
    s.on('pengaduan-status-changed', handlePengaduanStatus)
    s.on('layanan-status-changed', handleLayananStatus)
    return () => {
      s.off('notification', handleNotif)
      s.off('chat-reply', handleChatReply)
      s.off('pengaduan-status-changed', handlePengaduanStatus)
      s.off('layanan-status-changed', handleLayananStatus)
    }
  }, [])

  useEffect(() => {
    // Auto-rotate slider every 3 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Global mouse event listeners for drag
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd()
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, touchStart])

  // Touch handling functions
  const minSwipeDistance = 50

  const handleStart = (clientX: number) => {
    setTouchStart(clientX)
    setTouchEnd(clientX)
    setIsDragging(true)
    setDragOffset(0)
    console.log('Start:', clientX)
  }

  // Touch events
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

  // Mouse events for desktop testing
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
        {/* Tab Beranda */}
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
                  <Image
                    src="/pic1.jpg"
                    alt="Government Services Advertisement 1"
                    fill
                    className={`object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority={currentSlide === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">Layanan Digital Pemerintah</h3>
                      <p className="text-sm opacity-90">Akses layanan publik dengan mudah dan cepat</p>
                    </div>
                  </div>
                </div>
                <div className="min-w-full h-full relative">
                  <Image
                    src="/pic2.jpg"
                    alt="Government Services Advertisement 2"
                    fill
                    className={`object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority={currentSlide === 1}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">Smart City Portal</h3>
                      <p className="text-sm opacity-90">Solusi modern untuk kebutuhan administrasi</p>
                    </div>
                  </div>
                </div>
                <div className="min-w-full h-full relative">
                  <Image
                    src="/pic3.jpg"
                    alt="Government Services Advertisement 3"
                    fill
                    className={`object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                    sizes="(max-width: 768px) 100vw, 768px"
                    priority={currentSlide === 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">E-Government Services</h3>
                      <p className="text-sm opacity-90">Pengelolaan dokumen online yang aman</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Layanan Icons */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Layanan Kami</h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => router.push('/layanan')}>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-primary" />
                </div>
                <span className="text-xs text-center text-foreground">KTP</span>
              </div>
              <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => router.push('/layanan')}>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <span className="text-xs text-center text-foreground">Akta</span>
              </div>
              <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => router.push('/layanan')}>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home size={24} className="text-blue-600" />
                </div>
                <span className="text-xs text-center text-foreground">KK</span>
              </div>
              <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => router.push('/layanan')}>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MessageSquare size={24} className="text-purple-600" />
                </div>
                <span className="text-xs text-center text-foreground">Surat</span>
              </div>
              <div className="flex flex-col items-center space-y-2 cursor-pointer relative" onClick={() => router.push('/layanan')}>
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-gray-600" />
                </div>
                <span className="text-xs text-center text-foreground">Semua</span>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">13</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-4 shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Berita</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{!mounted ? '...' : berita.length}</p>
              <p className="text-xs text-muted-foreground">Tersedia</p>
            </Card>

            <Card className="p-4 shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Pengaduan</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{pengaduan.length}</p>
              <p className="text-xs text-muted-foreground">Diterima</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-6 shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">Layanan Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start h-12 bg-primary/10 text-primary border border-primary/20 active:shadow-none transition-all duration-200"
                onClick={() => router.push('/buat-pengaduan')}
              >
                <Camera className="mr-3" size={20} />
                Buat Pengaduan
                <ChevronRight className="ml-auto" size={16} />
              </Button>
              <Button className="w-full justify-start h-12 bg-secondary text-secondary-foreground border border-border active:shadow-none transition-all duration-200" onClick={() => router.push('/layanan')}>
                <FileText className="mr-3" size={20} />
                Ajukan Layanan
                <ChevronRight className="ml-auto" size={16} />
              </Button>
              <Button className="w-full justify-start h-12 bg-secondary text-secondary-foreground border border-border active:shadow-none transition-all duration-200">
                <MapPin className="mr-3" size={20} />
                Lihat Peta Lokasi
                <ChevronRight className="ml-auto" size={16} />
              </Button>
              <Button className="w-full justify-start h-12 bg-secondary text-secondary-foreground border border-border active:shadow-none transition-all duration-200">
                <BarChart3 className="mr-3" size={20} />
                Lihat Statistik
                <ChevronRight className="ml-auto" size={16} />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">Aktivitas Terkini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {berita.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.judul}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {berita.length === 0 && (
                  <div className="text-center py-8">
                    <FileText size={48} />
                    <p className="text-sm text-muted-foreground">Belum ada berita</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </MobileLayout>
  )
}
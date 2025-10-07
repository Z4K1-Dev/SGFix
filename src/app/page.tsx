'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import DocTabs from '@/components/doctabs'
import { 
  Home,
  FileText,
  Users, 
  Settings, 
  Bell, 
  MapPin, 
  Camera,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Wifi,
  WifiOff,
  Cog,
  Phone,
  Mail,
  Calendar,
  Search,
  Plus,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'

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

interface Laporan {
  id: string
  judul: string
  keterangan: string
  foto?: string
  status: string
  createdAt: string
}

export default function HomePage() {
  const [berita, setBerita] = useState<Berita[]>([])
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [activeTab, setActiveTab] = useState('beranda')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      const tabMap = ['beranda', 'berita', 'laporan', null, 'profile'];
      const tabName = tabMap[index];
      if (tabName) {
        setActiveTab(tabName);
      }
    }
  };
  
  // Socket integration
  const { isConnected, connectionError } = useSocket('user')

  useEffect(() => {
    fetchData()
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

  const fetchData = async () => {
    try {
      const [beritaRes, laporanRes] = await Promise.all([
        fetch('/api/berita'),
        fetch('/api/laporan')
      ])

      if (beritaRes.ok) {
        const beritaData = await beritaRes.json()
        setBerita(beritaData.filter((item: Berita) => item.published))
      }
      if (laporanRes.ok) {
        setLaporan(await laporanRes.json())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    }
  }

  // Touch handling functions
  const minSwipeDistance = 50

  const handleStart = (clientX: number) => {
    setTouchStart(clientX)
    setTouchEnd(clientX)
    setIsDragging(true)
    setDragOffset(0)
    console.log('Start:', clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    
    setTouchEnd(clientX)
    
    const offset = clientX - touchStart
    setDragOffset(offset)
    console.log('Move:', clientX, 'Offset:', offset)
  }

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
      BARU: 'bg-blue-100 text-blue-800 border-blue-200',
      DIPROSES: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DITAMPAH: 'bg-orange-100 text-orange-800 border-orange-200',
      DIKERJAKAN: 'bg-purple-100 text-purple-800 border-purple-200',
      SELESAI: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BARU': return <AlertCircle size={12} />
      case 'DIPROSES': return <Clock size={12} />
      case 'SELESAI': return <CheckCircle size={12} />
      default: return <Clock size={12} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-background min-h-screen shadow-sm">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <Home size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Portal SmartGov</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md hover:bg-primary-foreground/20 h-8 w-8 p-0 text-primary-foreground">
                <Bell size={18} />
              </button>
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-300">
                    <Wifi size={14} />
                    <span className="text-xs font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-300">
                    <WifiOff size={14} />
                    <span className="text-xs font-medium">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
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
                      <img 
                        src="/ads1.jpg" 
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
                        src="/ads2.jpg" 
                        alt="Government Services Advertisement 2"
                        className={`w-full h-full object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                        <div className="text-white">
                          <h3 className="text-lg font-semibold">Smart City Portal</h3>
                          <p className="text-sm opacity-90">Solusi modern untuk kebutuhan administrasi</p>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-full h-full relative">
                      <img 
                        src="/ads3.jpg" 
                        alt="Government Services Advertisement 3"
                        className={`w-full h-full object-cover ${isDragging ? 'opacity-90' : ''} transition-opacity duration-200`}
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
            </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Card className="p-4 border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Berita</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{berita.length}</p>
                  <p className="text-xs text-muted-foreground">Tersedia</p>
                </Card>
                
                <Card className="p-4 border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Laporan</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{laporan.length}</p>
                  <p className="text-xs text-muted-foreground">Diterima</p>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="mb-6 border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">Layanan Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 active:shadow-none active:scale-[0.98] transition-all duration-200">
                    <Camera className="mr-3" size={20} />
                    Buat Laporan Foto
                    <ChevronRight className="ml-auto" size={16} />
                  </Button>
                  <Button className="w-full justify-start h-12 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border active:shadow-none active:scale-[0.98] transition-all duration-200">
                    <MapPin className="mr-3" size={20} />
                    Lihat Peta Lokasi
                    <ChevronRight className="ml-auto" size={16} />
                  </Button>
                  <Button className="w-full justify-start h-12 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border active:shadow-none active:scale-[0.98] transition-all duration-200">
                    <BarChart3 className="mr-3" size={20} />
                    Lihat Statistik
                    <ChevronRight className="ml-auto" size={16} />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
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

            {/* Tab Berita */}
            <TabsContent value="berita" className="px-4 pb-6 mt-4">
              <div className="space-y-4">
                {berita.map((item) => (
                  <Card key={item.id} className="border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer" onClick={() => window.location.href = `/berita/${item.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-foreground line-clamp-2">{item.judul}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.kategori.nama}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.isi}</p>
                      <Button variant="outline" size="sm" className="w-full active:shadow-none active:scale-[0.98] transition-all duration-200" onClick={() => window.location.href = `/berita/${item.id}`}>
                        Baca Selengkapnya
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {berita.length === 0 && (
                  <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
                    <CardContent className="text-center py-12">
                      <FileText size={64} />
                      <p className="text-base text-muted-foreground font-medium">Belum ada berita tersedia</p>
                      <p className="text-sm text-muted-foreground mt-1">Silakan kembali lagi nanti</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Laporan */}
            <TabsContent value="laporan" className="px-4 pb-6 mt-4">
              <div className="space-y-4">
                {laporan.map((item) => (
                  <Card key={item.id} className="border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
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
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.keterangan}</p>
                      {item.foto && (
                        <div className="w-full h-32 bg-muted rounded-xl mb-3 flex items-center justify-center">
                          <Camera size={32} />
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full active:shadow-none active:scale-[0.98] transition-all duration-200" onClick={() => toast.info('Fitur detail laporan akan segera hadir')}>
                        Lihat Detail
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {laporan.length === 0 && (
                  <Card className="border-0 shadow-sm bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:shadow-none active:scale-[0.98] cursor-pointer">
                    <CardContent className="text-center py-12">
                      <MessageSquare size={64} />
                      <p className="text-base text-muted-foreground font-medium">Belum ada laporan</p>
                      <p className="text-sm text-muted-foreground mt-1">Buat laporan pertama Anda</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Bottom Navigation */}
        <footer className="fixed bottom-1 left-1/2 transform -translate-x-1/2 z-50">
          <DocTabs onChange={handleTabChange} />
        </footer>
      </div>
    </div>
  )
}
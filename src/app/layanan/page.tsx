'use client'

import { JenisLayananSelector, MultiStepForm, StatusTracker } from '@/components/layanan'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, CheckCircle, Clock, Eye, FileText, History, Plus, Search, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { pageCache } from '@/lib/cache-manager'

interface LayananItem {
  id: string
  judul: string
  jenisLayanan: string
  status: 'DITERIMA' | 'DIPROSES' | 'DIVERIFIKASI' | 'SELESAI' | 'DITOLAK'
  createdAt: string
  updatedAt: string
  estimasiSelesai?: string
  catatan?: string
  alasanPenolakan?: string
  namaLengkap: string
  nik: string
  alamat: string
  noTelepon: string
  email: string
  hasUnreadReplies?: boolean
}

export default function LayananPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('daftar')
  const [selectedJenisLayanan, setSelectedJenisLayanan] = useState<string | null>(null)
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [filteredLayanan, setFilteredLayanan] = useState<LayananItem[]>([])
  const [selectedLayanan, setSelectedLayanan] = useState<LayananItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchLayanan()
    }
  }, [mounted])

  // Listen untuk cache updates dan invalidation
  useEffect(() => {
    // Listen untuk cache updates
    const handleCacheUpdate = (event: CustomEvent) => {
      if (event.detail.key === '/layanan') {
        setLayananList((event.detail.data as any).data || [])
      }
    }

    // Listen untuk cache invalidation
    const handleCacheInvalidate = (event: CustomEvent) => {
      if (event.detail.key === '/layanan') {
        fetchLayanan() // Refetch otomatis saat cache di-invalidate
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

  useEffect(() => {
    // Filter layanan based on search query and status
    let filtered = layananList

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenisLayanan.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredLayanan(filtered)
  }, [layananList, searchQuery, statusFilter])

  const fetchLayanan = async () => {
    try {
      // Coba ambil dari cache terlebih dahulu
      const cached = pageCache.get('/layanan')
      if (cached) {
        setLayananList((cached as any).data || [])
        setIsDataLoaded(true)
        return
      }

      // Fetch baru jika tidak ada cache
      const response = await fetch('/api/layanan')
      if (!response.ok) throw new Error('Failed to fetch layanan')
      
      const data = await response.json()
      setLayananList(data.data || [])
      // Simpan ke cache dengan TTL 60 menit
      pageCache.set('/layanan', data, 60 * 60 * 1000)
    } catch (error) {
      console.error('Error fetching layanan:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data layanan',
        variant: 'destructive'
      })
    } finally {
      setIsDataLoaded(true)
    }
  }

  const handleSelectJenisLayanan = (jenis: string) => {
    setSelectedJenisLayanan(jenis)
    setActiveTab('form')
  }

  const handleAjukanLayanan = async (formData: any) => {
    try {
      // Prepare data for API
      const submitData = {
        judul: `Pengajuan ${getJenisLayananLabel(selectedJenisLayanan!)}`,
        jenisLayanan: selectedJenisLayanan,
        ...formData
      }

      const response = await fetch('/api/layanan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit layanan')
      }

      const result = await response.json()
      
      toast({
        title: 'Berhasil',
        description: result.message || 'Layanan berhasil diajukan'
      })

      // Reset and go back to list
      setSelectedJenisLayanan(null)
      setActiveTab('daftar')
      fetchLayanan()
    } catch (error: any) {
      console.error('Error submitting layanan:', error)
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengajukan layanan',
        variant: 'destructive'
      })
    }
  }

  const handleBatal = () => {
    setSelectedJenisLayanan(null)
    setActiveTab('daftar')
  }

  const handleSelectLayanan = (layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setActiveTab('detail')
  }

  const handleDetail = (layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setActiveTab('detail')
  }

  const handleBalas = (layanan: LayananItem) => {
    router.push(`/layanan/${layanan.id}/balasan`)
  }

  const getJenisLayananLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      'KTP_BARU': 'KTP Baru',
      'KTP_HILANG': 'KTP Hilang',
      'KTP_RUSAK': 'KTP Rusak',
      'AKTA_KELAHIRAN': 'Akta Kelahiran',
      'AKTA_KEMATIAN': 'Akta Kematian',
      'AKTA_PERKAWINAN': 'Akta Perkawinan',
      'AKTA_CERAI': 'Akta Perceraian',
      'SURAT_PINDAH': 'Surat Pindah',
      'SURAT_KEHILANGAN': 'Surat Kehilangan',
      'SURAT_KETERANGAN': 'Surat Keterangan',
      'KK_BARU': 'KK Baru',
      'KK_PERUBAHAN': 'Perubahan KK',
      'KK_HILANG': 'KK Hilang'
    }
    return labels[jenis] || jenis
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DITERIMA': 'bg-blue-100 text-blue-800 border-blue-200',
      'DIPROSES': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'DIVERIFIKASI': 'bg-orange-100 text-orange-800 border-orange-200',
      'SELESAI': 'bg-green-100 text-green-800 border-green-200',
      'DITOLAK': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DITERIMA':
        return <CheckCircle className="h-3 w-3" />
      case 'DIPROSES':
      case 'DIVERIFIKASI':
        return <Clock className="h-3 w-3" />
      case 'SELESAI':
        return <CheckCircle className="h-3 w-3" />
      case 'DITOLAK':
        return <XCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
    const target = routes[index]
    if (!target || target === "/layanan") return
    router.push(target)
  };

  if (!mounted) {
    return null
  }

  return (
    <MobileLayout
      title="Layanan"
      showBackButton={true}
      backRoute="/"
      activeTab="layanan"
      onTabChange={handleTabChange}
    >
      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="daftar" className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
              <History className="h-4 w-4" />
              <span>Daftar</span>
            </TabsTrigger>
            <TabsTrigger value="pilih" className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
              <Plus className="h-4 w-4" />
              <span>Baru</span>
            </TabsTrigger>
            <TabsTrigger value="form" disabled={!selectedJenisLayanan} className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
              <FileText className="h-4 w-4" />
              <span>Form</span>
            </TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedLayanan} className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
              <FileText className="h-4 w-4" />
              <span>Detail</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daftar" className="mt-4">
            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Cari layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-muted border border-muted rounded-xl"
                />
              </div>
              
              <div className="flex items-center justify-between gap-2 pb-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full max-w-[200px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="DITERIMA">Diterima</SelectItem>
                    <SelectItem value="DIPROSES">Diproses</SelectItem>
                    <SelectItem value="DIVERIFIKASI">Diverifikasi</SelectItem>
                    <SelectItem value="SELESAI">Selesai</SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={() => setActiveTab('pilih')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Pengajuan Layanan
                </Button>
              </div>
            </div>

            {/* Layanan List */}
            <div className={`transition-opacity duration-300 ${isDataLoaded ? 'opacity-100' : 'opacity-0'}`}>
              {filteredLayanan.length > 0 ? (
                <div className="space-y-4">
                  {filteredLayanan.map((item) => (
                  <Card
                    key={item.id}
                    className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/layanan/${item.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                            {item.judul}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {getJenisLayananLabel(item.jenisLayanan)}
                            </Badge>
                            <Badge className={`text-xs border ${getStatusColor(item.status)}`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(item.status)}
                                {item.status}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Pemohon:</span>
                          <span className="text-sm font-medium">{item.namaLengkap}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tanggal:</span>
                          <span className="text-sm">{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 active:shadow-none active:scale-[0.98] transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/layanan/${item.id}`)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Belum ada layanan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Tidak ada layanan yang sesuai dengan filter'
                    : 'Ajukan layanan pertama Anda'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => setActiveTab('pilih')}>
                    Ajukan Layanan Baru
                  </Button>
                )}
              </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pilih" className="mt-4">
            <JenisLayananSelector onSelect={handleSelectJenisLayanan} />
          </TabsContent>

          <TabsContent value="form" className="mt-4">
            {selectedJenisLayanan && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('pilih')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {getJenisLayananLabel(selectedJenisLayanan)}
                  </Badge>
                </div>
                
                <MultiStepForm
                  jenisLayanan={getJenisLayananLabel(selectedJenisLayanan)}
                  onSubmit={handleAjukanLayanan}
                  onCancel={handleBatal}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="detail" className="mt-4">
            {selectedLayanan && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('daftar')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                </div>
                
                <StatusTracker
                  layanan={selectedLayanan}
                  onDetail={() => router.push(`/layanan/${selectedLayanan.id}`)}
                  onBalas={() => router.push(`/layanan/${selectedLayanan.id}/balasan`)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  )
}
'use client'

import { StatusTracker } from '@/components/layanan'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Download, Mail, MapPin, MessageSquare, Phone, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { pageCache } from '@/lib/cache-manager'

interface LayananDetail {
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
  tempatLahir?: string
  tanggalLahir?: string
  jenisKelamin?: string
  agama?: string
  pekerjaan?: string
  statusPerkawinan?: string
  kewarganegaraan?: string
  alamat: string
  rt?: string
  rw?: string
  kelurahan?: string
  kecamatan?: string
  kabupatenKota?: string
  provinsi?: string
  kodePos?: string
  noTelepon: string
  email: string
  formData?: string
  dokumen?: string
  balasan?: Array<{
    id: string
    isi: string
    dariAdmin: boolean
    createdAt: string
    user?: {
      nama: string
    }
  }>
}

export default function LayananDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [layanan, setLayanan] = useState<LayananDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchLayananDetail = useCallback(async () => {
    try {
      const id = params.id
      const cacheKey = `/layanan/${id}`
      
      // Check cache first
      const cached = pageCache.get(cacheKey) as { data: LayananDetail } | null
      if (cached) {
        setLayanan(cached.data)
        setIsLoading(false)
        return
      }
      
      const response = await fetch(`/api/layanan/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setIsLoading(false)
          toast({
            title: 'Error',
            description: 'Layanan tidak ditemukan',
            variant: 'destructive'
          })
          router.push('/layanan')
          return
        }
        throw new Error('Failed to fetch layanan detail')
      }
      
      const data = await response.json()
      setLayanan(data.data)
      setIsLoading(false)
      // Cache with TTL 30 minutes for detail pages
      pageCache.set(cacheKey, data, 30 * 60 * 1000)
    } catch (error) {
      console.error('Error fetching layanan detail:', error)
      setIsLoading(false)
      toast({
        title: 'Error',
        description: 'Gagal memuat detail layanan',
        variant: 'destructive'
      })
    }
  }, [params.id, router, toast])

  useEffect(() => {
    if (params.id && !isInitialized) {
      setIsInitialized(true)
      fetchLayananDetail()
    }
  }, [params.id, isInitialized, fetchLayananDetail])

  // Memoize formatting functions to prevent re-calculations
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    
    // Format date: DD Month YYYY
    const day = date.getDate()
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    // Format time: HH.MM
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day} ${month} ${year} pukul ${hours}.${minutes}`
  }, [])

  const getJenisLayananLabel = useCallback((jenis: string) => {
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
  }, [])

  const handleDownload = useCallback(() => {
    // Implement download functionality
    toast({
      title: 'Info',
      description: 'Fitur download akan segera tersedia'
    })
  }, [toast])

  // Memoize personal data sections to prevent re-renders
  const personalDataSection = useMemo(() => {
    if (!layanan) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Data Pribadi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
              <p className="text-sm font-medium">{layanan.namaLengkap}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">NIK</label>
              <p className="text-sm font-medium">{layanan.nik}</p>
            </div>
            {layanan.tempatLahir && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tempat/Tanggal Lahir</label>
                <p className="text-sm font-medium">
                  {layanan.tempatLahir}
                  {layanan.tanggalLahir && `, ${formatDate(layanan.tanggalLahir)}`}
                </p>
              </div>
            )}
            {layanan.jenisKelamin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                <p className="text-sm font-medium">
                  {layanan.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                </p>
              </div>
            )}
            {layanan.agama && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Agama</label>
                <p className="text-sm font-medium">{layanan.agama}</p>
              </div>
            )}
            {layanan.pekerjaan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pekerjaan</label>
                <p className="text-sm font-medium">{layanan.pekerjaan}</p>
              </div>
            )}
            {layanan.statusPerkawinan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Perkawinan</label>
                <p className="text-sm font-medium">{layanan.statusPerkawinan}</p>
              </div>
            )}
            {layanan.kewarganegaraan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kewarganegaraan</label>
                <p className="text-sm font-medium">{layanan.kewarganegaraan}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }, [layanan, formatDate])

  // Memoize address section to prevent re-renders
  const addressSection = useMemo(() => {
    if (!layanan) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Alamat</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
            <p className="text-sm font-medium">{layanan.alamat}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {layanan.rt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">RT</label>
                <p className="text-sm font-medium">{layanan.rt}</p>
              </div>
            )}
            {layanan.rw && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">RW</label>
                <p className="text-sm font-medium">{layanan.rw}</p>
              </div>
            )}
            {layanan.kodePos && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kode Pos</label>
                <p className="text-sm font-medium">{layanan.kodePos}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {layanan.kelurahan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kelurahan</label>
                <p className="text-sm font-medium">{layanan.kelurahan}</p>
              </div>
            )}
            {layanan.kecamatan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                <p className="text-sm font-medium">{layanan.kecamatan}</p>
              </div>
            )}
            {layanan.kabupatenKota && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                <p className="text-sm font-medium">{layanan.kabupatenKota}</p>
              </div>
            )}
            {layanan.provinsi && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                <p className="text-sm font-medium">{layanan.provinsi}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }, [layanan])

  // Memoize contact section to prevent re-renders
  const contactSection = useMemo(() => {
    if (!layanan) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Informasi Kontak</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telepon</label>
                <p className="text-sm font-medium">{layanan.noTelepon}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm font-medium">{layanan.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }, [layanan])

  // Memoize balasan section to prevent re-renders
  const balasanSection = useMemo(() => {
    if (!layanan?.balasan || layanan.balasan.length === 0) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Balasan</CardTitle>
          <CardDescription>
            Diskusi terkait pengajuan layanan ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {layanan.balasan?.map((balasan) => (
            <div key={balasan.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                balasan.dariAdmin 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {balasan.dariAdmin ? 'A' : 'U'}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {balasan.dariAdmin ? 'Admin' : 'Anda'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(balasan.createdAt)}
                  </span>
                </div>
                <p className={`text-sm rounded-lg p-3 ${
                  balasan.dariAdmin
                    ? 'bg-popover text-popover-foreground'
                    : 'bg-input text-card-foreground'
                }`}>
                  {balasan.isi}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }, [layanan?.balasan, formatDate])

  // Memoize action buttons to prevent re-renders
  const actionButtons = useMemo(() => {
    if (!layanan) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            onClick={() => router.push(`/layanan/${layanan.id}/balasan`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Kirim Balasan
          </Button>
          
          {layanan.status === 'SELESAI' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Unduh Dokumen
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }, [layanan, router, handleDownload])

  // Memoize time info section to prevent re-renders
  const timeInfoSection = useMemo(() => {
    if (!layanan) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Informasi Waktu</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Diajukan</label>
            <p className="text-sm whitespace-nowrap">{formatDate(layanan.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Terakhir Update</label>
            <p className="text-sm whitespace-nowrap">{formatDate(layanan.updatedAt)}</p>
          </div>
          {layanan.estimasiSelesai && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimasi Selesai</label>
              <p className="text-sm whitespace-nowrap">{layanan.estimasiSelesai}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }, [layanan, formatDate])

  // Memoize notes section to prevent re-renders
  const notesSection = useMemo(() => {
    if (!layanan || (!layanan.catatan && !layanan.alasanPenolakan)) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          {layanan.alasanPenolakan ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <span className="font-medium">Alasan Penolakan:</span><br />
                {layanan.alasanPenolakan}
              </p>
            </div>
          ) : layanan.catatan ? (
            <p className="text-sm">{layanan.catatan}</p>
          ) : null}
        </CardContent>
      </Card>
    )
  }, [layanan])

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
    const target = routes[index]
    if (!target || target === "/layanan") return
    router.push(target)
  };


  if (isLoading) {
    return (
      <MobileLayout 
        title="Memuat Layanan"
        showBackButton={true}
        backRoute="/layanan"
        activeTab="layanan"
        onTabChange={handleTabChange}
      >
        <div className="container mx-auto py-8 px-4">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat detail layanan...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  if (!layanan) {
    return (
      <MobileLayout 
        title="Detail Layanan"
        showBackButton={true}
        backRoute="/layanan"
        activeTab="layanan"
        onTabChange={handleTabChange}
      >
        <div className="container mx-auto py-8 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Layanan tidak ditemukan</h1>
            <Button onClick={() => router.push('/layanan')}>
              Kembali ke Daftar Layanan
            </Button>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout 
      title="Detail Layanan"
      showBackButton={true}
      backRoute="/layanan"
      activeTab="layanan"
      onTabChange={handleTabChange}
    >
      <div className="px-4 py-4">
        <div className="space-y-2 mb-6">
          <h1 className="text-xl font-bold">{layanan.judul}</h1>
          <Badge variant="outline">
            {getJenisLayananLabel(layanan.jenisLayanan)}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Status Tracker */}
            <StatusTracker
              layanan={layanan}
              onBalas={() => router.push(`/layanan/${layanan.id}/balasan`)}
              showActions={false}
            />

            {/* Memoized Sections */}
            {personalDataSection}
            {addressSection}
            {contactSection}
            {balasanSection}
          </div>

          {/* Memoized Action Buttons */}
          {actionButtons}

          {/* Memoized Time Info */}
          {timeInfoSection}

          {/* Memoized Notes */}
          {notesSection}
        </div>
      </div>
    </MobileLayout>
  )
}
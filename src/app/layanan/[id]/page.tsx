'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusTracker } from '@/components/layanan'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Download, FileText, Calendar, User, MapPin, Phone, Mail } from 'lucide-react'

interface LayananDetail {
  id: string
  judul: string
  jenisLayanan: string
  status: 'BARU' | 'DITAMPUNG' | 'DIVERIFIKASI' | 'DISETUJUI' | 'SELESAI' | 'DITOLAK'
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

  const fetchLayananDetail = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/layanan/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
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
    } catch (error) {
      console.error('Error fetching layanan detail:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat detail layanan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchLayananDetail()
    }
  }, [params.id])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = () => {
    // Implement download functionality
    toast({
      title: 'Info',
      description: 'Fitur download akan segera tersedia'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!layanan) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Layanan tidak ditemukan</h1>
          <Button onClick={() => router.push('/layanan')}>
            Kembali ke Daftar Layanan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/layanan')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">{layanan.judul}</h1>
          <Badge variant="outline">
            {getJenisLayananLabel(layanan.jenisLayanan)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <StatusTracker
            layanan={layanan}
            onBalas={() => router.push(`/layanan/${layanan.id}/balasan`)}
            showActions={false}
          />

          {/* Data Pribadi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Data Pribadi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                  <p className="font-medium">{layanan.namaLengkap}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">NIK</label>
                  <p className="font-medium">{layanan.nik}</p>
                </div>
                {layanan.tempatLahir && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tempat/Tanggal Lahir</label>
                    <p className="font-medium">
                      {layanan.tempatLahir}
                      {layanan.tanggalLahir && `, ${formatDate(layanan.tanggalLahir)}`}
                    </p>
                  </div>
                )}
                {layanan.jenisKelamin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                    <p className="font-medium">
                      {layanan.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                )}
                {layanan.agama && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agama</label>
                    <p className="font-medium">{layanan.agama}</p>
                  </div>
                )}
                {layanan.pekerjaan && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pekerjaan</label>
                    <p className="font-medium">{layanan.pekerjaan}</p>
                  </div>
                )}
                {layanan.statusPerkawinan && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status Perkawinan</label>
                    <p className="font-medium">{layanan.statusPerkawinan}</p>
                  </div>
                )}
                {layanan.kewarganegaraan && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kewarganegaraan</label>
                    <p className="font-medium">{layanan.kewarganegaraan}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alamat */}
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
                <p className="font-medium">{layanan.alamat}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {layanan.rt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RT</label>
                    <p className="font-medium">{layanan.rt}</p>
                  </div>
                )}
                {layanan.rw && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RW</label>
                    <p className="font-medium">{layanan.rw}</p>
                  </div>
                )}
                {layanan.kodePos && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kode Pos</label>
                    <p className="font-medium">{layanan.kodePos}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {layanan.kelurahan && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kelurahan</label>
                    <p className="font-medium">{layanan.kelurahan}</p>
                  </div>
                )}
                {layanan.kecamatan && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                    <p className="font-medium">{layanan.kecamatan}</p>
                  </div>
                )}
                {layanan.kabupatenKota && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kabupaten/Kota</label>
                    <p className="font-medium">{layanan.kabupatenKota}</p>
                  </div>
                )}
                {layanan.provinsi && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                    <p className="font-medium">{layanan.provinsi}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kontak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Informasi Kontak</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telepon</label>
                    <p className="font-medium">{layanan.noTelepon}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{layanan.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balasan */}
          {layanan.balasan && layanan.balasan.length > 0 && (
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
                      <p className="text-sm bg-gray-50 rounded-lg p-3">
                        {balasan.isi}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => router.push(`/layanan/${layanan.id}/balasan`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Balas Pengajuan
              </Button>
              
              {layanan.status === 'SELESAI' && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Dokumen
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Informasi Waktu */}
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
                <p className="text-sm">{formatDate(layanan.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Terakhir Update</label>
                <p className="text-sm">{formatDate(layanan.updatedAt)}</p>
              </div>
              {layanan.estimasiSelesai && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimasi Selesai</label>
                  <p className="text-sm">{layanan.estimasiSelesai}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Catatan */}
          {(layanan.catatan || layanan.alasanPenolakan) && (
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
          )}
        </div>
      </div>
    </div>
  )
}
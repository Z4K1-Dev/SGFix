'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { 
  User, 
  FileText, 
  Users, 
  Home, 
  Search,
  AlertCircle,
  Plus,
  RefreshCw,
  MapPin
} from 'lucide-react'

interface JenisLayanan {
  id: string
  nama: string
  deskripsi: string
  icon: React.ReactNode
  kategori: string
  warna: string
}

interface JenisLayananSelectorProps {
  onSelect: (jenis: string) => void
}

const jenisLayananList: JenisLayanan[] = [
  // KTP
  {
    id: 'KTP_BARU',
    nama: 'KTP Baru',
    deskripsi: 'Pengajuan KTP Elektronik baru untuk warga yang belum memiliki',
    icon: <User className="h-6 w-6" />,
    kategori: 'KTP',
    warna: 'bg-blue-500'
  },
  {
    id: 'KTP_HILANG',
    nama: 'KTP Hilang',
    deskripsi: 'Penggantian KTP yang hilang atau rusak',
    icon: <Search className="h-6 w-6" />,
    kategori: 'KTP',
    warna: 'bg-blue-500'
  },
  {
    id: 'KTP_RUSAK',
    nama: 'KTP Rusak',
    deskripsi: 'Penggantian KTP yang rusak atau tidak terbaca',
    icon: <RefreshCw className="h-6 w-6" />,
    kategori: 'KTP',
    warna: 'bg-blue-500'
  },
  
  // Akta
  {
    id: 'AKTA_KELAHIRAN',
    nama: 'Akta Kelahiran',
    deskripsi: 'Pembuatan akta kelahiran baru',
    icon: <Plus className="h-6 w-6" />,
    kategori: 'Akta',
    warna: 'bg-green-500'
  },
  {
    id: 'AKTA_KEMATIAN',
    nama: 'Akta Kematian',
    deskripsi: 'Pembuatan akta kematian',
    icon: <AlertCircle className="h-6 w-6" />,
    kategori: 'Akta',
    warna: 'bg-green-500'
  },
  {
    id: 'AKTA_PERKAWINAN',
    nama: 'Akta Perkawinan',
    deskripsi: 'Pembuatan akta perkawinan',
    icon: <Users className="h-6 w-6" />,
    kategori: 'Akta',
    warna: 'bg-green-500'
  },
  {
    id: 'AKTA_CERAI',
    nama: 'Akta Perceraian',
    deskripsi: 'Pembuatan akta perceraian',
    icon: <FileText className="h-6 w-6" />,
    kategori: 'Akta',
    warna: 'bg-green-500'
  },
  
  // Surat
  {
    id: 'SURAT_PINDAH',
    nama: 'Surat Pindah',
    deskripsi: 'Pengajuan surat pindah domisili',
    icon: <MapPin className="h-6 w-6" />,
    kategori: 'Surat',
    warna: 'bg-orange-500'
  },
  {
    id: 'SURAT_KEHILANGAN',
    nama: 'Surat Kehilangan',
    deskripsi: 'Pengajuan surat keterangan kehilangan',
    icon: <Search className="h-6 w-6" />,
    kategori: 'Surat',
    warna: 'bg-orange-500'
  },
  {
    id: 'SURAT_KETERANGAN',
    nama: 'Surat Keterangan',
    deskripsi: 'Pengajuan surat keterangan lainnya',
    icon: <FileText className="h-6 w-6" />,
    kategori: 'Surat',
    warna: 'bg-orange-500'
  },
  
  // KK
  {
    id: 'KK_BARU',
    nama: 'KK Baru',
    deskripsi: 'Pengajuan Kartu Keluarga baru',
    icon: <Home className="h-6 w-6" />,
    kategori: 'KK',
    warna: 'bg-purple-500'
  },
  {
    id: 'KK_PERUBAHAN',
    nama: 'Perubahan KK',
    deskripsi: 'Perubahan data Kartu Keluarga',
    icon: <RefreshCw className="h-6 w-6" />,
    kategori: 'KK',
    warna: 'bg-purple-500'
  },
  {
    id: 'KK_HILANG',
    nama: 'KK Hilang',
    deskripsi: 'Penggantian KK yang hilang atau rusak',
    icon: <Search className="h-6 w-6" />,
    kategori: 'KK',
    warna: 'bg-purple-500'
  }
]

const kategoriColors: Record<string, string> = {
  'KTP': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'Akta': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'Surat': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'KK': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
}

export function JenisLayananSelector({ onSelect }: JenisLayananSelectorProps) {

  const kategoriList = Array.from(new Set(jenisLayananList.map(item => item.kategori)))

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Pilih Jenis Layanan</h2>
        <p className="text-sm text-muted-foreground">
          Pilih jenis layanan yang ingin Anda ajukan
        </p>
      </div>

      {kategoriList.map(kategori => (
        <div key={kategori} className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge className={`${kategoriColors[kategori]} text-xs`}>
              {kategori}
            </Badge>
            <div className="h-px bg-border flex-1" />
          </div>
          
          <div className="space-y-3">
            {jenisLayananList
              .filter(layanan => layanan.kategori === kategori)
              .map(layanan => (
                <Card
                  key={layanan.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  onClick={() => onSelect(layanan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${layanan.warna} text-white flex-shrink-0`}>
                        {layanan.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{layanan.nama}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {layanan.deskripsi}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Informasi Penting</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
              <li>Siapkan dokumen yang diperlukan sebelum memulai pengajuan</li>
              <li>Pastikan data yang Anda masukkan sudah benar dan lengkap</li>
              <li>Proses pengajuan dapat dipantau melalui menu "Status Layanan"</li>
              <li>Waktu proses bervariasi tergantung jenis layanan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
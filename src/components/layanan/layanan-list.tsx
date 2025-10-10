'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LayananSkeleton } from '@/components/loading-skeleton'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface LayananItem {
  id: string
  judul: string
  jenisLayanan: string
  status: 'BARU' | 'DITAMPUNG' | 'DIVERIFIKASI' | 'DISETUJUI' | 'SELESAI' | 'DITOLAK'
  createdAt: string
  updatedAt: string
  estimasiSelesai?: string
  hasUnreadReplies?: boolean
}

interface LayananListProps {
  layananList: LayananItem[]
  onSelect?: (layanan: LayananItem) => void
  onDetail?: (layanan: LayananItem) => void
  onBalas?: (layanan: LayananItem) => void
  onAjukanBaru?: () => void
  showActions?: boolean
  showAjukanButton?: boolean
  isLoading?: boolean
}

const statusConfig = {
  BARU: {
    label: 'Baru',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <Clock className="h-3 w-3" />
  },
  DITAMPUNG: {
    label: 'Ditampung',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <AlertCircle className="h-3 w-3" />
  },
  DIVERIFIKASI: {
    label: 'Diverifikasi',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Eye className="h-3 w-3" />
  },
  DISETUJUI: {
    label: 'Disetujui',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  SELESAI: {
    label: 'Selesai',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  DITOLAK: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3 w-3" />
  }
}

const jenisLayananLabels: Record<string, string> = {
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

export function LayananList({ 
  layananList, 
  onSelect, 
  onDetail, 
  onBalas, 
  onAjukanBaru,
  showActions = true,
  showAjukanButton = true,
  isLoading = false
}: LayananListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA')
  const [sortBy, setSortBy] = useState<string>('TERBARU')

  // Filter and sort data
  const filteredLayanan = layananList
    .filter(layanan => {
      const matchesSearch = layanan.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          jenisLayananLabels[layanan.jenisLayanan]?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'SEMUA' || layanan.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'TERBARU':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'TERLAMA':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'TERAKHIR_UPDATE':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Hari ini'
    } else if (diffDays === 1) {
      return 'Kemarin'
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const getStatusPriority = (status: string) => {
    const priorities: Record<string, number> = {
      'BARU': 1,
      'DITAMPUNG': 2,
      'DIVERIFIKASI': 3,
      'DISETUJUI': 4,
      'SELESAI': 5,
      'DITOLAK': 6
    }
    return priorities[status] || 999
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Daftar Layanan</h2>
          <p className="text-muted-foreground">
            {layananList.length} pengajuan layanan
          </p>
        </div>
        {showAjukanButton && (
          <Button onClick={onAjukanBaru}>
            <Plus className="h-4 w-4 mr-2" />
            Ajukan Layanan Baru
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <LayananSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari layanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMUA">Semua Status</SelectItem>
              <SelectItem value="BARU">Baru</SelectItem>
              <SelectItem value="DITAMPUNG">Ditampung</SelectItem>
              <SelectItem value="DIVERIFIKASI">Diverifikasi</SelectItem>
              <SelectItem value="DISETUJUI">Disetujui</SelectItem>
              <SelectItem value="SELESAI">Selesai</SelectItem>
              <SelectItem value="DITOLAK">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TERBARU">Terbaru</SelectItem>
              <SelectItem value="TERLAMA">Terlama</SelectItem>
              <SelectItem value="TERAKHIR_UPDATE">Terakhir Update</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Layanan List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((index) => (
            <LayananSkeleton key={index} />
          ))}
        </div>
      ) : filteredLayanan.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Tidak ada layanan ditemukan</h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm || statusFilter !== 'SEMUA' 
                  ? 'Coba ubah filter atau kata kunci pencarian' 
                  : 'Belum ada pengajuan layanan. Ajukan layanan baru untuk memulai.'
                }
              </p>
              {showAjukanButton && !searchTerm && statusFilter === 'SEMUA' && (
                <Button onClick={onAjukanBaru} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajukan Layanan Baru
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLayanan.map((layanan) => {
            const statusInfo = statusConfig[layanan.status]
            
            return (
              <Card 
                key={layanan.id} 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all duration-200",
                  onSelect && "hover:scale-[1.01]"
                )}
                onClick={() => onSelect?.(layanan)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{layanan.judul}</CardTitle>
                        {layanan.hasUnreadReplies && (
                          <Badge variant="destructive" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Ada balasan
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {jenisLayananLabels[layanan.jenisLayanan]}
                        </Badge>
                        <Badge className={statusInfo.color}>
                          <div className="flex items-center space-x-1">
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    {showActions && (
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDetail?.(layanan)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onBalas?.(layanan)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(layanan.createdAt)}</span>
                      </div>
                      {layanan.estimasiSelesai && layanan.status !== 'SELESAI' && layanan.status !== 'DITOLAK' && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Estimasi: {layanan.estimasiSelesai}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Update: {formatDate(layanan.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {layananList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = layananList.filter(l => l.status === status).length
                if (count === 0) return null
                
                return (
                  <div key={status} className="text-center space-y-2">
                    <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-full", config.color)}>
                      {config.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">{config.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  )
}
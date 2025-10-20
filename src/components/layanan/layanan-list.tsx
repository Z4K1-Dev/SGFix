'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Plus,
  Search,
  XCircle
} from 'lucide-react'
import { useState } from 'react'

// Types
interface LayananItem {
  id: string
  judul: string
  jenisLayanan: string
  status: 'DITERIMA' | 'DIPROSES' | 'DIVERIFIKASI' | 'SELESAI' | 'DITOLAK'
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
  DITERIMA: {
    label: 'Diterima',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  DIPROSES: {
    label: 'Diproses',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    icon: <Clock className="h-3 w-3" />
  },
  DIVERIFIKASI: {
    label: 'Diverifikasi',
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    icon: <Eye className="h-3 w-3" />
  },
  SELESAI: {
    label: 'Selesai',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  DITOLAK: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
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
  // Sort by last update first
  const sortedLayanan = [...layananList].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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
      'DITERIMA': 1,
      'DIPROSES': 2,
      'DIVERIFIKASI': 3,
      'SELESAI': 4,
      'DITOLAK': 5
    }
    return priorities[status] || 999
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Daftar Layanan</h2>
          <p className="text-sm text-muted-foreground">
            {layananList.length} pengajuan
          </p>
        </div>
        {showAjukanButton && (
          <Button size="sm" onClick={onAjukanBaru}>
            <Plus className="h-4 w-4 mr-1" />
            Baru
          </Button>
        )}
      </div>

      {/* Daftar Layanan */}
      {sortedLayanan.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">Belum ada layanan</h3>
              <p className="text-sm text-muted-foreground">
                Ajukan layanan baru untuk memulai.
              </p>
              {showAjukanButton && (
                <Button size="sm" onClick={onAjukanBaru} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajukan Layanan Baru
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedLayanan.map((layanan) => {
            const statusInfo = statusConfig[layanan.status]
            
            return (
              <Card
                key={layanan.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                onClick={() => onSelect?.(layanan)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-base leading-tight truncate">{layanan.judul}</h3>
                        {layanan.hasUnreadReplies && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Baru
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {jenisLayananLabels[layanan.jenisLayanan]}
                        </Badge>
                        <Badge className={`${statusInfo.color} text-xs`}>
                          <div className="flex items-center space-x-1">
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(layanan.createdAt)}</span>
                        </div>
                        {layanan.estimasiSelesai && layanan.status !== 'SELESAI' && layanan.status !== 'DITOLAK' && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{layanan.estimasiSelesai}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {showActions && (
                      <div className="flex space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDetail?.(layanan)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onBalas?.(layanan)}
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
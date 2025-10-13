'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MessageSquare,
  XCircle
} from 'lucide-react'
import React from 'react'

// Types
interface StatusLayanan {
  id: string
  judul: string
  jenisLayanan: string
  status: 'DITERIMA' | 'DIPROSES' | 'DIVERIFIKASI' | 'SELESAI' | 'DITOLAK'
  createdAt: string
  updatedAt: string
  catatan?: string
  alasanPenolakan?: string
  estimasiSelesai?: string
}

interface StatusTrackerProps {
  layanan: StatusLayanan
  onDetail?: () => void
  onBalas?: () => void
  showActions?: boolean
}

const statusConfig = {
  DITERIMA: {
    label: 'Diterima',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Pengajuan telah diterima dan akan diproses'
  },
  DIPROSES: {
    label: 'Diproses',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-4 w-4" />,
    description: 'Pengajuan sedang dalam proses'
  },
  DIVERIFIKASI: {
    label: 'Diverifikasi',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Eye className="h-4 w-4" />,
    description: 'Data sedang diverifikasi oleh petugas'
  },
  SELESAI: {
    label: 'Selesai',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Layanan telah selesai diproses'
  },
  DITOLAK: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Pengajuan ditolak'
  }
}

const timelineSteps = [
  { key: 'DITERIMA', label: 'Pengajuan Diterima' },
  { key: 'DIPROSES', label: 'Sedang Diproses' },
  { key: 'DIVERIFIKASI', label: 'Verifikasi' },
  { key: 'SELESAI', label: 'Selesai' }
] as const

// Memoize formatting functions to prevent re-calculations
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate()
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${day} ${month} ${year} pukul ${hours}.${minutes}`
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

// Timeline Step Component
const TimelineStep = React.memo(({
  step,
  index,
  currentStepIndex,
  currentStatus
}: {
  step: (typeof timelineSteps)[number]
  index: number
  currentStepIndex: number
  currentStatus: typeof statusConfig[keyof typeof statusConfig]
}) => {
  const isActive = index <= currentStepIndex
  const isCurrent = index === currentStepIndex
  const isCompleted = index < currentStepIndex
  
  return (
    <div className="flex items-start space-x-4 relative">
      {/* Step Circle */}
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full border-2 z-10",
        isActive 
          ? isCompleted 
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-primary text-primary-foreground border-primary"
          : "bg-background border-muted-foreground text-muted-foreground"
      )}>
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <span className="text-xs font-bold">{index + 1}</span>
        )}
      </div>
      
      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className={cn(
            "font-medium",
            isActive ? "text-foreground" : "text-muted-foreground"
          )}>
            {step.label}
          </h4>
          {isCurrent && (
            <Badge variant="secondary" className="text-xs">
              Saat ini
            </Badge>
          )}
        </div>
        {isCurrent && (
          <p className="text-sm text-muted-foreground mt-1">
            {currentStatus.description}
          </p>
        )}
        {isCompleted && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Selesai
          </p>
        )}
      </div>
    </div>
  )
})

export function StatusTracker({ layanan, onDetail, onBalas, showActions = true }: StatusTrackerProps) {
  const currentStatus = statusConfig[layanan.status]
  const isRejected = layanan.status === 'DITOLAK'
  
  // Find current step index for timeline
  const currentStepIndex = timelineSteps.findIndex(step => step.key === layanan.status)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{layanan.judul}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {getJenisLayananLabel(layanan.jenisLayanan)}
              </Badge>
              <Badge className={currentStatus.color}>
                <div className="flex items-center space-x-1">
                  {currentStatus.icon}
                  <span>{currentStatus.label}</span>
                </div>
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onDetail}>
                <Eye className="h-4 w-4 mr-2" />
                Detail
              </Button>
              <Button variant="outline" size="sm" onClick={onBalas}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Balas
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Status Proses</h3>
          
          {!isRejected ? (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
              
              {/* Timeline Steps */}
              <div className="space-y-6">
                {timelineSteps.map((step, index) => (
                  <TimelineStep
                    key={step.key}
                    step={step}
                    index={index}
                    currentStepIndex={currentStepIndex}
                    currentStatus={currentStatus}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Rejected Status
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800">Pengajuan Ditolak</h4>
                  {layanan.alasanPenolakan && (
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Alasan:</span> {layanan.alasanPenolakan}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Informasi Tambahan */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Diajukan</label>
            <p className="text-sm whitespace-nowrap">{formatDate(layanan.createdAt)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Terakhir Update</label>
            <p className="text-sm whitespace-nowrap">{formatDate(layanan.updatedAt)}</p>
          </div>
          
          {layanan.estimasiSelesai && layanan.status !== 'SELESAI' && layanan.status !== 'DITOLAK' && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimasi Selesai</label>
              <p className="text-sm whitespace-nowrap">{layanan.estimasiSelesai}</p>
            </div>
          )}
          
          {layanan.catatan && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Catatan</label>
              <p className="text-sm">{layanan.catatan}</p>
            </div>
          )}
        </div>

        {/* Action Buttons for Completed Status */}
        {layanan.status === 'SELESAI' && showActions && (
          <div className="flex justify-center space-x-4 pt-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Dokumen
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Cetak Bukti
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
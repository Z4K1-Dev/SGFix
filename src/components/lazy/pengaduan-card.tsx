'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Camera, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

interface Pengaduan {
  id: string
  judul: string
  keterangan: string
  foto?: string
  status: string
  createdAt: string
}

interface PengaduanCardProps {
  item: Pengaduan
  onClick: (id: string) => void
}

// Loading skeleton component
const PengaduanCardSkeleton = () => (
  <Card className="border-0 shadow-sm bg-card">
    <CardHeader className="pb-3">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-32 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </CardContent>
  </Card>
)

function PengaduanCardContent({ item, onClick }: PengaduanCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      BARU: 'bg-blue-100 text-blue-800 border-blue-200',
      DITAMPUNG: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DITERUSKAN: 'bg-orange-100 text-orange-800 border-orange-200',
      DIKERJAKAN: 'bg-purple-100 text-purple-800 border-purple-200',
      SELESAI: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
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
    <Card className="border-0 shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
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
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full active:shadow-none transition-all duration-200" 
          onClick={() => onClick(item.id)}
        >
          Lihat Detail
        </Button>
      </CardContent>
    </Card>
  )
}

export default function PengaduanCard(props: PengaduanCardProps) {
  return (
    <Suspense fallback={<PengaduanCardSkeleton />}>
      <PengaduanCardContent {...props} />
    </Suspense>
  )
}
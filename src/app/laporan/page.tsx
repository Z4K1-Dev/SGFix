"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Camera, CheckCircle, Clock, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Laporan {
  id: string
  judul: string
  keterangan: string
  foto?: string
  status: string
  createdAt: string
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

export default function LaporanPage() {
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const res = await fetch('/api/laporan')
        if (res.ok) {
          const data = await res.json()
          setLaporan(data)
        } else {
          toast.error('Gagal memuat laporan')
        }
      } catch (e) {
        toast.error('Terjadi kesalahan koneksi')
      }
    }

    fetchLaporan()
  }, [])

  return (
    <MobileLayout title="Laporan" activeTab="laporan">
      <div className="px-4 pb-6 mt-4 space-y-4">
        {laporan.map((item) => (
          <Card key={item.id} className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
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
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.foto && (
                <div className="relative w-full h-32 bg-muted rounded-xl mb-3 overflow-hidden">
                  <img
                    src={item.foto?.startsWith('http') || item.foto?.startsWith('/') ? item.foto : `/${item.foto}`}
                    alt={item.judul}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.keterangan}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full active:shadow-none active:scale-[0.98] transition-all duration-200"
                onClick={() => router.push(`/laporan/${item.id}`)}
              >
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        ))}

        {laporan.length === 0 && (
          <Card className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
            <CardContent className="text-center py-12">
              <MessageSquare size={64} />
              <p className="text-base text-muted-foreground font-medium">Belum ada laporan</p>
              <p className="text-sm text-muted-foreground mt-1">Buat laporan pertama Anda</p>
              <Button className="mt-4 bg-primary text-primary-foreground" onClick={() => router.push('/buat-laporan')}>
                <Camera className="mr-2" size={16} />
                Buat Laporan Baru
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}


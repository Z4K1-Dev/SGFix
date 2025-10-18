"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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

export default function BeritaPage() {
  const [berita, setBerita] = useState<Berita[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const res = await fetch('/api/berita?published=true')
        if (res.ok) {
          const data = await res.json()
          setBerita(data)
        } else {
          toast.error('Gagal memuat berita')
        }
      } catch (e) {
        toast.error('Terjadi kesalahan koneksi')
      }
    }

    fetchBerita()
  }, [])

  return (
    <MobileLayout title="Berita" activeTab="berita">
      <div className="px-4 pb-6 mt-4 space-y-4">
        {berita.map((item) => (
          <Card
            key={item.id}
            className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer"
            onClick={() => router.push(`/berita/${item.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-foreground line-clamp-2">
                    {item.judul}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.kategori.nama}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.isi}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full active:shadow-none active:scale-[0.98] transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/berita/${item.id}`)
                }}
              >
                Baca Selengkapnya
              </Button>
            </CardContent>
          </Card>
        ))}

        {berita.length === 0 && (
          <Card className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
            <CardContent className="text-center py-12">
              <FileText size={64} />
              <p className="text-base text-muted-foreground font-medium">Belum ada berita tersedia</p>
              <p className="text-sm text-muted-foreground mt-1">Silakan kembali lagi nanti</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}


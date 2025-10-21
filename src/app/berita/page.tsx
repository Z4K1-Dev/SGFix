"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { pageCache } from "@/lib/cache-manager"

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
  views?: number
  createdAt: string
}

export default function BeritaPage() {
  const [berita, setBerita] = useState<Berita[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    /**
     * Memuat data berita dari cache atau fetch baru jika tidak ada/expired
     */
    const loadBerita = async () => {
      try {
        // Coba ambil dari cache terlebih dahulu
        const cached = pageCache.get('/berita')
        if (cached) {
          setBerita(cached as Berita[])
          setIsDataLoaded(true)
          return
        }
        
        // Fetch baru jika tidak ada cache
        const res = await fetch('/api/berita?published=true')
        if (res.ok) {
          const data = await res.json()
          setBerita(data as Berita[])
          // Simpan ke cache dengan TTL 60 menit
          pageCache.set('/berita', data, 60 * 60 * 1000)
          
          // Cache individual berita data for detail pages
          data.forEach((item: Berita) => {
            pageCache.set(`/berita/${item.id}`, item, 60 * 60 * 1000)
          })
        } else {
          toast.error('Gagal memuat berita')
        }
      } catch (e) {
        toast.error('Terjadi kesalahan koneksi')
      } finally {
        setIsDataLoaded(true)
      }
    }

    // Load data awal
    loadBerita()

    // Listen untuk cache updates
    const handleCacheUpdate = (event: CustomEvent) => {
      if (event.detail.key === '/berita') {
        setBerita(event.detail.data as Berita[])
      }
    }

    // Listen untuk cache invalidation
    const handleCacheInvalidate = (event: CustomEvent) => {
      if (event.detail.key === '/berita') {
        loadBerita() // Refetch otomatis saat cache di-invalidate
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

  return (
    <MobileLayout title="Berita" activeTab="berita">
      <div className={`px-4 pb-6 mt-4 space-y-4 transition-opacity duration-300 ${isDataLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {berita.map((item) => (
          <Card
            key={item.id}
            className="shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer"
            onClick={() => router.push(`/berita/${item.id}`)}
          >
            {item.gambar ? (
              // Card dengan gambar - gambar 90% width, konten di bawahnya
              <>
                {/* Gambar 90% width dengan judul overlay */}
                <div className="flex justify-center pt-4">
                  <div className="relative w-[90%] h-48">
                    <img
                      src={`/${item.gambar}`}
                      alt={item.judul}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {/* Overlay gradient seperti slider di home */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                    {/* Judul di bawah overlay seperti slider */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg line-clamp-3">
                        {item.judul}
                      </h3>
                    </div>
                  </div>
                </div>
                
                {/* Konten di bawah gambar */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    {item.views && (
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Eye size={12} />
                        <span>{item.views.toLocaleString('id-ID')}</span>
                      </div>
                    )}
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
              </>
            ) : (
              // Card tanpa gambar - layout standard
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-foreground line-clamp-2">
                        {item.judul}
                      </CardTitle>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
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
                        {item.views && (
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Eye size={12} />
                            <span>{item.views.toLocaleString('id-ID')}</span>
                          </div>
                        )}
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
              </>
            )}
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
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast as appToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { 
  ShoppingCart, 
  Eye, 
  MapPin, 
  Phone, 
  Star, 
  Store,
  Package,
  DollarSign,
  Calendar,
  User,
  Share2,
  Heart,
  ArrowLeft,
  MessageCircle,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Types
interface Produk {
  id: string
  judul: string
  deskripsi: string
  harga: number
  stok: number
  kategoriId: string
  gambar: string[]
  status: string
  dariAdmin: boolean
  views: number
  createdAt: string
  updatedAt: string
  _aggr_count_pesanan: number
  kategori: {
    id: string
    nama: string
    deskripsi: string
    icon: string
  }
  // Additional seller info (would need to be added to API)
  penjual?: {
    nama: string
    telepon: string
    alamat: string
    kota: string
    provinsi: string
  }
}

interface ProdukDetailProps {
  produkId: string
  className?: string
}

export function ProdukDetail({ produkId, className }: ProdukDetailProps) {
  const [produk, setProduk] = useState<Produk | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  const router = useRouter()

  // Fetch produk data
  useEffect(() => {
    fetchProduk()
  }, [produkId])

  const fetchProduk = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/epasar/produk/${produkId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produk tidak ditemukan')
        }
        throw new Error('Gagal memuat data produk')
      }
      
      const data = await response.json()
      setProduk(data)
    } catch (error: any) {
      console.error('Fetch produk error:', error)
      appToast({
        title: 'Error',
        description: error.message || 'Gagal memuat data produk',
        variant: 'destructive'
      })
      router.push('/epasar')
    } finally {
      setLoading(false)
    }
  }

  // Format harga
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(harga)
  }

  // Format tanggal
  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      TERSEDIA: 'bg-green-100 text-green-800 border-green-200',
      HABIS: 'bg-red-100 text-red-800 border-red-200',
      PREORDER: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Handle image navigation
  const nextImage = () => {
    if (produk && produk.gambar.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % produk.gambar.length)
    }
  }

  const prevImage = () => {
    if (produk && produk.gambar.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + produk.gambar.length) % produk.gambar.length)
    }
  }

  // Handle order
  const handleOrder = () => {
    if (!produk || produk.stok === 0) return
    
    // This will be implemented when we add WhatsApp integration
    setShowOrderDialog(true)
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: produk?.judul,
          text: produk?.deskripsi,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      appToast({
        title: 'Link Disalin',
        description: 'Link produk telah disalin ke clipboard',
      })
    }
  }

  // Handle like
  const handleLike = () => {
    setIsLiked(!isLiked)
    // This would need to be implemented with backend
  }

  if (loading) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto p-4", className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!produk) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto p-4", className)}>
        <Card>
          <CardContent className="p-12 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Produk Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Produk yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Button onClick={() => router.push('/epasar')}>
              Kembali ke e-Pasar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4 space-y-6", className)}>
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.push('/epasar')}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Kembali
      </Button>

      {/* Product Header */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {produk.gambar && produk.gambar.length > 0 ? (
                  <img
                    src={produk.gambar[currentImageIndex]}
                    alt={produk.judul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={48} className="text-muted-foreground" />
                  </div>
                )}
                
                {/* Image Navigation */}
                {produk.gambar && produk.gambar.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ArrowLeft size={16} className="rotate-180" />
                    </button>
                  </>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={cn("text-sm", getStatusColor(produk.status))}>
                    {produk.status}
                  </Badge>
                </div>

                {/* View Count */}
                <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
                  <Eye size={14} />
                  <span>{produk.views} dilihat</span>
                </div>
              </div>

              {/* Thumbnail Images */}
              {produk.gambar && produk.gambar.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {produk.gambar.map((gambar, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2",
                        currentImageIndex === index ? "border-primary" : "border-border"
                      )}
                    >
                      <img
                        src={gambar}
                        alt={`${produk.judul} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{produk.judul}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(isLiked && "text-red-500")}
                  >
                    <Heart size={20} className={cn(isLiked && "fill-current")} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{produk.kategori.nama}</Badge>
                  {produk._aggr_count_pesanan > 0 && (
                    <Badge variant="outline">{produk._aggr_count_pesanan} terjual</Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {formatHarga(produk.harga)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package size={16} />
                    <span>Stok: {produk.stok}</span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {produk.deskripsi}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatTanggal(produk.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Store size={14} />
                    <span>{produk.dariAdmin ? 'Admin' : 'Warga'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleOrder}
                  disabled={produk.stok === 0}
                  size="lg"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {produk.stok === 0 ? 'Stok Habis' : 'Pesan Sekarang'}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 size={16} className="mr-2" />
                    Bagikan
                  </Button>
                  <Button variant="outline">
                    <MessageCircle size={16} className="mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store size={20} />
            Informasi Penjual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{produk.penjual?.nama || 'Penjual'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {produk.dariAdmin ? 'Admin Pagesangan Timur' : 'Warga Pagesangan Timur'}
                  </p>
                </div>
              </div>
              
              {produk.penjual && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{produk.penjual.telepon}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-muted-foreground mt-0.5" />
                    <span>
                      {produk.penjual.alamat}, {produk.penjual.kota}, {produk.penjual.provinsi}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <MessageCircle size={16} className="mr-2" />
                Hubungi Penjual
              </Button>
              <Button className="w-full" variant="outline">
                <Store size={16} className="mr-2" />
                Lihat Toko Penjual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pesan Produk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">{produk.judul}</h4>
              <p className="text-green-600 font-bold">{formatHarga(produk.harga)}</p>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Fitur pemesanan akan segera tersedia melalui WhatsApp
              </p>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // Will be implemented with WhatsApp integration
                  appToast({
                    title: 'Coming Soon',
                    description: 'Fitur pemesanan WhatsApp akan segera tersedia',
                  })
                  setShowOrderDialog(false)
                }}
              >
                <MessageCircle size={16} className="mr-2" />
                Pesan via WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
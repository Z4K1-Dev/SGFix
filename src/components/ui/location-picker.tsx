"use client"

import { useState, useCallback, useRef } from 'react'
import { Map } from '@/components/ui/map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Navigation, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address?: string) => void
  initialLatitude?: number | null
  initialLongitude?: number | null
  disabled?: boolean
}

export function LocationPicker({ 
  onLocationSelect, 
  initialLatitude, 
  initialLongitude,
  disabled = false 
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    initialLatitude && initialLongitude ? [initialLongitude, initialLatitude] : null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [markers, setMarkers] = useState<Array<{
    coordinates: [number, number]
    popup: string
    color: string
  }>>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/mapbox/geocode?address=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        const [lng, lat] = data.coordinates
        setSelectedLocation([lng, lat])
        setMarkers([{
          coordinates: [lng, lat],
          popup: `<div class="p-2"><h3 class="font-semibold">${searchQuery}</h3><p class="text-sm">Lokasi dipilih</p></div>`,
          color: "#3b82f6"
        }])
        toast.success('Lokasi ditemukan!')
      } else {
        toast.error('Lokasi tidak ditemukan')
      }
    } catch (error) {
      toast.error('Gagal mencari lokasi')
    } finally {
      setIsSearching(false)
    }
  }

  const handleGetCurrentLocation = useCallback(() => {
    setIsGettingLocation(true)
    
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak didukung browser ini')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setSelectedLocation([longitude, latitude])
        setMarkers([{
          coordinates: [longitude, latitude],
          popup: `<div class="p-2"><h3 class="font-semibold">Lokasi Anda</h3><p class="text-sm">Lokasi saat ini</p></div>`,
          color: "#10b981"
        }])
        setIsGettingLocation(false)
        toast.success('Lokasi berhasil didapatkan')
      },
      (error) => {
        setIsGettingLocation(false)
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Izin lokasi ditolak')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Informasi lokasi tidak tersedia')
            break
          case error.TIMEOUT:
            toast.error('Waktu habis untuk mendapatkan lokasi')
            break
          default:
            toast.error('Terjadi kesalahan saat mendapatkan lokasi')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [])

  const handleMapClick = (event: any) => {
    const { lng, lat } = event.lngLat
    setSelectedLocation([lng, lat])
    setMarkers([{
      coordinates: [lng, lat],
      popup: `<div class="p-2"><h3 class="font-semibold">Lokasi Dipilih</h3><p class="text-sm">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p></div>`,
      color: "#ef4444"
    }])
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      const [lng, lat] = selectedLocation
      onLocationSelect(lat, lng, searchQuery || 'Lokasi dipilih')
      setIsOpen(false)
      toast.success('Lokasi berhasil disimpan!')
    }
  }

  const handleClearLocation = () => {
    setSelectedLocation(null)
    setMarkers([])
    setSearchQuery('')
    onLocationSelect(0, 0, '')
  }

  const displayText = initialLatitude && initialLongitude 
    ? `${initialLatitude.toFixed(6)}, ${initialLongitude.toFixed(6)}`
    : 'Pilih lokasi'

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">Lokasi</div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {initialLatitude && initialLongitude ? displayText : 'Belum dipilih'}
            </span>
            {initialLatitude && initialLongitude && (
              <Badge variant="secondary" className="text-xs">
                Terpilih
              </Badge>
            )}
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={disabled}
            >
              {initialLatitude && initialLongitude ? 'Ubah' : 'Pilih'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Pilih Lokasi
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Cari alamat atau lokasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                  size="sm"
                >
                  {isSearching ? 'Mencari...' : 'Cari'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  size="sm"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  {isGettingLocation ? '...' : 'Lokasi Saya'}
                </Button>
              </div>

              {/* Map */}
              <div className="h-96 rounded-lg overflow-hidden border">
                <Map
                  initialCoordinates={selectedLocation || [110.4167, -7.2504]}
                  initialZoom={selectedLocation ? 15 : 5}
                  onMapClick={handleMapClick}
                  markers={markers}
                  className="w-full h-full"
                />
              </div>

              {/* Selected Location Info */}
              {selectedLocation && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Lokasi Dipilih</p>
                        <p className="text-sm text-muted-foreground">
                          Lat: {selectedLocation[1].toFixed(6)}, Lng: {selectedLocation[0].toFixed(6)}
                        </p>
                        {searchQuery && (
                          <p className="text-sm text-muted-foreground">{searchQuery}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLocation(null)
                          setMarkers([])
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Klik pada peta untuk memilih lokasi</p>
                <p>• Gunakan search untuk mencari alamat</p>
                <p>• Klik "Lokasi Saya" untuk menggunakan GPS</p>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <div className="flex gap-2">
                  {initialLatitude && initialLongitude && (
                    <Button
                      variant="outline"
                      onClick={handleClearLocation}
                    >
                      Hapus Lokasi
                    </Button>
                  )}
                  <Button
                    onClick={handleConfirmLocation}
                    disabled={!selectedLocation}
                  >
                    Konfirmasi Lokasi
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
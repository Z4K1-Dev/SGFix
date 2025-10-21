"use client"

import { useState } from 'react'
import { Map } from '@/components/ui/map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Search, Layers } from 'lucide-react'
import { mapStyles } from '@/lib/mapbox'

const sampleLocations = [
  {
    coordinates: [116.1186, -8.5656] as [number, number],
    name: "Mataram",
    description: "Kota Mataram, NTB",
    color: "#ef4444"
  },
  {
    coordinates: [106.8227, -6.2088] as [number, number],
    name: "Jakarta",
    description: "Ibukota Indonesia",
    color: "#3b82f6"
  },
  {
    coordinates: [112.7521, -7.2575] as [number, number],
    name: "Surabaya",
    description: "Kota Pahlawan",
    color: "#10b981"
  }
]

export function MapDemo() {
  const [selectedStyle, setSelectedStyle] = useState(mapStyles.streets)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [markers, setMarkers] = useState<Array<{
    coordinates: [number, number]
    popup: string
    color: string
  }>>(
    sampleLocations.map(loc => ({
      coordinates: loc.coordinates,
      popup: `<div class="p-2"><h3 class="font-semibold">${loc.name}</h3><p class="text-sm">${loc.description}</p></div>`,
      color: loc.color
    }))
  )

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const response = await fetch(`/api/mapbox/geocode?address=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedLocation(data.coordinates)
        setMarkers(prev => [...prev, {
          coordinates: data.coordinates,
          popup: `<div class="p-2"><h3 class="font-semibold">${searchQuery}</h3><p class="text-sm">Lokasi ditemukan</p></div>`,
          color: "#f59e0b"
        }])
      } else {
        console.error('Location not found:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const handleMapClick = (event: any) => {
    const { lng, lat } = event.lngLat
    const newMarker = {
      coordinates: [lng, lat] as [number, number],
      popup: `<div class="p-2"><h3 class="font-semibold">Custom Location</h3><p class="text-sm">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p></div>`,
      color: "#8b5cf6"
    }
    setMarkers(prev => [...prev, newMarker])
  }

  const flyToLocation = (coordinates: [number, number]) => {
    setSelectedLocation(coordinates)
  }

  const clearMarkers = () => {
    setMarkers(
      sampleLocations.map(loc => ({
        coordinates: loc.coordinates,
        popup: `<div class="p-2"><h3 class="font-semibold">${loc.name}</h3><p class="text-sm">${loc.description}</p></div>`,
        color: loc.color
      }))
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapbox Interactive Map Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} size="sm">
              Search
            </Button>
          </div>

          {/* Map Style Selector */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <Layers className="h-4 w-4" />
              Style:
            </span>
            {Object.entries(mapStyles).map(([name, style]) => (
              <Badge
                key={name}
                variant={selectedStyle === style ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedStyle(style)}
              >
                {name}
              </Badge>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => flyToLocation([116.1186, -8.5656])}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Mataram
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => flyToLocation([106.8227, -6.2088])}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Jakarta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => flyToLocation([112.7521, -7.2575])}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Surabaya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearMarkers}
            >
              Clear Markers
            </Button>
          </div>

          {/* Map Container */}
          <div className="h-96 rounded-lg overflow-hidden border">
            <Map
              initialCoordinates={selectedLocation || [116.1186, -8.5656]}
              initialZoom={selectedLocation ? 12 : 12}
              style={selectedStyle}
              onMapClick={handleMapClick}
              markers={markers}
              className="w-full h-full"
            />
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Click on the map to add custom markers</p>
            <p>• Search for locations using the search bar</p>
            <p>• Switch between different map styles</p>
            <p>• Use quick navigation to jump to major cities</p>
            <p>• Click on markers to see location details</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
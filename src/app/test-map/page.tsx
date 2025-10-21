'use client'

import { MapDemo } from '@/components/map-demo'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { MapPin } from 'lucide-react'

export default function TestMapPage() {
  return (
    <MobileLayout
      title="Peta Lokasi"
      showBackButton={true}
      showBottomNav={false}
    >
      <div className="px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Peta Interaktif</h1>
              <p className="text-sm text-muted-foreground">Jelajahi lokasi dengan Mapbox</p>
            </div>
          </div>
        </div>

        {/* Map Demo Component */}
        <MapDemo />
      </div>
    </MobileLayout>
  )
}
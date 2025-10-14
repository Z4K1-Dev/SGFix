"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'
import { BeritaSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <MobileLayout title="Berita" activeTab="berita">
      <div className="px-4 pb-6 mt-4 space-y-4">
        <BeritaSkeleton />
        <BeritaSkeleton />
        <BeritaSkeleton />
      </div>
    </MobileLayout>
  )
}


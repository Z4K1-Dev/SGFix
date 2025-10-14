"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'
import { LayananSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <MobileLayout title="Layanan" activeTab="layanan">
      <div className="px-4 pb-6 mt-4 space-y-4">
        <LayananSkeleton />
        <LayananSkeleton />
        <LayananSkeleton />
      </div>
    </MobileLayout>
  )
}


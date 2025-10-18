"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'
import { PengaduanSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <MobileLayout title="Pengaduan" activeTab="pengaduan">
      <div className="px-4 pb-6 mt-4 space-y-4">
        <PengaduanSkeleton />
        <PengaduanSkeleton />
        <PengaduanSkeleton />
      </div>
    </MobileLayout>
  )
}


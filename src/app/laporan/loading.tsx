"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'
import { LaporanSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <MobileLayout title="Laporan" activeTab="laporan">
      <div className="px-4 pb-6 mt-4 space-y-4">
        <LaporanSkeleton />
        <LaporanSkeleton />
        <LaporanSkeleton />
      </div>
    </MobileLayout>
  )
}


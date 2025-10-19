"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'

export default function Loading() {
  return (
    <MobileLayout title="Balasan Layanan" activeTab="layanan">
      <div className="container mx-auto py-8 px-4 max-w-[412px]">
        {/* Empty content for instant transition */}
      </div>
    </MobileLayout>
  )
}

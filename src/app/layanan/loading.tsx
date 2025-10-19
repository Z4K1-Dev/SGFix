"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'

export default function Loading() {
  return (
    <MobileLayout title="Layanan" activeTab="layanan">
      <div className="px-4 pb-6 mt-4">
        {/* Empty content for instant transition */}
      </div>
    </MobileLayout>
  )
}


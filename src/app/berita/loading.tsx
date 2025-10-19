"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'

export default function Loading() {
  return (
    <MobileLayout title="Berita" activeTab="berita">
      <div className="px-4 pb-6 mt-4">
        {/* Empty content for instant transition */}
      </div>
    </MobileLayout>
  )
}


"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'
import { ProfileSkeleton } from '@/components/loading-skeleton'

export default function Loading() {
  return (
    <MobileLayout title="Profil" activeTab="profile">
      <div className="px-4 pb-6 mt-4">
        <ProfileSkeleton />
      </div>
    </MobileLayout>
  )
}


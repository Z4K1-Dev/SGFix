"use client"

import { MobileLayout } from "@/components/layout/mobile-layout"

export default function ProfilePage() {
  return (
    <MobileLayout title="Profil" activeTab="profile">
      <div className="px-4 py-4 space-y-4">
        <h1 className="text-lg font-semibold">Profil</h1>
        <p className="text-sm text-muted-foreground">Pengaturan profil akan tersedia di sini.</p>
      </div>
    </MobileLayout>
  )
}


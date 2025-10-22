'use client'

import { ProdukList } from '@/components/epasar'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EpasarPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('epasar')
  const router = useRouter()

  useEffect(() => {
    // Defer state update to avoid cascading renders
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", "/epasar", "/profile"]
    const target = routes[index]
    if (!target) return
    if (target === "/") {
      setActiveTab("beranda")
      router.push("/")
    } else {
      router.push(target)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <MobileLayout
      title="e-Pasar"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="p-4">
        <ProdukList />
      </div>
    </MobileLayout>
  )
}
'use client'

import DocTabs from '@/components/doctabs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MobileHeader } from './mobile-header'

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  backRoute?: string
  showBottomNav?: boolean
  activeTab?: string
  onTabChange?: (index: number | null) => void
}

/**
 * Komponen layout untuk aplikasi mobile
 * Menggabungkan header dan bottom navigation yang konsisten
 */
export function MobileLayout({
  children,
  title = 'Portal SmartGov',
  showBackButton = false,
  backRoute = '/',
  showBottomNav = true,
  activeTab = 'beranda',
  onTabChange
}: MobileLayoutProps) {
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => setMounted(true), 0)
  }, [])

  // Default tab change handler
  const router = useRouter()

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    const routes: (string | null)[] = ["/", "/berita", "/pengaduan", "/layanan", "/epasar", null, "/profile"]
    const target = routes[index]
    if (target) {
      router.push(target)
    } else if (onTabChange) {
      onTabChange(index)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-background min-h-screen shadow-sm">
        {/* Header */}
        <MobileHeader 
          title={title}
          showBackButton={showBackButton}
          backRoute={backRoute}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <footer className="fixed bottom-1 left-1/2 transform -translate-x-1/2 z-50">
            <DocTabs onChange={onTabChange || handleTabChange} activeTab={activeTab} />
          </footer>
        )}
      </div>
    </div>
  )
}
'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { useSocket } from '@/hooks/useSocket'
import { Bell, Home, Wifi, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Komponen header untuk aplikasi mobile
 * Menampilkan logo, judul, notifikasi, dan status koneksi
 */
export function MobileHeader({ 
  title = 'Portal SmartGov',
  showBackButton = false,
  backRoute = '/'
}: {
  title?: string
  showBackButton?: boolean
  backRoute?: string
}) {
  const router = useRouter()
  const { isConnected } = useSocket('user')

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back()
    } else {
      router.push(backRoute)
    }
  }

  return (
    <header className="bg-primary text-primary-foreground p-3 shadow-md sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-md hover:bg-primary-foreground/20 h-8 w-8 p-0 text-primary-foreground"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
            <Home size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="inline-flex items-center justify-center rounded-md hover:bg-primary-foreground/20 h-8 w-8 p-0 text-primary-foreground">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-300">
                <Wifi size={14} />
                <span className="text-xs font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-300">
                <WifiOff size={14} />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
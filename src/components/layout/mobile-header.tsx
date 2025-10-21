'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from '@/hooks/use-toast'
import { connectSocket, getSocket } from '@/lib/socket-client'
import { Bell, Home, Wifi, WifiOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [isConnected, setIsConnected] = useState(false)
  const realtimeNotif: Array<{ judul?: string; title?: string; pesan?: string; message?: string }> = [];

  // State for notification panel
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifikasi, setNotifikasi] = useState<Array<{ id: string; judul: string; pesan: string; tipe?: string; createdAt?: string; beritaId?: string | null; pengaduanId?: string | null; layananId?: string | null; dibaca?: boolean }>>([])
  const prevCountRef = useRef(0)

  // Filters & pagination
  const [notifFilter, setNotifFilter] = useState<'semua' | 'berita' | 'pengaduan' | 'layanan'>('semua')
  const [page, setPage] = useState(1)
  const LIMIT = 20
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // global unread count for badge
  const [globalUnread, setGlobalUnread] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Toast only for new incoming notifications (realtime)
  useEffect(() => {
    if (realtimeNotif.length > prevCountRef.current) {
      const latest = realtimeNotif[0]
      if (latest) {
        toast({ title: latest.judul || latest.title || 'Notifikasi baru', description: latest.pesan || latest.message })
      }
      prevCountRef.current = realtimeNotif.length
    }
  }, [realtimeNotif])

  // Socket connection indicator: observe socket status or connect once if absent
  useEffect(() => {
    let s = getSocket()
    if (!s) {
      s = connectSocket('user')
    }
    setIsConnected(!!s.connected)
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    return () => {
      s?.off('connect', onConnect)
      s?.off('disconnect', onDisconnect)
    }
  }, [])

  // Fetch notifications when panel opens (with pagination)
  useEffect(() => {
    if (!notifOpen) return
    setLoading(true)
    setPage(1)
    ;(async () => {
      try {
        const res = await fetch(`/api/notifikasi?untukAdmin=false&page=1&limit=${LIMIT}`)
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : []
          setNotifikasi(list)
          setHasMore(list.length === LIMIT)
        }
      } catch (e) {
        // ignore silently
      } finally {
        setLoading(false)
      }
    })()
  }, [notifOpen])

  // Poll unread count periodically for badge freshness
  useEffect(() => {
    let mounted = true
    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/notifikasi/unread-count?untukAdmin=false`)
        if (res.ok) {
          const data = await res.json()
          if (mounted) setGlobalUnread(typeof data.unread === 'number' ? data.unread : 0)
        }
      } catch {}
    }
    fetchCount()
    const id = setInterval(fetchCount, 45000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!notifOpen || !hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          void loadMore()
        }
      }
    }, { root: null, rootMargin: '0px', threshold: 1.0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [notifOpen, hasMore])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const next = page + 1
    try {
      const res = await fetch(`/api/notifikasi?untukAdmin=false&page=${next}&limit=${LIMIT}`)
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setNotifikasi(prev => [...prev, ...list])
        setPage(next)
        setHasMore(list.length === LIMIT)
      }
    } catch (e) {
      // ignore silently
    } finally {
      setLoadingMore(false)
    }
  }

  const unreadCount = useMemo(() => notifikasi.filter(n => !n.dibaca).length, [notifikasi])
  const badgeCount = globalUnread ?? unreadCount

  const formatRelative = (iso?: string) => {
    if (!iso) return ''
    const now = Date.now()
    const t = new Date(iso).getTime()
    const diff = Math.max(0, Math.floor((now - t) / 1000))
    if (diff < 60) return `${diff}s lalu`
    const m = Math.floor(diff / 60)
    if (m < 60) return `${m}m lalu`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}j lalu`
    const d = Math.floor(h / 24)
    return `${d}h lalu`
  }

  const linkForNotif = (n: { beritaId?: string | null; pengaduanId?: string | null; layananId?: string | null; tipe?: string }) => {
    if (n.beritaId) return `/berita/${n.beritaId}`
    if (n.pengaduanId) return `/pengaduan/${n.pengaduanId}`
    if (n.layananId) return `/layanan/${n.layananId}`
    if (n.tipe?.includes('BERITA')) return '/berita'
    if (n.tipe?.includes('PENGADUAN')) return '/pengaduan'
    if (n.tipe?.includes('LAYANAN')) return '/layanan'
    return '/'
  }
  const filteredNotifikasi = useMemo(() => {
    if (notifFilter === 'semua') return notifikasi
    return notifikasi.filter((n) => {
      if (!n.tipe) return false
      if (notifFilter === 'berita') return n.tipe.includes('BERITA')
      if (notifFilter === 'pengaduan') return n.tipe.includes('PENGADUAN')
      if (notifFilter === 'layanan') return n.tipe.includes('LAYANAN')
      return true
    })
  }, [notifikasi, notifFilter])

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
          <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
            <button
              onClick={() => setNotifOpen(true)}
              className="relative inline-flex items-center justify-center rounded-md hover:bg-primary-foreground/20 h-8 w-8 p-0 text-primary-foreground"
            >
              <Bell size={18} />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 min-w-4 px-[2px] flex items-center justify-center">
                  {badgeCount}
                </span>
              )}
            </button>

            <SheetContent side="right" className="w-full max-w-sm p-0">
              <SheetHeader className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <SheetTitle>Notifikasi</SheetTitle>
                  {badgeCount > 0 && (
                    <button
                      className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
                      onClick={async () => {
                        // local update
                        setNotifikasi(prev => prev.map(p => ({ ...p, dibaca: true })))
                        try {
                          await fetch('/api/notifikasi/mark-all-read', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ untukAdmin: false })
                          })
                          // refresh global count
                          try {
                            const res = await fetch(`/api/notifikasi/unread-count?untukAdmin=false`)
                            const data = await res.json()
                            setGlobalUnread(typeof data.unread === 'number' ? data.unread : 0)
                          } catch {}
                        } catch {}
                      }}
                    >
                      Tandai semua
                    </button>
                  )}
                </div>
              </SheetHeader>
              <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto space-y-2">
                <div className="pb-2 sticky top-0 bg-background z-10">
                  <Select value={notifFilter} onValueChange={(v: any) => setNotifFilter(v)}>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue placeholder="Filter notifikasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua</SelectItem>
                      <SelectItem value="berita">Berita</SelectItem>
                      <SelectItem value="pengaduan">Pengaduan</SelectItem>
                      <SelectItem value="layanan">Layanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-sm text-muted-foreground py-8 text-center">Memuat...</div>
                ) : filteredNotifikasi.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center">Belum ada notifikasi</div>
                ) : (
                  <>
                    {filteredNotifikasi.map((n) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          setNotifikasi(prev => prev.map(p => p.id === n.id ? { ...p, dibaca: true } : p))
                          try {
                            await fetch('/api/notifikasi', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ids: [n.id] })
                            })
                          } catch {}
                          // navigate to detail
                          router.push(linkForNotif(n))
                        }}
                        className="text-left bg-card rounded-lg border p-3 w-full"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground line-clamp-1 flex-1">{n.judul}</p>
                              <span className={`h-2.5 w-2.5 rounded-full ${n.dibaca ? 'bg-muted-foreground' : 'bg-green-500'}`} />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.pesan}</p>
                            <div className="text-[10px] text-muted-foreground mt-1">{formatRelative(n.createdAt)}</div>
                          </div>
                        </div>
                      </button>
                    ))}

                    <div ref={sentinelRef} className="h-6" />
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
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
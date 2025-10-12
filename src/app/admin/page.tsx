'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartAreaInteractive } from '@/components/ui/chart-area-interactive'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useSocket } from '@/hooks/useSocket'
import {
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  Home,
  Image,
  LayoutGrid,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Berita {
  id: string
  judul: string
  isi: string
  gambar?: string
  published: boolean
  kategori: {
    id: string
    nama: string
  }
  createdAt: string
}

interface Kategori {
  id: string
  nama: string
  deskripsi?: string
}

interface Laporan {
  id: string
  judul: string
  keterangan: string
  foto?: string
  latitude?: number
  longitude?: number
  status: string
  createdAt: string
  balasan: Array<{
    id: string
    isi: string
    dariAdmin: boolean
    createdAt: string
  }>
}

interface Notifikasi {
  id: string
  judul: string
  pesan: string
  tipe: string
  untukAdmin: boolean
  dibaca: boolean
  createdAt: string
}

interface Layanan {
  id: string
  judul: string
  jenisLayanan: string
  status: string
  namaLengkap: string
  nik: string
  email?: string
  createdAt: string
  updatedAt: string
  balasan?: Array<{
    id: string
    isi: string
    dariAdmin: boolean
    createdAt: string
  }>
  unreadUserReplies?: number
}

interface Aktivitas {
  id: string
  judul: string
  deskripsi: string
  tipe: string
  status: string
  pengguna: string
  target: number
  limit: number
  reviewer: string
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [berita, setBerita] = useState<Berita[]>([])
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [layanan, setLayanan] = useState<Layanan[]>([])
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [chartPeriod, setChartPeriod] = useState('3months')
  const [searchQuery, setSearchQuery] = useState('')
  const [aktivitasData, setAktivitasData] = useState<Aktivitas[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  
  // Socket integration
  const { isConnected, connectionError, notifications: realtimeNotif, clearNotifications } = useSocket('admin')
  
  // Form states
  const [kategoriForm, setKategoriForm] = useState({
    nama: '',
    deskripsi: ''
  })
  const [balasanForm, setBalasanForm] = useState('')
  const [selectedLaporan, setSelectedLaporan] = useState<string | null>(null)
  const [selectedLayanan, setSelectedLayanan] = useState<string | null>(null)
  const [layananBalasanForm, setLayananBalasanForm] = useState('')
  const [layananStatusForm, setLayananStatusForm] = useState({
    status: '',
    catatan: '',
    alasanPenolakan: '',
    estimasiSelesai: ''
  })
  const [notifFilter, setNotifFilter] = useState('semua')

  // Memoized data for charts
  const laporanStatusData = useMemo(() => {
    const data = [
      { name: 'Baru', value: laporan.filter(l => l.status === 'BARU').length || 5, fill: 'var(--chart-2)' },
      { name: 'Ditampung', value: laporan.filter(l => l.status === 'DITAMPUNG').length || 3, fill: 'var(--chart-3)' },
      { name: 'Diteruskan', value: laporan.filter(l => l.status === 'DITERUSKAN').length || 2, fill: 'var(--chart-4)' },
      { name: 'Dikerjakan', value: laporan.filter(l => l.status === 'DIKERJAKAN').length || 3, fill: 'var(--chart-1)' },
      { name: 'Selesai', value: laporan.filter(l => l.status === 'SELESAI').length || 8, fill: 'var(--chart-5)' }
    ]
    return data
  }, [laporan])

  const layananStatusData = useMemo(() => {
    const data = [
      { name: 'Diterima', value: layanan.filter(l => l.status === 'DITERIMA').length || 7, fill: 'var(--chart-1)' },
      { name: 'Diproses', value: layanan.filter(l => l.status === 'DIPROSES').length || 5, fill: 'var(--chart-2)' },
      { name: 'Diverifikasi', value: layanan.filter(l => l.status === 'DIVERIFIKASI').length || 3, fill: 'var(--chart-3)' },
      { name: 'Selesai', value: layanan.filter(l => l.status === 'SELESAI').length || 10, fill: 'var(--chart-4)' },
      { name: 'Ditolak', value: layanan.filter(l => l.status === 'DITOLAK').length || 2, fill: 'var(--chart-5)' }
    ]
    return data
  }, [layanan])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Add error boundary for debugging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Admin: JavaScript error:', event.error)
    }
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Admin: Unhandled promise rejection:', event.reason)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const fetchData = async () => {
    // Skip data fetching during build time
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      const [beritaRes, kategoriRes, laporanRes, layananRes, notifRes] = await Promise.all([
        fetch('/api/berita'),
        fetch('/api/kategori'),
        fetch('/api/laporan'),
        fetch('/api/admin/layanan'),
        fetch('/api/notifikasi')
      ])
      
      if (beritaRes.ok) {
        const beritaData = await beritaRes.json()
        setBerita(beritaData)
      }
      
      if (kategoriRes.ok) {
        const kategoriData = await kategoriRes.json()
        setKategori(kategoriData)
      }
      
      if (laporanRes.ok) {
        const laporanData = await laporanRes.json()
        setLaporan(laporanData)
      }

      if (layananRes.ok) {
        const layananData = await layananRes.json()
        setLayanan(layananData.data || [])
      } else {
        // If admin API fails, try the regular API
        const regularLayananRes = await fetch('/api/layanan')
        if (regularLayananRes.ok) {
          const layananData = await regularLayananRes.json()
          setLayanan(layananData.data || [])
        }
      }
      
      if (notifRes.ok) {
        const notifData = await notifRes.json()
        setNotifikasi(notifData)
      }
    } catch (error) {
      console.error('Admin: Error fetching data:', error)
    }
  }

  const handleCreateKategori = async () => {
    try {
      const response = await fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kategoriForm)
      })

      if (response.ok) {
        toast.success('Kategori berhasil dibuat!')
        setKategoriForm({ nama: '', deskripsi: '' })
        fetchData()
      } else {
        toast.error('Gagal membuat kategori')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleUpdateStatusLaporan = async (laporanId: string, status: string) => {
    try {
      const response = await fetch(`/api/laporan/${laporanId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Status laporan berhasil diperbarui!')
        fetchData()
      } else {
        toast.error('Gagal memperbarui status')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleBalasLaporan = async (laporanId: string) => {
    if (!balasanForm.trim()) return

    try {
      const response = await fetch(`/api/laporan/${laporanId}/balasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isi: balasanForm, dariAdmin: true })
      })

      if (response.ok) {
        toast.success('Balasan berhasil dikirim!')
        setBalasanForm('')
        fetchData()
      } else {
        toast.error('Gagal mengirim balasan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleUpdateStatusLayanan = async (layananId: string) => {
    try {
      const response = await fetch(`/api/admin/layanan/${layananId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layananStatusForm)
      })

      if (response.ok) {
        toast.success('Status layanan berhasil diperbarui!')
        setLayananStatusForm({ status: '', catatan: '', alasanPenolakan: '', estimasiSelesai: '' })
        setSelectedLayanan(null)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui status')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleBalasLayanan = async (layananId: string) => {
    if (!layananBalasanForm.trim()) return

    try {
      const response = await fetch(`/api/admin/layanan/${layananId}/balasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesan: layananBalasanForm })
      })

      if (response.ok) {
        toast.success('Balasan berhasil dikirim!')
        setLayananBalasanForm('')
        fetchData()
      } else {
        toast.error('Gagal mengirim balasan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleMarkAsRead = async (notifId: string) => {
    try {
      // Update local state immediately for better UX
      setNotifikasi(prev =>
        prev.map(notif =>
          notif.id === notifId ? { ...notif, dibaca: true } : notif
        )
      )
      
      // In a real app, you would call an API here
      // const response = await fetch(`/api/notifikasi/${notifId}/read`, {
      //   method: 'PUT'
      // })
      
      toast.success('Notifikasi ditandai sebagai dibaca')
    } catch (error) {
      toast.error('Gagal menandai notifikasi')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      BARU: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
      DITAMPUNG: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
      DITERUSKAN: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
      DIKERJAKAN: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
      SELESAI: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    }
    return colors[status] || 'bg-muted text-muted-foreground border-border'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'BARU': return <AlertCircle size={16} />
      case 'DITAMPUNG': return <Clock size={16} />
      case 'SELESAI': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const unreadCount = notifikasi.filter(n => !n.dibaca && n.untukAdmin).length
  
  // Filter notifikasi berdasarkan tipe
  const filteredNotifikasi = useMemo(() => {
    if (notifFilter === 'semua') {
      return notifikasi
    }
    
    return notifikasi.filter(notif => {
      if (notifFilter === 'berita') {
        return notif.tipe.includes('BERITA')
      } else if (notifFilter === 'laporan') {
        return notif.tipe.includes('LAPORAN')
      } else if (notifFilter === 'layanan') {
        return notif.tipe.includes('LAYANAN')
      }
      return false
    })
  }, [notifikasi, notifFilter])

  // Generate dummy chart data based on period
  const generateChartData = () => {
    const now = new Date()
    const data: Array<{
      date: string
      pengunjung: number
      berita: number
      laporan: number
    }> = []
    
    if (chartPeriod === '7days') {
      // Last 7 days - use deterministic data
      const visitorData = [350, 420, 380, 450, 500, 480, 520]
      const beritaData = [3, 5, 4, 6, 8, 7, 9]
      const laporanData = [2, 3, 4, 3, 5, 4, 6]
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
          pengunjung: visitorData[6 - i],
          berita: beritaData[6 - i],
          laporan: laporanData[6 - i]
        })
      }
    } else if (chartPeriod === '30days') {
      // Last 30 days (grouped by week) - use deterministic data
      const visitorData = [2000, 2500, 3000, 2800]
      const beritaData = [15, 25, 30, 28]
      const laporanData = [10, 15, 20, 18]
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        data.push({
          date: `Minggu ${4 - i}`,
          pengunjung: visitorData[3 - i],
          berita: beritaData[3 - i],
          laporan: laporanData[3 - i]
        })
      }
    } else {
      // Last 3 months - use deterministic data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const visitorData = [8000, 10000, 12000]
      const beritaData = [50, 100, 150]
      const laporanData = [30, 60, 90]
      
      for (let i = 2; i >= 0; i--) {
        const month = new Date(now)
        month.setMonth(month.getMonth() - i)
        data.push({
          date: months[month.getMonth()],
          pengunjung: visitorData[2 - i],
          berita: beritaData[2 - i],
          laporan: laporanData[2 - i]
        })
      }
    }
    
    return data
  }

  const chartData = generateChartData()
  
  // Memoize chart data to prevent regeneration on every render
  const memoizedChartData = useMemo(() => chartData, [chartPeriod])

  // Generate dummy aktivitas data
  useEffect(() => {
    const data: Aktivitas[] = []
    const jenisAktivitas = ['berita', 'laporan', 'kategori', 'notifikasi', 'user']
    const aksi = ['dibuat', 'diedit', 'dihapus', 'dipublikasi', 'dikomentari']
    const status = ['success', 'pending', 'failed']
    
    // Use deterministic data based on index
    for (let i = 1; i <= 20; i++) {
      const jenisIndex = i % jenisAktivitas.length
      const aksiIndex = (i + 1) % aksi.length
      const statusIndex = (i + 2) % status.length
      const userIndex = i % 5
      const reviewerIndex = i % 3
      
      const randomJenis = jenisAktivitas[jenisIndex]
      const randomAksi = aksi[aksiIndex]
      const randomStatus = status[statusIndex]
      const randomUser = ['Admin', 'User1', 'User2', 'User3', 'User4'][userIndex]
      
      data.push({
        id: `aktivitas-${i}`,
        judul: `${randomJenis.charAt(0).toUpperCase() + randomJenis.slice(1)} ${randomAksi}`,
        deskripsi: `${randomJenis} telah ${randomAksi} oleh ${randomUser}`,
        tipe: randomJenis,
        status: randomStatus,
        pengguna: randomUser,
        target: (i * 5) % 100 + 1,
        limit: (i * 3) % 50 + 1,
        reviewer: ['Admin', 'Editor', 'Moderator'][reviewerIndex],
        createdAt: new Date(Date.now() - (i % 7) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - (i % 3) * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    setAktivitasData(data)
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'berita', label: 'Berita', icon: FileText },
    { id: 'kategori', label: 'Kategori', icon: Settings },
    { id: 'laporan', label: 'Laporan', icon: MessageSquare },
    { id: 'layanan', label: 'Layanan', icon: FileText },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}>
        {/* Top Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <FileText className="text-sidebar-primary-foreground" size={28} />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">SmartGov</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="default"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-10 w-10 p-0"
            >
              {sidebarOpen ? <X className="text-sidebar-foreground" size={28} /> : <Menu className="text-sidebar-foreground" size={28} />}
            </Button>
          </div>
        </div>

        {/* Menu Section */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="relative">
                  <Button
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="default"
                    className={`w-full justify-start h-10 ${!sidebarOpen && 'px-2'} active:shadow-none active:scale-[0.98] transition-all duration-200`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    {sidebarOpen && <span className="ml-8 text-sidebar-foreground">{item.label}</span>}
                  </Button>
                  <Icon
                    className={`absolute top-1/2 transform -translate-y-1/2 text-sidebar-foreground pointer-events-none ${sidebarOpen ? 'left-3' : 'left-1/2 -translate-x-1/2'}`}
                    width="28"
                    height="28"
                    strokeWidth="1.5"
                  />
                </div>
              )
            })}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="default"
                className={`w-full justify-between h-10 ${!sidebarOpen && 'px-2'} active:shadow-none active:scale-[0.98] transition-all duration-200`}
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <div className="flex items-center">
                  {sidebarOpen && <span className="ml-8 text-sidebar-foreground">Settings</span>}
                </div>
                {sidebarOpen && (
                  settingsOpen ? <ChevronDown className="text-sidebar-foreground" size={28} /> : <ChevronRight className="text-sidebar-foreground" size={28} />
                )}
              </Button>
              <Settings
                className={`absolute top-1/2 transform -translate-y-1/2 text-sidebar-foreground pointer-events-none ${sidebarOpen ? 'left-3' : 'left-1/2 -translate-x-1/2'}`}
                width="28"
                height="28"
                strokeWidth="1.5"
              />
            </div>
            
            {settingsOpen && sidebarOpen && (
              <div className="ml-6 space-y-2">
                <Button variant="ghost" size="default" className="w-full justify-start h-10 active:shadow-none active:scale-[0.98] transition-all duration-200">
                  <Image className="text-sidebar-foreground mr-2" size={28} />
                  <span className="text-sidebar-foreground">Image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-start h-10 active:shadow-none active:scale-[0.98] transition-all duration-200"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="text-sidebar-foreground mr-2" size={28} /> : <Moon className="text-sidebar-foreground mr-2" size={28} />}
                  <span className="text-sidebar-foreground">Themes</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card shadow-sm border-border">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'}>
                  <Home className="mr-2" size={18} />
                  Kembali
                </Button>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button variant="outline" size="sm" className="transition-all duration-200 active:shadow-none active:scale-[0.98]">
                    <Bell className="text-foreground mr-2" size={18} />
                    <span className="text-foreground">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Wifi size={16} />
                      <span className="text-xs text-foreground">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <WifiOff size={16} />
                      <span className="text-xs text-foreground">Disconnected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    {/* Total Berita Card */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div className="text-muted-foreground text-sm">Total Berita</div>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{berita.length}</CardTitle>
                        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                          <Badge className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +15%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex px-6 [.border-t]:pt-6 flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Trending up this month <TrendingUp size={16} />
                        </div>
                        <div className="text-muted-foreground">Berita published for the last 6 months</div>
                      </CardFooter>
                    </Card>

                    {/* Total Laporan Card */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div className="text-muted-foreground text-sm">Laporan Masuk</div>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{laporan.length}</CardTitle>
                        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                          <Badge variant="destructive" className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1">
                            <TrendingDown className="h-3 w-3" />
                            -8%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex px-6 [.border-t]:pt-6 flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Down 7% this period <TrendingDown size={16} />
                        </div>
                        <div className="text-muted-foreground">Reports need attention</div>
                      </CardFooter>
                    </Card>

                    {/* Active Kategori Card */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div className="text-muted-foreground text-sm">Kategori Aktif</div>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{kategori.length}</CardTitle>
                        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                          <Badge className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +12%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex px-6 [.border-t]:pt-6 flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Strong category retention <TrendingUp size={16} />
                        </div>
                        <div className="text-muted-foreground">Engagement exceeds targets</div>
                      </CardFooter>
                    </Card>

                    {/* Notifikasi Card */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div className="text-muted-foreground text-sm">Notifikasi Aktif</div>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{unreadCount}</CardTitle>
                        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                          <Badge className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +20%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex px-6 [.border-t]:pt-6 flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Steady performance increase <TrendingUp size={16} />
                        </div>
                        <div className="text-muted-foreground">Meets growth projections</div>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Visitor Analytics Chart - Full Width */}
                  <div className="px-4 lg:px-6">
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardContent className="px-6 pt-6">
                        <ChartAreaInteractive />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Section - Laporan dan Layanan */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
                    {/* Laporan Status Chart */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div>
                          <CardTitle className="leading-none font-semibold">Statistik Laporan</CardTitle>
                          <div className="text-muted-foreground text-sm">
                            <span className="hidden @[540px]/card:block">Distribusi status laporan masuk</span>
                            <span className="@[540px]/card:hidden">Status laporan</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        <div
                          className="h-[250px] w-full"
                          style={{
                            '--color-baru': 'var(--chart-2)',
                            '--color-ditampung': 'var(--chart-3)',
                            '--color-diteruskan': 'var(--chart-4)',
                            '--color-dikerjakan': 'var(--chart-5)',
                            '--color-selesai': 'var(--chart-1)'
                          } as React.CSSProperties}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={laporanStatusData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                              />
                              <YAxis
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                              />
                              <Bar
                                dataKey="value"
                                radius={[4, 4, 0, 0]}
                                name="Status"
                              >
                                {laporanStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center mt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                            <span>Total: {laporan.length || 25} laporan</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Layanan Status Chart */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div>
                          <CardTitle className="leading-none font-semibold">Statistik Layanan</CardTitle>
                          <div className="text-muted-foreground text-sm">
                            <span className="hidden @[540px]/card:block">Distribusi status layanan masuk</span>
                            <span className="@[540px]/card:hidden">Status layanan</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        <div
                          className="h-[250px] w-full"
                          style={{
                            '--color-diterima': 'var(--chart-1)',
                            '--color-diproses': 'var(--chart-2)',
                            '--color-diverifikasi': 'var(--chart-3)',
                            '--color-selesai': 'var(--chart-4)',
                            '--color-ditolak': 'var(--chart-5)'
                          } as React.CSSProperties}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={layananStatusData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11 }}
                                className="text-muted-foreground"
                              />
                              <YAxis
                                tick={{ fontSize: 12 }}
                                className="text-muted-foreground"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                              />
                              <Bar
                                dataKey="value"
                                radius={[4, 4, 0, 0]}
                                name="Status"
                              >
                                {layananStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center mt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                            <span>Total: {layanan.length || 27} layanan</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity Table */}
                  <div className="px-4 lg:px-6 mt-6">
                    <div dir="ltr" data-orientation="horizontal" className="flex w-full flex-col justify-start gap-6">
                      <div className="flex items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-2">
                          <Label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="view-selector">View</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <LayoutGrid className="mr-2" size={18} />
                            Kustomisasi Kolom
                          </Button>
                          <Button>
                            <Plus className="mr-2" size={18} />
                            Tambah Section
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 outline-none relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                        <div className="overflow-hidden rounded-lg border-border border">
                          <div className="relative w-full overflow-y-auto overflow-x-hidden">
                            <Table className="w-full caption-bottom text-sm">
                              <TableHeader className="[&_tr]:border-b sticky top-0 z-10 bg-muted">
                                <TableRow className="border-b transition-colors data-[state=selected]:bg-muted">
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}></TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>
                                    <div className="flex items-center justify-center">
                                      <Checkbox
                                        checked={selectAll}
                                        onCheckedChange={(checked) => {
                                          const isChecked = checked === true
                                          if (isChecked) {
                                            setSelectedItems(aktivitasData.map(item => item.id))
                                          } else {
                                            setSelectedItems([])
                                          }
                                          setSelectAll(isChecked)
                                        }}
                                        aria-label="Select all"
                                      />
                                    </div>
                                  </TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>Judul</TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>Tipe</TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>Status</TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>
                                    <div className="w-full text-right">Target</div>
                                  </TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>
                                    <div className="w-full text-right">Limit</div>
                                  </TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}>Reviewer</TableHead>
                                  <TableHead className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0" colSpan={1}></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody className="[&_tr:last-child]:border-0 **:data-[slot=table-cell]:first:w-8">
                                {/* Aktivitas Data Rows */}
                                {aktivitasData.map((item) => (
                                  <TableRow key={item.id} className="border-b transition-colors data-[state=selected]:bg-muted">
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 size-7 text-muted-foreground" role="button" tabIndex={0} aria-disabled="false" aria-roledescription="sortable">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical size-3 text-muted-foreground">
                                          <circle cx="9" cy="12" r="1"></circle>
                                          <circle cx="9" cy="5" r="1"></circle>
                                          <circle cx="9" cy="19" r="1"></circle>
                                          <circle cx="15" cy="12" r="1"></circle>
                                          <circle cx="15" cy="5" r="1"></circle>
                                          <circle cx="15" cy="19" r="1"></circle>
                                        </svg>
                                        <span className="sr-only">Drag to reorder</span>
                                      </button>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <div className="flex items-center justify-center">
                                        <Checkbox
                                          checked={selectedItems.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            const isChecked = checked === true
                                            if (isChecked) {
                                              setSelectedItems([...selectedItems, item.id])
                                            } else {
                                              setSelectedItems(selectedItems.filter(id => id !== item.id))
                                            }
                                          }}
                                          aria-label="Select row"
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 h-9 py-2 w-fit px-0 text-left text-foreground" type="button">
                                        {item.judul}
                                      </button>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <div className="w-32">
                                        <div className="inline-flex items-center rounded-md border py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 px-1.5 text-muted-foreground">
                                          {item.tipe}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <Badge className={getStatusColor(item.status)}>
                                        {item.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <form>
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor={`${item.id}-target`}>Target</label>
                                        <input className="flex rounded-md border px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border focus-visible:bg-background" id={`${item.id}-target`} value={item.target} readOnly />
                                      </form>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <form>
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only" htmlFor={`${item.id}-limit`}>Limit</label>
                                        <input className="flex rounded-md border px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border focus-visible:bg-background" id={`${item.id}-limit`} value={item.limit} readOnly />
                                      </form>
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      {item.reviewer}
                                    </TableCell>
                                    <TableCell className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                      <button className="items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground flex size-8 text-muted-foreground data-[state=open]:bg-muted" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical">
                                          <circle cx="12" cy="12" r="1"></circle>
                                          <circle cx="12" cy="5" r="1"></circle>
                                          <circle cx="12" cy="19" r="1"></circle>
                                        </svg>
                                        <span className="sr-only">Open menu</span>
                                      </button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4">
                          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                            0 dari 0 baris dipilih.
                          </div>
                          <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                              <Label className="flex items-center gap-2 select-none text-sm font-medium" htmlFor="rows-per-page">Baris per halaman</Label>
                              <Select defaultValue="10">
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                              Halaman 1 dari 0
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                              <button
                                disabled
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="rotate-180" size={20} />
                              </button>
                              <button
                                disabled
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronRight size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              {/* Tab contents for non-dashboard tabs */}
            {/* Tab Dashboard */}
            <TabsContent value="dashboard" className="space-y-6 mt-6">
              {/* Dashboard content is already rendered above */}
            </TabsContent>

            {/* Tab Berita */}
            <TabsContent value="berita" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Berita</h2>
                <Button onClick={() => {
                  window.location.href = '/tambah-berita'
                }}>
                  <Plus className="mr-2" size={18} />
                  Tambah Berita
                </Button>
              </div>

              <div className="grid gap-4">
                {berita.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Belum ada berita</p>
                  </div>
                ) : (
                  berita.map((item) => (
                    <Card key={item.id} className="cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{item.judul}</h3>
                            <p className="text-muted-foreground mt-2">{item.isi.substring(0, 100)}...</p>
                            <div className="flex items-center gap-2 mt-4">
                              <Badge variant="secondary">{item.kategori?.nama || 'No Category'}</Badge>
                              <Badge variant={item.published ? "default" : "outline"}>
                                {item.published ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                // Edit functionality here
                              }}
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                // Delete functionality here
                              }}
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab Kategori */}
            <TabsContent value="kategori" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Kategori</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2" size={18} />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Kategori Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nama">Nama Kategori</Label>
                        <Input
                          id="nama"
                          value={kategoriForm.nama}
                          onChange={(e) => setKategoriForm({ ...kategoriForm, nama: e.target.value })}
                          placeholder="Masukkan nama kategori"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Textarea
                          id="deskripsi"
                          value={kategoriForm.deskripsi}
                          onChange={(e) => setKategoriForm({ ...kategoriForm, deskripsi: e.target.value })}
                          placeholder="Masukkan deskripsi kategori"
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleCreateKategori} className="w-full">
                        Simpan Kategori
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kategori.map((item) => (
                  <Card key={item.id} className="cursor-pointer">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold">{item.nama}</h3>
                      <p className="text-muted-foreground mt-2">{item.deskripsi || 'Tidak ada deskripsi'}</p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            // Edit functionality here
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => {
                            // Delete functionality here
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab Laporan */}
            <TabsContent value="laporan" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Laporan</h2>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="mr-2" size={18} />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {laporan.map((item) => (
                  <Card key={item.id} className="cursor-pointer">
                    <CardContent className="p-4">
                      {/* Foto Laporan */}
                      <div className="w-full h-48 bg-muted rounded-lg mb-4 overflow-hidden relative">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.judul}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Image size={48} className="mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground text-sm">No Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-semibold line-clamp-2">{item.judul}</h3>
                          <p className="text-muted-foreground mt-1 text-sm line-clamp-3">{item.keterangan}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              // View functionality here
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Edit functionality here
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-left">
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {item.status}
                            </div>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Update */}
                      <div className="flex gap-2 mb-3">
                        <Select onValueChange={(value) => handleUpdateStatusLaporan(item.id, value)}>
                          <SelectTrigger className="w-32 text-sm">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BARU">Baru</SelectItem>
                            <SelectItem value="DITAMPUNG">Ditampung</SelectItem>
                            <SelectItem value="DITERUSKAN">Diteruskan</SelectItem>
                            <SelectItem value="DIKERJAKAN">Dikerjakan</SelectItem>
                            <SelectItem value="SELESAI">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Balasan Section - Compact */}
                      {item.balasan && item.balasan.length > 0 && (
                        <div className="mb-3 p-3 bg-muted rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Balasan ({item.balasan.length}):</h4>
                          <div className="max-h-20 overflow-y-auto space-y-1">
                            {item.balasan.slice(0, 2).map((balasan) => (
                              <div key={balasan.id} className="text-xs">
                                <div className="flex items-center gap-1">
                                  <Badge variant={balasan.dariAdmin ? "default" : "secondary"} className="text-xs px-1 py-0">
                                    {balasan.dariAdmin ? "Admin" : "User"}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {new Date(balasan.createdAt).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                                <p className="mt-1 line-clamp-2">{balasan.isi}</p>
                              </div>
                            ))}
                            {item.balasan.length > 2 && (
                              <p className="text-xs text-muted-foreground italic">
                                +{item.balasan.length - 2} balasan lainnya
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Balas Form - Compact */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tulis balasan..."
                          value={selectedLaporan === item.id ? balasanForm : ''}
                          onChange={(e) => {
                            setSelectedLaporan(item.id)
                            setBalasanForm(e.target.value)
                          }}
                          className="text-sm"
                        />
                        <button
                          onClick={() => handleBalasLaporan(item.id)}
                          disabled={!balasanForm.trim()}
                          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab Layanan */}
            <TabsContent value="layanan" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Layanan</h2>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="mr-2" size={18} />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4">
                {layanan.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{item.judul}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.jenisLayanan}</Badge>
                            <Badge className={getStatusColor(item.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(item.status)}
                                {item.status}
                              </div>
                            </Badge>
                            {item.unreadUserReplies && item.unreadUserReplies > 0 && (
                              <Badge variant="destructive">
                                {item.unreadUserReplies} balasan baru
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Nama:</span> {item.namaLengkap}
                          </div>
                          <div>
                            <span className="font-medium">NIK:</span> {item.nik}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {item.email || '-'}
                          </div>
                          <div>
                            <span className="font-medium">User:</span> {item.namaLengkap}
                          </div>
                        </div>

                        {/* Status Update Form */}
                        {selectedLayanan === item.id && (
                          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                            <h4 className="font-medium">Update Status Layanan</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Status</Label>
                                <Select value={layananStatusForm.status} onValueChange={(value) => setLayananStatusForm(prev => ({ ...prev, status: value }))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="DITERIMA">Diterima</SelectItem>
                                    <SelectItem value="DIPROSES">Diproses</SelectItem>
                                    <SelectItem value="DIVERIFIKASI">Diverifikasi</SelectItem>
                                    <SelectItem value="SELESAI">Selesai</SelectItem>
                                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Estimasi Selesai</Label>
                                <Input
                                  placeholder="Contoh: 2-3 hari kerja"
                                  value={layananStatusForm.estimasiSelesai}
                                  onChange={(e) => setLayananStatusForm(prev => ({ ...prev, estimasiSelesai: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Catatan</Label>
                              <Textarea
                                placeholder="Catatan untuk pengguna"
                                value={layananStatusForm.catatan}
                                onChange={(e) => setLayananStatusForm(prev => ({ ...prev, catatan: e.target.value }))}
                              />
                            </div>
                            {layananStatusForm.status === 'DITOLAK' && (
                              <div>
                                <Label>Alasan Penolakan *</Label>
                                <Textarea
                                  placeholder="Alasan penolakan wajib diisi"
                                  value={layananStatusForm.alasanPenolakan}
                                  onChange={(e) => setLayananStatusForm(prev => ({ ...prev, alasanPenolakan: e.target.value }))}
                                  required
                                />
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button onClick={() => handleUpdateStatusLayanan(item.id)} disabled={!layananStatusForm.status}>
                                Update Status
                              </Button>
                              <Button variant="outline" onClick={() => {
                                setSelectedLayanan(null)
                                setLayananStatusForm({ status: '', catatan: '', alasanPenolakan: '', estimasiSelesai: '' })
                              }}>
                                Batal
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Balasan */}
                        <div className="space-y-3">
                          <h4 className="font-medium">Balasan</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {item.balasan && item.balasan.length > 0 ? (
                              item.balasan.map((balasan) => (
                                <div key={balasan.id} className={`p-2 rounded-lg text-sm ${balasan.dariAdmin ? 'bg-blue-50 ml-4' : 'bg-gray-50'}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{balasan.dariAdmin ? 'Admin' : 'User'}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(balasan.createdAt).toLocaleString('id-ID')}
                                    </span>
                                  </div>
                                  <p>{balasan.isi}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Belum ada balasan</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Kirim balasan..."
                              value={layananBalasanForm}
                              onChange={(e) => setLayananBalasanForm(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleBalasLayanan(item.id)
                                }
                              }}
                            />
                            <Button 
                              onClick={() => handleBalasLayanan(item.id)} 
                              disabled={!layananBalasanForm.trim()}
                              size="sm"
                            >
                              <Send size={18} />
                            </Button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLayanan(selectedLayanan === item.id ? null : item.id)}
                          >
                            <Edit size={16} className="mr-1" />
                            {selectedLayanan === item.id ? 'Tutup' : 'Update Status'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {layanan.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">Belum ada layanan</p>
                      <p className="text-sm text-muted-foreground">Belum ada pengajuan layanan dari pengguna</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Notifikasi */}
            <TabsContent value="notifikasi" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Notifikasi</h2>
                <div className="flex gap-2">
                  <Select value={notifFilter} onValueChange={setNotifFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua</SelectItem>
                      <SelectItem value="berita">Berita</SelectItem>
                      <SelectItem value="laporan">Laporan</SelectItem>
                      <SelectItem value="layanan">Layanan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="mr-2" size={18} />
                    Refresh
                  </Button>
                  <Button variant="outline">
                    <Plus className="mr-2" size={18} />
                    Buat Notifikasi
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotifikasi.map((item) => (
                  <Card key={item.id} className={`${item.dibaca ? "opacity-60" : ""} cursor-pointer`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold line-clamp-2">{item.judul}</h3>
                        <div className="flex gap-1">
                          {!item.dibaca && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(item.id)}
                              className="h-8 px-2 text-xs"
                            >
                              Baca
                            </Button>
                          )}
                          <button
                            onClick={() => {
                              // Delete functionality here
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.pesan}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.tipe.includes('BARU') ? 'default' : item.tipe.includes('UPDATE') ? 'secondary' : 'outline'} className="text-xs">
                            {item.tipe.replace('_', ' ')}
                          </Badge>
                          <Badge variant={item.untukAdmin ? "default" : "secondary"} className="text-xs">
                            {item.untukAdmin ? "Admin" : "User"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
        </main>
      </div>
    </div>
  )
}

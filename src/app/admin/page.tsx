'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

import { ChartAreaInteractive } from '@/components/ui/chart-area-interactive'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ChartPieLayanan } from '@/components/ui/pie-chart-layanan'


import EditBeritaForm from '@/components/edit-berita-form'
import CacheManagement from '@/components/admin/cache-management'
import { LucideIcon } from '@/components/ui/lucide-icon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast as appToast } from '@/hooks/use-toast'
import { playNotifSound } from '@/lib/notif-sound'
import { connectSocket } from '@/lib/socket-client'
import { Produk, KategoriProduk } from '@/types/epasar'

import '@/styles/mdxeditor-theme.css'
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import {
    AlertCircle,
    BarChart3,
    Bell,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Database,
    Edit,
    Eye,
    FileText,
    Filter,
    Home,
    Image,
    LayoutGrid,
    MessageSquare,
    Moon,
    Package,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    RefreshCw,
    Save,
    Search,
    Send,
    Settings,
    ShoppingCart,
    Store,
    Sun,
    Trash2,
    TreePine,
    TrendingDown,
    TrendingUp,
    Users,
    Wifi,
    WifiOff,
    X
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import { marked } from 'marked'




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

interface Pengaduan {
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
  telepon?: string
  alamat: string
  rt?: string
  rw?: string
  kelurahan?: string
  kecamatan?: string
  kabupaten?: string
  provinsi?: string
  kodePos?: string
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

// TambahBeritaForm Component
interface TambahBeritaFormProps {
  onClose: () => void
  onSave: () => void
}

function TambahBeritaForm({ onClose, onSave }: TambahBeritaFormProps) {
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    gambar: '',
    kategoriId: '',
    published: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    fetchKategori()
  }, [])

  const fetchKategori = async () => {
    try {
      const response = await fetch('/api/kategori')
      if (response.ok) {
        const data = await response.json()
        setKategori(data)
      }
    } catch (error) {
      console.error('Error fetching kategori:', error)
      toast.error('Gagal memuat kategori')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.judul.trim() || !formData.isi.trim() || !formData.kategoriId) {
      toast.error('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/berita', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Berita berhasil dibuat!')
        onSave()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal membuat berita')
      }
    } catch (error) {
      console.error('Error creating berita:', error)
      toast.error('Terjadi kesalahan saat membuat berita')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.judul.trim() || !formData.isi.trim()) {
      toast.error('Mohon lengkapi judul dan isi berita')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/berita', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          published: false
        })
      })

      if (response.ok) {
        toast.success('Draft berhasil disimpan!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menyimpan draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Terjadi kesalahan saat menyimpan draft')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} className="mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Tambah Berita Baru</h1>
            <p className="text-sm text-muted-foreground">Buat dan publikasikan berita baru</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Simpan Draft
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
          >
            <Eye size={18} />
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Berita *</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Masukkan judul berita yang menarik"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori *</Label>
                <Select value={formData.kategoriId} onValueChange={(value) => setFormData({ ...formData, kategoriId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategori.map((kat) => (
                      <SelectItem key={kat.id} value={kat.id}>
                        {kat.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gambar">URL Gambar (Opsional)</Label>
              <Input
                id="gambar"
                value={formData.gambar}
                onChange={(e) => setFormData({ ...formData, gambar: e.target.value })}
                placeholder="https://example.com/gambar.jpg"
                className="w-full"
              />
              {formData.gambar && (
                <div className="mt-2">
                  <img 
                    src={formData.gambar} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Konten Berita *
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gunakan Markdown untuk menulis konten berita. Mendukung heading, lists, quotes, dan lainnya.
            </p>
          </CardHeader>
          <CardContent>
            {!isPreview ? (
              <div className="min-h-[400px] border border-border rounded-lg overflow-hidden">
                <MDXEditor className="mdx-editor"
                  markdown={formData.isi}
                  onChange={(value) => setFormData({ ...formData, isi: value })}
                  plugins={[
                    toolbarPlugin({
                      toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <CodeToggle />
                          <Separator />
                          <CreateLink />
                          <InsertImage />
                          <Separator />
                          <InsertTable />
                          <InsertThematicBreak />
                          <InsertCodeBlock />
                          <Separator />
                          <BlockTypeSelect />
                          <ListsToggle />
                          <Separator />
                        </DiffSourceToggleWrapper>
                      )
                    }),
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    codeBlockPlugin(),
                    codeMirrorPlugin(),
                    tablePlugin(),
                    imagePlugin(),
                    linkDialogPlugin(),
                    diffSourcePlugin()
                  ]}
                  contentEditableClassName="prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4"
                />
              </div>
            ) : (
              <div className="min-h-[400px] border border-border rounded-lg p-4 bg-muted/50">
                <div className="prose prose-sm max-w-none">
                  {formData.isi ? (
                    <div dangerouslySetInnerHTML={{ __html: marked(formData.isi) }} />
                  ) : (
                    <p className="text-muted-foreground">Konten akan muncul di sini...</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Opsi Publikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="published" className="text-sm font-medium">
                Publikasikan sekarang
              </Label>
            </div>
            {formData.published && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Perhatian:</strong> Berita akan langsung dipublikasikan dan dapat dilihat oleh pengguna.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Kembali
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Menyimpan...' : formData.published ? 'Publikasikan' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [berita, setBerita] = useState<Berita[]>([])
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([])
  const [layanan, setLayanan] = useState<Layanan[]>([])
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([])
  
  // e-Pasar state
  const [products, setProducts] = useState<Produk[]>([])
  const [categories, setCategories] = useState<KategoriProduk[]>([])
  const [epasarLoading, setEpasarLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null)
  const [epasarStats, setEpasarStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    lowStock: 0
  })
  const [epasarFormData, setEpasarFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
    kategoriId: '',
    gambar: '',
    status: 'ACTIVE'
  })

  // Kategori Form State
  const [kategoriFormData, setKategoriFormData] = useState({
    nama: '',
    deskripsi: '',
    icon: ''
  })
  const [isKategoriDialogOpen, setIsKategoriDialogOpen] = useState(false)
  const [editingKategori, setEditingKategori] = useState<KategoriProduk | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [chartPeriod, setChartPeriod] = useState('3months')
  const [searchQuery, setSearchQuery] = useState('')
  const [aktivitasData, setAktivitasData] = useState<Aktivitas[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [selectedLayananDetail, setSelectedLayananDetail] = useState<string | null>(null)
  const [editingBeritaId, setEditingBeritaId] = useState<string | null>(null)
  const [showAddBeritaForm, setShowAddBeritaForm] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // Socket integration (admin)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const realtimeNotif: Array<{ judul?: string; title?: string; pesan?: string; message?: string }> = []
  const clearNotifications = () => {}

  // Init Socket.IO and listen for notifications
  useEffect(() => {
    const s = connectSocket('admin')

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)
    const handleError = (err: any) => setConnectionError(err?.message || 'Connection error')
    const handleNotification = (data: any) => {
      appToast({
        title: data?.judul || data?.title || 'Notifikasi',
        description: data?.pesan || data?.message || 'Pesan masuk',
      })
      void playNotifSound()
    }

    const handleChatReply = (data: any) => {
      appToast({
        title: 'Balasan Pesan (User)',
        description: data?.pesan || data?.message || 'Balasan baru dari pengguna',
      })
      void playNotifSound()
    }

    const handlePengaduanStatus = (data: any) => {
      const status = data?.status || data?.newStatus || 'DIPERBARUI'
      appToast({
        title: 'Status Pengaduan Diubah',
        description: `${data?.judul || data?.pengaduan || 'Pengaduan'} kini ${status}`,
      })
      void playNotifSound()
    }

    const handleLayananStatus = (data: any) => {
      const status = data?.status || data?.newStatus || 'DIPERBARUI'
      appToast({
        title: 'Status Layanan Diubah',
        description: `${data?.judul || data?.layanan || 'Layanan'} kini ${status}`,
      })
      void playNotifSound()
    }

    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('connect_error', handleError)
    s.on('notification', handleNotification)
    s.on('chat-reply', handleChatReply)
    s.on('pengaduan-status-changed', handlePengaduanStatus)
    s.on('layanan-status-changed', handleLayananStatus)

    return () => {
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('connect_error', handleError)
      s.off('notification', handleNotification)
      s.off('chat-reply', handleChatReply)
      s.off('pengaduan-status-changed', handlePengaduanStatus)
      s.off('layanan-status-changed', handleLayananStatus)
    }
  }, [])

  // Toast for new realtime notifications (admin)
  // Shows only when new arrives; UI list remains on the Notifikasi tab
  const prevRealtimeCountRef = useRef(0)
  useEffect(() => {
    if (realtimeNotif && realtimeNotif.length > prevRealtimeCountRef.current) {
      const latest: any = realtimeNotif[0]
      if (latest) {
        // Use app toast position (top center already configured globally)
         
        appToast({ title: latest.judul || 'Notifikasi baru', description: latest.pesan })
      }
      prevRealtimeCountRef.current = realtimeNotif.length
    }
  }, [realtimeNotif])

  // Form states
  const [kategoriBeritaForm, setKategoriBeritaForm] = useState({
    nama: '',
    deskripsi: ''
  })
  const [editKategoriBeritaForm, setEditKategoriBeritaForm] = useState({
    id: '',
    nama: '',
    deskripsi: ''
  })
  const [isEditKategoriBeritaOpen, setIsEditKategoriBeritaOpen] = useState(false)
  const [balasanForm, setBalasanForm] = useState('')
  const [selectedPengaduan, setSelectedPengaduan] = useState<string | null>(null)
  const [selectedLayanan, setSelectedLayanan] = useState<string | null>(null)
  const [layananBalasanForm, setLayananBalasanForm] = useState('')
  const [layananStatusForm, setLayananStatusForm] = useState({
    status: '',
    catatan: '',
    alasanPenolakan: '',
    estimasiSelesai: ''
  })
  const [notifFilter, setNotifFilter] = useState('semua')
  const [isCreateNotifOpen, setIsCreateNotifOpen] = useState(false)
  const [createNotifForm, setCreateNotifForm] = useState({
    judul: '',
    pesan: '',
    tipe: 'INFO',
    untukAdmin: true
  })

  // Memoized data for charts
  const pengaduanStatusData = useMemo(() => {
    const data = [
      { name: 'Baru', value: pengaduan.filter(p => p.status === 'BARU').length || 5, fill: 'var(--chart-2)' },
      { name: 'Ditampung', value: pengaduan.filter(p => p.status === 'DITAMPUNG').length || 3, fill: 'var(--chart-3)' },
      { name: 'Diteruskan', value: pengaduan.filter(p => p.status === 'DITERUSKAN').length || 2, fill: 'var(--chart-4)' },
      { name: 'Dikerjakan', value: pengaduan.filter(p => p.status === 'DIKERJAKAN').length || 3, fill: 'var(--chart-1)' },
      { name: 'Selesai', value: pengaduan.filter(p => p.status === 'SELESAI').length || 8, fill: 'var(--chart-5)' }
    ]
    return data
  }, [pengaduan])

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

  /**
   * Mengambil data dari API untuk berita, kategori, pengaduan, layanan, dan notifikasi
   * @returns Promise<void>
   */
  const fetchData = async () => {
    // Skip data fetching during build time
    if (typeof window === 'undefined') {
      return
    }

    try {
      const [beritaRes, kategoriRes, pengaduanRes, layananRes, notifRes] = await Promise.all([
        fetch('/api/berita'),
        fetch('/api/kategori'),
        fetch('/api/pengaduan'),
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

      if (pengaduanRes.ok) {
        const pengaduanData = await pengaduanRes.json()
        setPengaduan(pengaduanData)
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

  // e-Pasar functions
  const fetchEpasarData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/epasar/produk'),
        fetch('/api/epasar/kategori')
      ]);

      const productsResponse = await productsRes.json();
      const categoriesResponse = await categoriesRes.json();

      // Handle different response structures
      const productsData = productsResponse.data || productsResponse;
      const categoriesData = categoriesResponse.data || categoriesResponse;

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // Calculate stats
      setEpasarStats({
        totalProducts: Array.isArray(productsData) ? productsData.length : 0,
        totalRevenue: 0,
        lowStock: Array.isArray(productsData) ? productsData.filter((p: Produk) => p.stok < 10).length : 0
      });

    } catch (error) {
      console.error('Error fetching e-Pasar data:', error);
      toast.error('Gagal memuat data e-Pasar');
    } finally {
      setEpasarLoading(false);
    }
  };

  const handleEpasarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct 
        ? `/api/epasar/produk/${editingProduct.id}`
        : '/api/epasar/produk';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: epasarFormData.nama,
          deskripsi: epasarFormData.deskripsi,
          harga: parseInt(epasarFormData.harga),
          stok: parseInt(epasarFormData.stok),
          kategoriId: epasarFormData.kategoriId,
          gambar: epasarFormData.gambar.split(',').map(g => g.trim()).filter(Boolean),
          status: epasarFormData.status
        })
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
        setIsEditDialogOpen(false);
        resetEpasarForm();
        fetchEpasarData();
      } else {
        toast.error('Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      const response = await fetch(`/api/epasar/produk/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Produk berhasil dihapus');
        fetchEpasarData();
      } else {
        toast.error('Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleEditProduct = (product: Produk) => {
    setEditingProduct(product);
    setEpasarFormData({
      nama: product.judul,
      deskripsi: product.deskripsi,
      harga: product.harga.toString(),
      stok: product.stok.toString(),
      kategoriId: product.kategoriId,
      gambar: product.gambar.join(', '),
      status: product.status
    });
    setIsEditDialogOpen(true);
  };

  const resetEpasarForm = () => {
    setEpasarFormData({
      nama: '',
      deskripsi: '',
      harga: '',
      stok: '',
      kategoriId: '',
      gambar: '',
      status: 'ACTIVE'
    });
    setEditingProduct(null);
  };

  // Kategori functions
  const handleKategoriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingKategori 
        ? `/api/epasar/kategori/${editingKategori.id}`
        : '/api/epasar/kategori';
      
      const method = editingKategori ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: kategoriFormData.nama,
          deskripsi: kategoriFormData.deskripsi,
          icon: kategoriFormData.icon || null
        })
      });

      if (response.ok) {
        toast.success(editingKategori ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
        setIsKategoriDialogOpen(false);
        resetKategoriForm();
        fetchEpasarData();
      } else {
        toast.error('Gagal menyimpan kategori');
      }
    } catch (error) {
      console.error('Error saving kategori:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDeleteKategoriProduk = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

    try {
      const response = await fetch(`/api/epasar/kategori/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Kategori berhasil dihapus');
        fetchEpasarData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting kategori:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleEditKategoriProduk = (kategori: KategoriProduk) => {
    setEditingKategori(kategori);
    setKategoriFormData({
      nama: kategori.nama,
      deskripsi: kategori.deskripsi,
      icon: kategori.icon || ''
    });
    setIsKategoriDialogOpen(true);
  };

  const resetKategoriForm = () => {
    setKategoriFormData({
      nama: '',
      deskripsi: '',
      icon: ''
    });
    setEditingKategori(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.kategoriId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => fetchData(), 0)
  }, [])

  useEffect(() => {
    // Fetch e-Pasar data when e-Pasar tabs become active
    if (activeTab === 'epasar-produk' || activeTab === 'epasar-kategori') {
      fetchEpasarData()
    }
  }, [activeTab])

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

  const handleCreateKategoriBerita = async () => {
    try {
      const response = await fetch('/api/kategori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kategoriBeritaForm)
      })

      if (response.ok) {
        toast.success('Kategori berita berhasil dibuat!')
        setKategoriBeritaForm({ nama: '', deskripsi: '' })
        fetchData()
      } else {
        toast.error('Gagal membuat kategori berita')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleEditKategoriBerita = (kategori: Kategori) => {
    setEditKategoriBeritaForm({
      id: kategori.id,
      nama: kategori.nama,
      deskripsi: kategori.deskripsi || ''
    })
    setIsEditKategoriBeritaOpen(true)
  }

  const handleUpdateKategoriBerita = async () => {
    try {
      const response = await fetch(`/api/kategori/${editKategoriBeritaForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: editKategoriBeritaForm.nama,
          deskripsi: editKategoriBeritaForm.deskripsi
        })
      })

      if (response.ok) {
        toast.success('Kategori berita berhasil diperbarui!')
        setIsEditKategoriBeritaOpen(false)
        setEditKategoriBeritaForm({ id: '', nama: '', deskripsi: '' })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui kategori berita')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDeleteKategoriBerita = async (id: string, nama: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori berita "${nama}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/kategori/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kategori berita berhasil dihapus!')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kategori berita')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleCreateNotifikasi = async () => {
    if (!createNotifForm.judul.trim() || !createNotifForm.pesan.trim()) {
      toast.error('Mohon lengkapi judul dan pesan notifikasi')
      return
    }

    try {
      const response = await fetch('/api/notifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createNotifForm)
      })

      if (response.ok) {
        toast.success('Notifikasi berhasil dibuat!')
        setIsCreateNotifOpen(false)
        setCreateNotifForm({
          judul: '',
          pesan: '',
          tipe: 'INFO',
          untukAdmin: true
        })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat notifikasi')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDeleteNotifikasi = async (id: string, judul: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus notifikasi "${judul}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/notifikasi/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Notifikasi berhasil dihapus!')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus notifikasi')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleViewNotifikasi = async (notif: Notifikasi) => {
    // Tandai sebagai dibaca jika belum dibaca
    if (!notif.dibaca) {
      try {
        await fetch('/api/notifikasi', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [notif.id] })
        })
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }

    // Arahkan ke halaman yang relevan berdasarkan tipe notifikasi
    let targetUrl = '/'
    
    if (notif.tipe.includes('BERITA') || notif.tipe.includes('berita')) {
      targetUrl = '/admin?tab=berita'
    } else if (notif.tipe.includes('PENGADUAN') || notif.tipe.includes('pengaduan')) {
      targetUrl = '/admin?tab=pengaduan'
    } else if (notif.tipe.includes('LAYANAN') || notif.tipe.includes('layanan')) {
      targetUrl = '/admin?tab=layanan'
    } else if (notif.tipe.includes('KATEGORI') || notif.tipe.includes('kategori')) {
      targetUrl = '/admin?tab=kategori'
    }

    // Buka di tab baru
    window.open(targetUrl, '_blank')
  }

  const handleUpdateStatusPengaduan = async (pengaduanId: string, status: string) => {
    try {
      const response = await fetch(`/api/pengaduan/${pengaduanId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Status pengaduan berhasil diperbarui!')
        fetchData()
      } else {
        toast.error('Gagal memperbarui status')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleBalasPengaduan = async (pengaduanId: string) => {
    if (!balasanForm.trim()) return

    try {
      const response = await fetch(`/api/pengaduan/${pengaduanId}/balasan`, {
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

  const handleDeleteBerita = async (beritaId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/berita/${beritaId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Berita berhasil dihapus!')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gagal menghapus berita')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus berita')
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

      // Sync to server
      await fetch('/api/notifikasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [notifId] })
      })

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
      } else if (notifFilter === 'pengaduan') {
        return notif.tipe.includes('PENGADUAN')
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
      pengaduan: number
    }> = []

    if (chartPeriod === '7days') {
      // Last 7 days - use deterministic data
      const visitorData = [350, 420, 380, 450, 500, 480, 520]
      const beritaData = [3, 5, 4, 6, 8, 7, 9]
      const pengaduanData = [2, 3, 4, 3, 5, 4, 6]

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
          pengunjung: visitorData[6 - i],
          berita: beritaData[6 - i],
          pengaduan: pengaduanData[6 - i]
        })
      }
    } else if (chartPeriod === '30days') {
      // Last 30 days (grouped by week) - use deterministic data
      const visitorData = [2000, 2500, 3000, 2800]
      const beritaData = [15, 25, 30, 28]
      const pengaduanData = [10, 15, 20, 18]

      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        data.push({
          date: `Minggu ${4 - i}`,
          pengunjung: visitorData[3 - i],
          berita: beritaData[3 - i],
          pengaduan: pengaduanData[3 - i]
        })
      }
    } else {
      // Last 3 months - use deterministic data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const visitorData = [8000, 10000, 12000]
      const beritaData = [50, 100, 150]
      const pengaduanData = [30, 60, 90]

      for (let i = 2; i >= 0; i--) {
        const month = new Date(now)
        month.setMonth(month.getMonth() - i)
        data.push({
          date: months[month.getMonth()],
          pengunjung: visitorData[2 - i],
          berita: beritaData[2 - i],
          pengaduan: pengaduanData[2 - i]
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
    const jenisAktivitas = ['berita', 'pengaduan', 'kategori', 'notifikasi', 'user']
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

    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => setAktivitasData(data), 0)
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    {
      id: 'berita',
      label: 'Berita',
      icon: FileText,
      children: [
        { id: 'list-berita', label: 'List Berita', parentId: 'berita' },
        { id: 'kategori', label: 'Kategori', parentId: 'berita' }
      ]
    },
    { id: 'pengaduan', label: 'Pengaduan', icon: MessageSquare },
    { id: 'layanan', label: 'Layanan', icon: FileText },
    {
      id: 'epasar',
      label: 'e-Pasar',
      icon: Store,
      children: [
        { id: 'epasar-produk', label: 'Produk', parentId: 'epasar' },
        { id: 'epasar-kategori', label: 'Kategori', parentId: 'epasar' }
      ]
    },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
    { id: 'cache', label: 'Cache', icon: Database },
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    
    // Jika tab yang dipilih adalah submenu, pastikan parent menu terbuka
    const parentMenuItem = menuItems.find(item =>
      item.children && item.children.some(child => child.id === tabId)
    )
    
    if (parentMenuItem) {
      setOpenMenus(prev => ({
        ...prev,
        [parentMenuItem.id]: true
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Top Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground">SmartGov</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Section */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              
              return (
                <div key={item.id} className="relative">
                  <Button
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="default"
                    className={`w-full justify-start h-10 ${!sidebarOpen && 'px-2'} active:shadow-none active:scale-[0.98] transition-all duration-200`}
                    onClick={() => {
                      if (hasChildren) {
                        // Toggle submenu
                        setOpenMenus(prev => ({
                          ...prev,
                          [item.id]: !prev[item.id]
                        }))
                      } else {
                        handleTabChange(item.id)
                      }
                    }}
                  >
                    <Icon
                      className={`text-sidebar-foreground pointer-events-none ${sidebarOpen ? 'mr-3' : ''}`}
                      width="28"
                      height="28"
                      strokeWidth="1.5"
                    />
                    {sidebarOpen && (
                      <>
                        <span className="text-sidebar-foreground flex-1 text-left">{item.label}</span>
                        {hasChildren && (
                          <ChevronRight
                            className={`transform transition-transform ${openMenus[item.id] ? 'rotate-90' : ''}`}
                            size={16}
                          />
                        )}
                      </>
                    )}
                  </Button>
                  
                  {/* Submenu */}
                  {hasChildren && openMenus[item.id] && sidebarOpen && (
                    <div className="ml-11 mt-1 space-y-1 relative">
                      {item.children.map((child) => (
                        <Button
                          key={child.id}
                          variant={activeTab === child.id ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start h-8 text-sm"
                          onClick={() => handleTabChange(child.id)}
                        >
                          <span className="text-sidebar-foreground">{child.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
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
                  <div className="text-sidebar-foreground mr-2">
                    <Image size={28} />
                  </div>
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
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </Button>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button variant="outline" size="sm" className="transition-all duration-200 active:shadow-none active:scale-[0.98]" onClick={() => setActiveTab('cache')}>
                    <Database className="text-foreground mr-2" size={18} />
                    <span className="text-foreground">Cache</span>
                  </Button>
                </div>
                <div className="relative">
                  <Button variant="outline" size="sm" className="transition-all duration-200 active:shadow-none active:scale-[0.98]" onClick={() => setActiveTab('notifikasi')}>
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
                    <Card 
                      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200 hover:bg-accent/50"
                      onClick={() => handleTabChange('list-berita')}
                    >
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

                    {/* Total Pengaduan Card */}
                    <Card 
                      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200 hover:bg-accent/50"
                      onClick={() => handleTabChange('pengaduan')}
                    >
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div className="text-muted-foreground text-sm">Pengaduan Masuk</div>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{pengaduan.length}</CardTitle>
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
                        <div className="text-muted-foreground">Pengaduan need attention</div>
                      </CardFooter>
                    </Card>

                    {/* Active Kategori Card */}
                    <Card 
                      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200 hover:bg-accent/50"
                      onClick={() => handleTabChange('kategori')}
                    >
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
                    <Card 
                      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200 hover:bg-accent/50"
                      onClick={() => handleTabChange('notifikasi')}
                    >
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

                  {/* Charts Section - Pengaduan dan Layanan */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 lg:px-6">
                    {/* Pengaduan Status Chart */}
                    <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm @container/card cursor-pointer active:shadow-none transition-all duration-200">
                      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                        <div>
                          <CardTitle className="leading-none font-semibold">Statistik Pengaduan</CardTitle>
                          <div className="text-muted-foreground text-sm">
                            <span className="hidden @[540px]/card:block">Distribusi status pengaduan masuk</span>
                            <span className="@[540px]/card:hidden">Status pengaduan</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        <ChartContainer
                          className="h-[260px] w-full"
                          config={{
                            jumlah: { label: 'Jumlah' },
                            baru: { label: 'Baru', color: 'var(--chart-2)' },
                            ditampung: { label: 'Ditampung', color: 'var(--chart-5)' },
                            diteruskan: { label: 'Diteruskan', color: 'var(--chart-4)' },
                            dikerjakan: { label: 'Dikerjakan', color: 'var(--chart-3)' },
                            selesai: { label: 'Selesai', color: 'var(--chart-1)' },
                          }}
                        >
                          <BarChart
                            accessibilityLayer
                            data={[
                              { status: 'baru', jumlah: 5, fill: 'var(--color-baru)' },
                              { status: 'ditampung', jumlah: 3, fill: 'var(--color-ditampung)' },
                              { status: 'diteruskan', jumlah: 5, fill: 'var(--color-diteruskan)' },
                              { status: 'dikerjakan', jumlah: 8, fill: 'var(--color-dikerjakan)' },
                              { status: 'selesai', jumlah: 11, fill: 'var(--color-selesai)' },
                            ]}
                            layout="vertical"
                            margin={{ left: 30 }}
                          >
                            <YAxis
                              dataKey="status"
                              type="category"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) =>
                                ({
                                  baru: 'Baru',
                                  ditampung: 'Ditampung',
                                  diteruskan: 'Diteruskan',
                                  dikerjakan: 'Dikerjakan',
                                  selesai: 'Selesai',
                                } as Record<string, string>)[value as string] || value
                              }
                            />
                            <XAxis dataKey="jumlah" type="number" hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="jumlah" layout="vertical" radius={5} />
                          </BarChart>
                        </ChartContainer>
                        <div className="flex justify-center mt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                            <span>Total: 32 pengaduan</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Layanan Status Chart - Pie Chart */}
                    <ChartPieLayanan />
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

            {/* Tab List Berita (submenu dari Berita) */}
            <TabsContent value="list-berita" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Berita</h2>
                <Button onClick={() => setShowAddBeritaForm(true)}>
                  <Plus className="mr-2" size={18} />
                  Tambah Berita
                </Button>
              </div>

              {showAddBeritaForm ? (
                <TambahBeritaForm
                  onClose={() => setShowAddBeritaForm(false)}
                  onSave={() => {
                    setShowAddBeritaForm(false)
                    fetchData()
                  }}
                />
              ) : editingBeritaId ? (
                <EditBeritaForm
                  beritaId={editingBeritaId}
                  onClose={() => setEditingBeritaId(null)}
                  onSave={() => {
                    setEditingBeritaId(null)
                    fetchData()
                  }}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {berita.length === 0 ? (
                    <Card className="md:col-span-2 lg:col-span-3">
                      <CardContent className="text-center py-12">
                        <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Belum ada berita</p>
                        <p className="text-sm text-muted-foreground">Belum ada berita yang dibuat</p>
                      </CardContent>
                    </Card>
                  ) : (
                    berita.map((item) => (
                      <Card key={item.id} className="cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-2">{item.judul}</CardTitle>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setEditingBeritaId(item.id)
                                }}
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleDeleteBerita(item.id)
                                }}
                                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{item.isi.substring(0, 150)}...</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.kategori?.nama || 'No Category'}</Badge>
                            <Badge variant={item.published ? "default" : "outline"}>
                              {item.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab Kategori (submenu dari Berita) */}
            <TabsContent value="kategori" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Kategori Berita</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2" size={18} />
                      Tambah Kategori Berita
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Kategori Berita Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nama">Nama Kategori</Label>
                        <Input
                          id="nama"
                          value={kategoriBeritaForm.nama}
                          onChange={(e) => setKategoriBeritaForm({ ...kategoriBeritaForm, nama: e.target.value })}
                          placeholder="Masukkan nama kategori"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Textarea
                          id="deskripsi"
                          value={kategoriBeritaForm.deskripsi}
                          onChange={(e) => setKategoriBeritaForm({ ...kategoriBeritaForm, deskripsi: e.target.value })}
                          placeholder="Masukkan deskripsi kategori"
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleCreateKategoriBerita} className="w-full">
                        Simpan Kategori Berita
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Edit Kategori Berita Dialog */}
              <Dialog open={isEditKategoriBeritaOpen} onOpenChange={setIsEditKategoriBeritaOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Kategori Berita</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-nama">Nama Kategori</Label>
                      <Input
                        id="edit-nama"
                        value={editKategoriBeritaForm.nama}
                        onChange={(e) => setEditKategoriBeritaForm({ ...editKategoriBeritaForm, nama: e.target.value })}
                        placeholder="Masukkan nama kategori"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                      <Textarea
                        id="edit-deskripsi"
                        value={editKategoriBeritaForm.deskripsi}
                        onChange={(e) => setEditKategoriBeritaForm({ ...editKategoriBeritaForm, deskripsi: e.target.value })}
                        placeholder="Masukkan deskripsi kategori"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditKategoriBeritaOpen(false)}
                        className="flex-1"
                      >
                        Batal
                      </Button>
                      <Button onClick={handleUpdateKategoriBerita} className="flex-1">
                        Perbarui Kategori Berita
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kategori.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditKategoriBerita(item)
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          title="Edit kategori berita"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteKategoriBerita(item.id, item.nama)
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          title="Hapus kategori berita"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <CardTitle className="text-lg pr-16">{item.nama}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-sm">{item.deskripsi || 'Tidak ada deskripsi'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab Pengaduan */}
            <TabsContent value="pengaduan" className="space-y-6 px-6 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Kelola Pengaduan</h2>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="mr-2" size={18} />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pengaduan.map((item) => (
                  <Card key={item.id} className="cursor-pointer">
                    <CardContent className="p-4">
                      {/* Foto Pengaduan */}
                      <div className="w-full h-48 bg-muted rounded-lg mb-4 overflow-hidden relative">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.judul || 'Gambar pengaduan'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="flex justify-center">
                                <Image size={48} className="mx-auto text-muted-foreground mb-2" />
                              </div>
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
                        <div className="flex gap-1 ml-2">
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
                        <Select onValueChange={(value) => handleUpdateStatusPengaduan(item.id, value)}>
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
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {item.balasan.slice(0, 5).map((balasan) => (
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
                            {item.balasan.length > 5 && (
                              <p className="text-xs text-muted-foreground italic">
                                +{item.balasan.length - 5} balasan lainnya
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Balas Form - Compact */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tulis balasan..."
                          value={selectedPengaduan === item.id ? balasanForm : ''}
                          onChange={(e) => {
                            setSelectedPengaduan(item.id)
                            setBalasanForm(e.target.value)
                          }}
                          className="text-sm"
                        />
                        <button
                          onClick={() => handleBalasPengaduan(item.id)}
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

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                          <div className="space-y-2 max-h-60 overflow-y-auto">
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
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLayanan(selectedLayanan === item.id ? null : item.id)
                            }}
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
                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="text-center py-12">
                      <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">Belum ada layanan</p>
                      <p className="text-sm text-muted-foreground">Belum ada pengajuan layanan dari pengguna</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab e-Pasar - Produk */}
            <TabsContent value="epasar-produk" className="space-y-6 px-6 mt-6">
              {epasarLoading ? (
                <div className="text-center py-8">Memuat data e-Pasar...</div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Kelola e-Pasar</h2>
                      <p className="text-muted-foreground">Kelola produk e-Pasar Pagesangan Timur</p>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Produk</p>
                            <p className="text-2xl font-bold">{epasarStats.totalProducts}</p>
                          </div>
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Stok Menipis</p>
                            <p className="text-2xl font-bold">{epasarStats.lowStock}</p>
                          </div>
                          <ShoppingCart className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                            <p className="text-2xl font-bold">Rp {epasarStats.totalRevenue.toLocaleString('id-ID')}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Stok Menipis</p>
                            <p className="text-2xl font-bold text-orange-600">{epasarStats.lowStock}</p>
                          </div>
                          <Users className="h-8 w-8 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content */}
                  <Tabs defaultValue="products" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="products">Produk</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="space-y-4">
                      {/* Search and Filter */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Cari produk..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                              <SelectTrigger className="w-full sm:w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    <div className="flex items-center gap-2">
                                      {category.icon && <LucideIcon name={category.icon} size={16} />}
                                      {category.nama}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button onClick={resetEpasarForm}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Tambah Produk
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {editingProduct ? 'Perbarui informasi produk' : 'Tambahkan produk baru ke katalog'}
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleEpasarSubmit} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="nama">Judul Produk</Label>
                                      <Input
                                        id="nama"
                                        value={epasarFormData.nama}
                                        onChange={(e) => setEpasarFormData(prev => ({ ...prev, nama: e.target.value }))}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="kategori">Kategori</Label>
                                      <Select value={epasarFormData.kategoriId} onValueChange={(value) => setEpasarFormData(prev => ({ ...prev, kategoriId: value }))}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                              <div className="flex items-center gap-2">
                                                {category.icon && <LucideIcon name={category.icon} size={16} />}
                                                {category.nama}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Textarea
                                      id="deskripsi"
                                      value={epasarFormData.deskripsi}
                                      onChange={(e) => setEpasarFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                                      rows={3}
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor="harga">Harga (Rp)</Label>
                                      <Input
                                        id="harga"
                                        type="number"
                                        value={epasarFormData.harga}
                                        onChange={(e) => setEpasarFormData(prev => ({ ...prev, harga: e.target.value }))}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="stok">Stok</Label>
                                      <Input
                                        id="stok"
                                        type="number"
                                        value={epasarFormData.stok}
                                        onChange={(e) => setEpasarFormData(prev => ({ ...prev, stok: e.target.value }))}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="status">Status</Label>
                                      <Select value={epasarFormData.status} onValueChange={(value) => setEpasarFormData(prev => ({ ...prev, status: value }))}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="ACTIVE">Aktif</SelectItem>
                                          <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="gambar">URL Gambar (pisahkan dengan koma)</Label>
                                    <Textarea
                                      id="gambar"
                                      value={epasarFormData.gambar}
                                      onChange={(e) => setEpasarFormData(prev => ({ ...prev, gambar: e.target.value }))}
                                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                      rows={2}
                                    />
                                  </div>

                                  <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                      Batal
                                    </Button>
                                    <Button type="submit">
                                      {editingProduct ? 'Perbarui' : 'Simpan'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Products Table */}
                      <Card>
                        <CardContent className="p-6">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produk</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredProducts.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-8">
                                    Tidak ada produk yang ditemukan
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredProducts.map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{product.judul}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                          {product.deskripsi}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{product.kategori?.nama || '-'}</TableCell>
                                    <TableCell>Rp {product.harga.toLocaleString('id-ID')}</TableCell>
                                    <TableCell>
                                      <span className={product.stok < 10 ? 'text-orange-600 font-medium' : ''}>
                                        {product.stok}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {product.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditProduct(product)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteProduct(product.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>

                  </Tabs>
                </>
              )}
            </TabsContent>

            {/* Tab e-Pasar - Kategori */}
            <TabsContent value="epasar-kategori" className="space-y-6 px-6 mt-6">
              {epasarLoading ? (
                <div className="text-center py-8">Memuat data kategori...</div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Kelola Kategori Produk</h2>
                      <p className="text-muted-foreground">Kelola kategori produk e-Pasar Pagesangan Timur</p>
                    </div>
                    <Dialog open={isKategoriDialogOpen} onOpenChange={setIsKategoriDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetKategoriForm}>
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Kategori
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                          </DialogTitle>
                          <DialogDescription>
                            {editingKategori ? 'Perbarui informasi kategori' : 'Tambahkan kategori produk baru'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleKategoriSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="kategori-nama">Nama Kategori</Label>
                            <Input
                              id="kategori-nama"
                              value={kategoriFormData.nama}
                              onChange={(e) => setKategoriFormData(prev => ({ ...prev, nama: e.target.value }))}
                              placeholder="Masukkan nama kategori"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="kategori-deskripsi">Deskripsi</Label>
                            <Textarea
                              id="kategori-deskripsi"
                              value={kategoriFormData.deskripsi}
                              onChange={(e) => setKategoriFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                              placeholder="Deskripsi kategori"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="kategori-icon">Icon (Opsional)</Label>
                            <Input
                              id="kategori-icon"
                              value={kategoriFormData.icon}
                              onChange={(e) => setKategoriFormData(prev => ({ ...prev, icon: e.target.value }))}
                              placeholder="Nama icon Lucide (contoh: ShoppingCart)"
                            />
                            {kategoriFormData.icon && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Preview:</span>
                                <LucideIcon name={kategoriFormData.icon} className="text-primary" />
                                <span className="text-sm text-muted-foreground">{kategoriFormData.icon}</span>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Icon yang tersedia:</p>
                              <div className="flex flex-wrap gap-2">
                                {['ShoppingCart', 'Home', 'Building', 'Cow', 'Wheat', 'Utensils', 'User', 'Car', 'Fish', 'Smartphone'].map(icon => (
                                  <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setKategoriFormData(prev => ({ ...prev, icon }))}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:bg-muted"
                                    title={icon}
                                  >
                                    <LucideIcon name={icon} size={14} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsKategoriDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button type="submit">
                              {editingKategori ? 'Perbarui' : 'Simpan'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Kategori Table */}
                  <Card>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Jumlah Produk</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                Belum ada kategori yang ditambahkan
                              </TableCell>
                            </TableRow>
                          ) : (
                            categories.map((kategori) => (
                              <TableRow key={kategori.id}>
                                <TableCell className="font-medium">{kategori.nama}</TableCell>
                                <TableCell>
                                  <div className="max-w-xs truncate">
                                    {kategori.deskripsi || '-'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {kategori.icon ? (
                                      <LucideIcon name={kategori.icon} className="text-primary" />
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {products.filter(p => p.kategoriId === kategori.id).length}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditKategoriProduk(kategori)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteKategoriProduk(kategori.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
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
                      <SelectItem value="pengaduan">Pengaduan</SelectItem>
                      <SelectItem value="layanan">Layanan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="mr-2" size={18} />
                    Refresh
                  </Button>
                  <Dialog open={isCreateNotifOpen} onOpenChange={setIsCreateNotifOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="mr-2" size={18} />
                        Buat Notifikasi
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Buat Notifikasi Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notif-judul">Judul Notifikasi</Label>
                          <Input
                            id="notif-judul"
                            value={createNotifForm.judul}
                            onChange={(e) => setCreateNotifForm({ ...createNotifForm, judul: e.target.value })}
                            placeholder="Masukkan judul notifikasi"
                          />
                        </div>
                        <div>
                          <Label htmlFor="notif-pesan">Pesan</Label>
                          <Textarea
                            id="notif-pesan"
                            value={createNotifForm.pesan}
                            onChange={(e) => setCreateNotifForm({ ...createNotifForm, pesan: e.target.value })}
                            placeholder="Masukkan pesan notifikasi"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notif-tipe">Tipe Notifikasi</Label>
                          <Select value={createNotifForm.tipe} onValueChange={(value) => setCreateNotifForm({ ...createNotifForm, tipe: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INFO">Info</SelectItem>
                              <SelectItem value="BERITA_BARU">Berita Baru</SelectItem>
                              <SelectItem value="BERITA_UPDATE">Berita Update</SelectItem>
                              <SelectItem value="PENGADUAN_BARU">Pengaduan Baru</SelectItem>
                              <SelectItem value="PENGADUAN_UPDATE">Pengaduan Update</SelectItem>
                              <SelectItem value="PENGADUAN_BALASAN">Balasan Pengaduan</SelectItem>
                              <SelectItem value="LAYANAN_BARU">Layanan Baru</SelectItem>
                              <SelectItem value="LAYANAN_UPDATE">Layanan Update</SelectItem>
                              <SelectItem value="LAYANAN_BALASAN">Balasan Layanan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="notif-untuk-admin"
                            checked={createNotifForm.untukAdmin}
                            onChange={(e) => setCreateNotifForm({ ...createNotifForm, untukAdmin: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="notif-untuk-admin" className="text-sm font-medium">
                            Tampilkan untuk admin
                          </Label>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsCreateNotifOpen(false)}
                            className="flex-1"
                          >
                            Batal
                          </Button>
                          <Button onClick={handleCreateNotifikasi} className="flex-1">
                            Buat Notifikasi
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotifikasi.map((item) => (
                  <Card key={item.id} className={`${item.dibaca ? "opacity-60" : ""} relative`}>
                    {!item.dibaca && (
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          className="h-3 w-3 rounded-full bg-green-500 block"
                          title="Belum dibaca"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold line-clamp-2 pr-2 flex-1">{item.judul}</h3>
                        <div className="flex items-start gap-1">
                          <button
                            onClick={() => handleViewNotifikasi(item)}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            title="Lihat detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteNotifikasi(item.id, item.judul)}
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

            <TabsContent value="cache" className="space-y-6 px-6 mt-6">
              <CacheManagement />
            </TabsContent>
          </Tabs>
          )}
        </main>
      </div>
    </div>
  )
}

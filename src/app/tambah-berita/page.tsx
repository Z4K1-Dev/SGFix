'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { ArrowLeft, Calendar, Eye, FileText, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { pageCache } from '@/lib/cache-manager'

interface Kategori {
  id: string
  nama: string
  deskripsi?: string
}

export default function TambahBeritaPage() {
  const router = useRouter()
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
      // Check cache first
      const cached = pageCache.get('/kategori') as Kategori[] | null
      if (cached) {
        setKategori(cached)
        return
      }
      
      const response = await fetch('/api/kategori')
      if (response.ok) {
        const data = await response.json()
        setKategori(data)
        // Cache with TTL 60 minutes for kategori
        pageCache.set('/kategori', data, 60 * 60 * 1000)
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
        setFormData({
          judul: '',
          isi: '',
          gambar: '',
          kategoriId: '',
          published: false
        })
        // Redirect to admin page after successful creation
        router.push('/admin')
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
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
                      <div dangerouslySetInnerHTML={{ __html: formData.isi.replace(/\n/g, '<br />') }} />
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
              onClick={() => router.push('/admin')}
            >
              Batal
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
      </main>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayananList, JenisLayananSelector, MultiStepForm, StatusTracker } from '@/components/layanan'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeft, History, FileText } from 'lucide-react'

interface LayananItem {
  id: string
  judul: string
  jenisLayanan: string
  status: 'BARU' | 'DITAMPUNG' | 'DIVERIFIKASI' | 'DISETUJUI' | 'SELESAI' | 'DITOLAK'
  createdAt: string
  updatedAt: string
  estimasiSelesai?: string
  hasUnreadReplies?: boolean
}

export default function LayananPage() {
  const [activeTab, setActiveTab] = useState('daftar')
  const [selectedJenisLayanan, setSelectedJenisLayanan] = useState<string | null>(null)
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [selectedLayanan, setSelectedLayanan] = useState<LayananItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchLayanan = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/layanan')
      if (!response.ok) throw new Error('Failed to fetch layanan')
      
      const data = await response.json()
      setLayananList(data.data || [])
    } catch (error) {
      console.error('Error fetching layanan:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data layanan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLayanan()
  }, [])

  const handleSelectJenisLayanan = (jenis: string) => {
    setSelectedJenisLayanan(jenis)
    setActiveTab('form')
  }

  const handleAjukanLayanan = async (formData: any) => {
    try {
      setIsLoading(true)
      
      // Prepare data for API
      const submitData = {
        judul: `Pengajuan ${getJenisLayananLabel(selectedJenisLayanan!)}`,
        jenisLayanan: selectedJenisLayanan,
        ...formData
      }

      const response = await fetch('/api/layanan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit layanan')
      }

      const result = await response.json()
      
      toast({
        title: 'Berhasil',
        description: result.message || 'Layanan berhasil diajukan'
      })

      // Reset and go back to list
      setSelectedJenisLayanan(null)
      setActiveTab('daftar')
      fetchLayanan()
    } catch (error: any) {
      console.error('Error submitting layanan:', error)
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengajukan layanan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatal = () => {
    setSelectedJenisLayanan(null)
    setActiveTab('daftar')
  }

  const handleSelectLayanan = (layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setActiveTab('detail')
  }

  const handleDetail = (layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setActiveTab('detail')
  }

  const handleBalas = (layanan: LayananItem) => {
    router.push(`/layanan/${layanan.id}/balasan`)
  }

  const getJenisLayananLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      'KTP_BARU': 'KTP Baru',
      'KTP_HILANG': 'KTP Hilang',
      'KTP_RUSAK': 'KTP Rusak',
      'AKTA_KELAHIRAN': 'Akta Kelahiran',
      'AKTA_KEMATIAN': 'Akta Kematian',
      'AKTA_PERKAWINAN': 'Akta Perkawinan',
      'AKTA_CERAI': 'Akta Perceraian',
      'SURAT_PINDAH': 'Surat Pindah',
      'SURAT_KEHILANGAN': 'Surat Kehilangan',
      'SURAT_KETERANGAN': 'Surat Keterangan',
      'KK_BARU': 'KK Baru',
      'KK_PERUBAHAN': 'Perubahan KK',
      'KK_HILANG': 'KK Hilang'
    }
    return labels[jenis] || jenis
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container */}
      <div className="max-w-[412px] mx-auto bg-background min-h-screen">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-md hover:bg-primary-foreground/20 h-8 w-8 p-0 text-primary-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Layanan Online</h1>
              <p className="text-sm opacity-90">Ajukan layanan kependudukan</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                <TabsTrigger value="daftar" className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
                  <History className="h-4 w-4" />
                  <span>Daftar</span>
                </TabsTrigger>
                <TabsTrigger value="pilih" className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
                  <Plus className="h-4 w-4" />
                  <span>Baru</span>
                </TabsTrigger>
                <TabsTrigger value="form" disabled={!selectedJenisLayanan} className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
                  <FileText className="h-4 w-4" />
                  <span>Form</span>
                </TabsTrigger>
                <TabsTrigger value="detail" disabled={!selectedLayanan} className="flex flex-col items-center space-y-1 py-2 px-1 text-xs">
                  <FileText className="h-4 w-4" />
                  <span>Detail</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daftar" className="mt-4">
                <LayananList
                  layananList={layananList}
                  onSelect={handleSelectLayanan}
                  onDetail={handleDetail}
                  onBalas={handleBalas}
                  onAjukanBaru={() => setActiveTab('pilih')}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="pilih" className="mt-4">
                <JenisLayananSelector onSelect={handleSelectJenisLayanan} />
              </TabsContent>

              <TabsContent value="form" className="mt-4">
                {selectedJenisLayanan && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('pilih')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        {getJenisLayananLabel(selectedJenisLayanan)}
                      </Badge>
                    </div>
                    
                    <MultiStepForm
                      jenisLayanan={getJenisLayananLabel(selectedJenisLayanan)}
                      onSubmit={handleAjukanLayanan}
                      onCancel={handleBatal}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="detail" className="mt-4">
                {selectedLayanan && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('daftar')}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                      </Button>
                    </div>
                    
                    <StatusTracker
                      layanan={selectedLayanan}
                      onDetail={() => router.push(`/layanan/${selectedLayanan.id}`)}
                      onBalas={() => router.push(`/layanan/${selectedLayanan.id}/balasan`)}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
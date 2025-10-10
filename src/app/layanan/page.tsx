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
  status: 'BARU' | 'DIPROSES' | 'DIVERIFIKASI' | 'DISETUJUI' | 'SELESAI' | 'DITOLAK'
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Layanan Online</h1>
        <p className="text-muted-foreground">
          Ajukan berbagai layanan kependudukan secara online
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daftar" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Daftar Layanan</span>
          </TabsTrigger>
          <TabsTrigger value="pilih" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Ajukan Baru</span>
          </TabsTrigger>
          <TabsTrigger value="form" disabled={!selectedJenisLayanan} className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Form Pengajuan</span>
          </TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedLayanan} className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Detail</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daftar" className="mt-6">
          <LayananList
            layananList={layananList}
            onSelect={handleSelectLayanan}
            onDetail={handleDetail}
            onBalas={handleBalas}
            onAjukanBaru={() => setActiveTab('pilih')}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pilih" className="mt-6">
          <JenisLayananSelector onSelect={handleSelectJenisLayanan} />
        </TabsContent>

        <TabsContent value="form" className="mt-6">
          {selectedJenisLayanan && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('pilih')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
                <Badge variant="outline">
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

        <TabsContent value="detail" className="mt-6">
          {selectedLayanan && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('daftar')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Daftar
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
  )
}
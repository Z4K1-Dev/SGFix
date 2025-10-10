'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Send, User, Shield, Calendar, MessageCircle } from 'lucide-react'

interface Balasan {
  id: string
  isi: string
  dariAdmin: boolean
  isRead: boolean
  createdAt: string
  user?: {
    nama: string
  }
}

interface LayananInfo {
  id: string
  judul: string
  jenisLayanan: string
  status: string
}

export default function LayananBalasanPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [layanan, setLayanan] = useState<LayananInfo | null>(null)
  const [balasanList, setBalasanList] = useState<Balasan[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchBalasan = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/layanan/${params.id}/balasan`)
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Error',
            description: 'Layanan tidak ditemukan',
            variant: 'destructive'
          })
          router.push('/layanan')
          return
        }
        throw new Error('Failed to fetch balasan')
      }
      
      const data = await response.json()
      setBalasanList(data.data || [])
      
      // Also fetch layanan info
      const layananResponse = await fetch(`/api/layanan/${params.id}`)
      if (layananResponse.ok) {
        const layananData = await layananResponse.json()
        setLayanan({
          id: layananData.data.id,
          judul: layananData.data.judul,
          jenisLayanan: layananData.data.jenisLayanan,
          status: layananData.data.status
        })
      }
    } catch (error) {
      console.error('Error fetching balasan:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data balasan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchBalasan()
    }
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [balasanList])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Pesan tidak boleh kosong',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsSending(true)
      
      const response = await fetch(`/api/layanan/${params.id}/balasan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pesan: newMessage.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      const result = await response.json()
      
      // Add the new message to the list
      const newBalasan: Balasan = {
        id: result.data.id,
        isi: result.data.isi,
        dariAdmin: false,
        isRead: true,
        createdAt: result.data.createdAt
      }
      
      setBalasanList(prev => [...prev, newBalasan])
      setNewMessage('')
      
      toast({
        title: 'Berhasil',
        description: 'Balasan terkirim'
      })
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengirim balasan',
        variant: 'destructive'
      })
    } finally {
      setIsSending(false)
    }
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'BARU': 'bg-gray-100 text-gray-800 border-gray-200',
      'DITAMPUNG': 'bg-blue-100 text-blue-800 border-blue-200',
      'DIVERIFIKASI': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'DISETUJUI': 'bg-green-100 text-green-800 border-green-200',
      'SELESAI': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'DITOLAK': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!layanan) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Layanan tidak ditemukan</h1>
          <Button onClick={() => router.push('/layanan')}>
            Kembali ke Daftar Layanan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/layanan/${params.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Detail
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{layanan.judul}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">
                {getJenisLayananLabel(layanan.jenisLayanan)}
              </Badge>
              <Badge className={getStatusColor(layanan.status)}>
                {layanan.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{balasanList.length} balasan</span>
          </div>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Diskusi Layanan</CardTitle>
          <CardDescription>
            Kirim pertanyaan atau informasi terkait pengajuan layanan Anda
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {balasanList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada balasan</p>
                <p className="text-sm">Kirim pesan untuk memulai diskusi</p>
              </div>
            ) : (
              balasanList.map((balasan) => (
                <div key={balasan.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    balasan.dariAdmin 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {balasan.dariAdmin ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {balasan.dariAdmin ? 'Admin' : 'Anda'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(balasan.createdAt)}
                      </span>
                      {balasan.dariAdmin && !balasan.isRead && (
                        <Badge variant="secondary" className="text-xs">
                          Baru
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-3 text-sm ${
                      balasan.dariAdmin 
                        ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{balasan.isi}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Message Input */}
          <div className="pt-4 space-y-3">
            <div className="flex space-x-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan Anda..."
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setNewMessage('')}
                disabled={!newMessage.trim() || isSending}
              >
                Batal
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <>Mengirim...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Catatan Penting</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Admin akan membalas pesan Anda dalam waktu 1x24 jam</li>
              <li>Gunakan bahasa yang sopan dan jelas</li>
              <li>Sertakan informasi yang relevan dengan pengajuan Anda</li>
              <li>Jangan share informasi pribadi yang sensitif</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
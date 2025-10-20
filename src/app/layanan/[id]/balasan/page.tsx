'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { MessageCircle, Send, Shield, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
  const [isSending, setIsSending] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchBalasan = async () => {
    try {
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
      'BARU': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800',
      'DITAMPUNG': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      'DIVERIFIKASI': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      'DISETUJUI': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      'SELESAI': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      'DITOLAK': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    
    // Check if the date is today
    const isToday = date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear()
    
    // Format date: DD/MM/YYYY (only if not today)
    let datePart = ''
    if (!isToday) {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      datePart = `${day}/${month}/${year} `
    }
    
    // Format time: HH:MM AM/PM
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    
    return `${datePart}${hours}:${minutes} ${ampm}`
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
    <MobileLayout
      title="Balasan Layanan"
      showBackButton
      backRoute={`/layanan/${params.id}`}
    >
      <div className="container mx-auto py-8 px-4 max-w-[412px]">
        <div className="mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{layanan.judul}</h1>
              <Badge className={getStatusColor(layanan.status)}>
                {layanan.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {getJenisLayananLabel(layanan.jenisLayanan)}
              </Badge>
              
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{balasanList.length} balasan</span>
              </div>
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
                      </div>
                      
                      <div className={`rounded-lg p-3 text-sm ${
                        balasan.dariAdmin
                          ? 'bg-popover text-popover-foreground'
                          : 'bg-input text-card-foreground'
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
    </MobileLayout>
  )
}
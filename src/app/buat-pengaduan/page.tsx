'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Map } from '@/components/ui/map'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Camera,
    CheckCircle,
    FileText,
    MapPin,
    Upload
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

interface PengaduanData {
  judul: string
  keterangan: string
  foto: string | null
  latitude: number | null
  longitude: number | null
}

const steps = [
  { id: 1, title: 'Judul & Keterangan', icon: FileText },
  { id: 2, title: 'Upload Foto', icon: Camera },
  { id: 3, title: 'Lokasi', icon: MapPin },
  { id: 4, title: 'Preview', icon: CheckCircle },
  { id: 5, title: 'Kirim', icon: CheckCircle }
]

export default function BuatPengaduanPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PengaduanData>({
    judul: '',
    keterangan: '',
    foto: null,
    latitude: null,
    longitude: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  const updateFormData = (field: keyof PengaduanData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file tidak boleh lebih dari 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        updateFormData('foto', e.target?.result as string)
        toast.success('Foto berhasil diupload')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMapClick = (event: any) => {
    const { lng, lat } = event.lngLat
    updateFormData('latitude', lat)
    updateFormData('longitude', lng)
    toast.success('Lokasi berhasil dipilih!')
  }

  const getCurrentLocation = useCallback(() => {
    setLocationLoading(true)
    
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak didukung browser ini')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData('latitude', position.coords.latitude)
        updateFormData('longitude', position.coords.longitude)
        setLocationLoading(false)
        toast.success('Lokasi berhasil didapatkan')
      },
      (error) => {
        setLocationLoading(false)
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Izin lokasi ditolak. Silakan aktifkan lokasi di browser.')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Informasi lokasi tidak tersedia.')
            break
          case error.TIMEOUT:
            toast.error('Waktu habis untuk mendapatkan lokasi.')
            break
          default:
            toast.error('Terjadi kesalahan saat mendapatkan lokasi.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [])

  const handleSubmit = async () => {
    if (!formData.judul || !formData.keterangan) {
      toast.error('Judul dan keterangan wajib diisi')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        foto: formData.foto || null // Ensure null instead of empty string
      }
      
      const response = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        toast.success('Pengaduan berhasil dikirim!')
        // Reset form
        setFormData({
          judul: '',
          keterangan: '',
          foto: null,
          latitude: null,
          longitude: null
        })
        setCurrentStep(1)
        
        // Redirect ke halaman pengaduan
        setTimeout(() => {
          router.push('/pengaduan')
        }, 2000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengirim pengaduan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengirim pengaduan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.judul.trim() !== '' && formData.keterangan.trim() !== ''
      case 2:
        return true // Foto opsional
      case 3:
        return true // Lokasi opsional
      case 4:
        return formData.judul.trim() !== '' && formData.keterangan.trim() !== ''
      default:
        return true
    }
  }

  const canProceed = validateStep()

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Judul Pengaduan *
              </label>
              <Input
                value={formData.judul}
                onChange={(e) => updateFormData('judul', e.target.value)}
                placeholder="Masukkan judul pengaduan"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Keterangan *
              </label>
              <Textarea
                value={formData.keterangan}
                onChange={(e) => updateFormData('keterangan', e.target.value)}
                placeholder="Jelaskan detail pengaduan Anda"
                className="w-full min-h-[120px]"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Foto (Opsional)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <div className="space-y-4">
                  <img
                    src={formData.foto || '/placeholder-image.png'}
                    alt="Preview"
                    className="max-w-full h-48 mx-auto object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                  <div>
                    <p className="text-muted-foreground">
                      {formData.foto ? 'Klik untuk ganti foto' : 'Klik untuk upload foto'}
                    </p>
                    <p className="text-sm text-muted-foreground/70">Maksimal 5MB</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.foto ? 'Ganti Foto' : 'Pilih Foto'}
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                Lokasi Pengaduan (Opsional)
              </label>
              
              {/* Map Container */}
              <div className="space-y-4">
                <div className="h-64 rounded-lg overflow-hidden border">
                  <Map
                    initialCoordinates={formData.latitude && formData.longitude ? [formData.longitude, formData.latitude] : [116.1186, -8.5656]}
                    initialZoom={formData.latitude && formData.longitude ? 15 : 12}
                    onMapClick={handleMapClick}
                    markers={formData.latitude && formData.longitude ? [{
                      coordinates: [formData.longitude, formData.latitude],
                      popup: `<div class="p-2"><h3 class="font-semibold">Lokasi Pengaduan</h3><p class="text-sm">Klik untuk ubah lokasi</p></div>`,
                      color: "#ef4444"
                    }] : []}
                    className="w-full h-full"
                    onMapLoad={(map) => {
                      // Get user location on map load if no location set
                      if (!formData.latitude || !formData.longitude) {
                        getCurrentLocation()
                      }
                    }}
                  />
                </div>
                
                {/* Current Location Button */}
                <Button
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {locationLoading ? 'Mendapatkan Lokasi...' : 'Gunakan Lokasi Saat Ini'}
                </Button>
                
                {/* Location Status */}
                {formData.latitude && formData.longitude && (
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Lokasi tersimpan: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
                
                {/* Manual Input Option */}
                <details className="mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Input manual koordinat
                  </summary>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Latitude</label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.latitude || ''}
                        onChange={(e) => updateFormData('latitude', parseFloat(e.target.value) || null)}
                        placeholder="Contoh: -6.200000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Longitude</label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.longitude || ''}
                        onChange={(e) => updateFormData('longitude', parseFloat(e.target.value) || null)}
                        placeholder="Contoh: 106.816666"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Preview Pengaduan</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{formData.judul || 'Tanpa Judul'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Keterangan:</h4>
                  <p className="text-foreground">{formData.keterangan || 'Tidak ada keterangan'}</p>
                </div>
               
                <div>
                  <h4 className="font-medium mb-2">Foto:</h4>
                  <img
                    src={formData.foto || '/placeholder-image.png'}
                    alt="Foto pengaduan"
                    className="max-w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
               
                {formData.latitude && formData.longitude && (
                  <div>
                    <h4 className="font-medium mb-2">Lokasi:</h4>
                    <div className="h-48 rounded-lg overflow-hidden border">
                      <Map
                        initialCoordinates={[formData.longitude, formData.latitude]}
                        initialZoom={15}
                        markers={[{
                          coordinates: [formData.longitude, formData.latitude],
                          popup: `<div class="p-2"><h3 class="font-semibold">Lokasi Pengaduan</h3></div>`,
                          color: "#ef4444"
                        }]}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-xl font-semibold">Siap Dikirim!</h3>
            <p className="text-muted-foreground">
              Pengaduan Anda sudah siap untuk dikirim. Pastikan semua data sudah benar.
            </p>
            <div className="space-y-2">
              <Badge variant="secondary" className="mr-2">
                {formData.judul ? '✓ Judul' : '✗ Judul'}
              </Badge>
              <Badge variant="secondary" className="mr-2">
                {formData.keterangan ? '✓ Keterangan' : '✗ Keterangan'}
              </Badge>
              <Badge variant="secondary" className="mr-2">
                {formData.foto ? '✓ Foto' : '○ Foto'}
              </Badge>
              <Badge variant="secondary">
                {formData.latitude && formData.longitude ? '✓ Lokasi' : '○ Lokasi'}
              </Badge>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <MobileLayout
      title="Buat Pengaduan"
      showBackButton={true}
      backRoute="/"
      activeTab="pengaduan"
      onTabChange={(index) => {
        if (index === null) return
        const routes = ["/", "/berita", "/pengaduan", "/layanan", null, "/profile"]
        const target = routes[index]
        if (!target || target === "/pengaduan") return
        router.push(target)
      }}
    >
      <div className="px-4 py-4">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-primary text-primary-foreground' : 
                        isCompleted ? 'bg-green-600 text-primary-foreground' : 
                        'bg-muted text-muted-foreground'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1 text-center hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-full h-1 mx-2
                      ${isCompleted ? 'bg-green-600' : 'bg-muted'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = steps[currentStep - 1].icon
                return <Icon className="w-5 h-5" />
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengaduan'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Judul dan keterangan wajib diisi</li>
                <li>Foto dan lokasi opsional tapi sangat membantu</li>
                <li> pastikan foto jelas dan relevan dengan pengaduan</li>
                <li>Aktifkan lokasi untuk akurasi yang lebih baik</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
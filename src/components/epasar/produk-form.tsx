'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast as appToast } from '@/hooks/use-toast'

import { Upload, Package, DollarSign, FileText, CheckCircle2, ChevronLeft, ChevronRight, Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface ProdukFormData {
  // Informasi Dasar
  nama: string
  kategoriId: string
  deskripsi: string
  harga: string
  stok: string
  kondisi: 'BARU' | 'BEKAS'
  
  // Detail Produk
  berat: string
  dimensiPanjang: string
  dimensiLebar: string
  dimensiTinggi: string
  warna: string
  ukuran: string
  
  // Informasi Penjual
  namaPenjual: string
  noTelepon: string
  alamat: string
  kota: string
  provinsi: string
  
  // Gambar
  gambar: File[]
}

interface KategoriProduk {
  id: string
  nama: string
  deskripsi: string
  icon: string
}

interface StepConfig {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<{
    data: ProdukFormData
    updateData: (field: string, value: any) => void
    errors: Record<string, string>
    kategori: KategoriProduk[]
  }>
  validate: (data: ProdukFormData) => Record<string, string>
}

// Step Components
const StepInformasiDasar: React.FC<{ 
  data: ProdukFormData; 
  updateData: (field: string, value: any) => void; 
  errors: Record<string, string>;
  kategori: KategoriProduk[];
}> = ({ data, updateData, errors, kategori }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="nama">Nama Produk *</Label>
      <Input
        id="nama"
        value={data.nama}
        onChange={(e) => updateData('nama', e.target.value)}
        placeholder="Masukkan nama produk"
        className={cn(errors.nama && "border-red-500")}
      />
      {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="kategoriId">Kategori Produk *</Label>
      <Select value={data.kategoriId} onValueChange={(value) => updateData('kategoriId', value)}>
        <SelectTrigger className={cn(errors.kategoriId && "border-red-500")}>
          <SelectValue placeholder="Pilih kategori produk" />
        </SelectTrigger>
        <SelectContent>
          {kategori.map((kat) => (
            <SelectItem key={kat.id} value={kat.id}>
              {kat.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.kategoriId && <p className="text-sm text-red-500">{errors.kategoriId}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="deskripsi">Deskripsi Produk *</Label>
      <Textarea
        id="deskripsi"
        value={data.deskripsi}
        onChange={(e) => updateData('deskripsi', e.target.value)}
        placeholder="Jelaskan produk Anda secara detail..."
        rows={4}
        className={cn(errors.deskripsi && "border-red-500")}
      />
      {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi}</p>}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="harga">Harga (Rp) *</Label>
        <Input
          id="harga"
          type="number"
          value={data.harga}
          onChange={(e) => updateData('harga', e.target.value)}
          placeholder="0"
          className={cn(errors.harga && "border-red-500")}
        />
        {errors.harga && <p className="text-sm text-red-500">{errors.harga}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="stok">Stok *</Label>
        <Input
          id="stok"
          type="number"
          value={data.stok}
          onChange={(e) => updateData('stok', e.target.value)}
          placeholder="0"
          className={cn(errors.stok && "border-red-500")}
        />
        {errors.stok && <p className="text-sm text-red-500">{errors.stok}</p>}
      </div>
      
      <div className="space-y-2">
        <Label>Kondisi *</Label>
        <Select value={data.kondisi} onValueChange={(value) => updateData('kondisi', value)}>
          <SelectTrigger className={cn(errors.kondisi && "border-red-500")}>
            <SelectValue placeholder="Pilih kondisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BARU">Baru</SelectItem>
            <SelectItem value="BEKAS">Bekas</SelectItem>
          </SelectContent>
        </Select>
        {errors.kondisi && <p className="text-sm text-red-500">{errors.kondisi}</p>}
      </div>
    </div>
  </div>
)

const StepDetailProduk: React.FC<{ 
  data: ProdukFormData; 
  updateData: (field: string, value: any) => void; 
  errors: Record<string, string>;
  kategori: KategoriProduk[];
}> = ({ data, updateData, errors }) => (
  <div className="space-y-6">
    <div className="text-sm text-muted-foreground">
      Informasi detail produk akan membantu pembeli memahami spesifikasi produk Anda.
    </div>

    <div className="space-y-2">
      <Label htmlFor="berat">Berat (gram) *</Label>
      <Input
        id="berat"
        type="number"
        value={data.berat}
        onChange={(e) => updateData('berat', e.target.value)}
        placeholder="1000"
        className={cn(errors.berat && "border-red-500")}
      />
      {errors.berat && <p className="text-sm text-red-500">{errors.berat}</p>}
    </div>

    <div className="space-y-4">
      <Label>Dimensi (cm)</Label>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dimensiPanjang">Panjang</Label>
          <Input
            id="dimensiPanjang"
            type="number"
            value={data.dimensiPanjang}
            onChange={(e) => updateData('dimensiPanjang', e.target.value)}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dimensiLebar">Lebar</Label>
          <Input
            id="dimensiLebar"
            type="number"
            value={data.dimensiLebar}
            onChange={(e) => updateData('dimensiLebar', e.target.value)}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dimensiTinggi">Tinggi</Label>
          <Input
            id="dimensiTinggi"
            type="number"
            value={data.dimensiTinggi}
            onChange={(e) => updateData('dimensiTinggi', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="warna">Warna</Label>
        <Input
          id="warna"
          value={data.warna}
          onChange={(e) => updateData('warna', e.target.value)}
          placeholder="Merah, Biru, dll"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ukuran">Ukuran</Label>
        <Input
          id="ukuran"
          value={data.ukuran}
          onChange={(e) => updateData('ukuran', e.target.value)}
          placeholder="S, M, L, XL atau 40, 41, 42"
        />
      </div>
    </div>
  </div>
)

const StepInformasiPenjual: React.FC<{ 
  data: ProdukFormData; 
  updateData: (field: string, value: any) => void; 
  errors: Record<string, string>;
  kategori: KategoriProduk[];
}> = ({ data, updateData, errors }) => (
  <div className="space-y-6">
    <div className="text-sm text-muted-foreground">
      Informasi penjual akan ditampilkan kepada pembeli untuk menghubungi Anda.
    </div>

    <div className="space-y-2">
      <Label htmlFor="namaPenjual">Nama Penjual *</Label>
      <Input
        id="namaPenjual"
        value={data.namaPenjual}
        onChange={(e) => updateData('namaPenjual', e.target.value)}
        placeholder="Nama lengkap atau nama toko"
        className={cn(errors.namaPenjual && "border-red-500")}
      />
      {errors.namaPenjual && <p className="text-sm text-red-500">{errors.namaPenjual}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="noTelepon">Nomor Telepon *</Label>
      <Input
        id="noTelepon"
        value={data.noTelepon}
        onChange={(e) => updateData('noTelepon', e.target.value)}
        placeholder="08123456789"
        className={cn(errors.noTelepon && "border-red-500")}
      />
      {errors.noTelepon && <p className="text-sm text-red-500">{errors.noTelepon}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="alamat">Alamat Lengkap *</Label>
      <Textarea
        id="alamat"
        value={data.alamat}
        onChange={(e) => updateData('alamat', e.target.value)}
        placeholder="Jalan, nomor rumah, RT/RW"
        rows={3}
        className={cn(errors.alamat && "border-red-500")}
      />
      {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="kota">Kota *</Label>
        <Input
          id="kota"
          value={data.kota}
          onChange={(e) => updateData('kota', e.target.value)}
          placeholder="Nama kota"
          className={cn(errors.kota && "border-red-500")}
        />
        {errors.kota && <p className="text-sm text-red-500">{errors.kota}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="provinsi">Provinsi *</Label>
        <Input
          id="provinsi"
          value={data.provinsi}
          onChange={(e) => updateData('provinsi', e.target.value)}
          placeholder="Nama provinsi"
          className={cn(errors.provinsi && "border-red-500")}
        />
        {errors.provinsi && <p className="text-sm text-red-500">{errors.provinsi}</p>}
      </div>
    </div>
  </div>
)

const StepGambarProduk: React.FC<{ 
  data: ProdukFormData; 
  updateData: (field: string, value: any) => void; 
  errors: Record<string, string>;
  kategori: KategoriProduk[];
}> = ({ data, updateData, errors }) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    // Defer state update to avoid cascading renders
    const timer = setTimeout(() => {
      const urls = data.gambar.map(file => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }, 0)
    
    return () => {
      clearTimeout(timer)
      // Clean up object URLs
      data.gambar.forEach(file => {
        const url = URL.createObjectURL(file)
        URL.revokeObjectURL(url)
      })
    }
  }, [data.gambar])

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).slice(0, 5 - data.gambar.length)
    updateData('gambar', [...data.gambar, ...newFiles])
  }

  const removeImage = (index: number) => {
    const newImages = data.gambar.filter((_, i) => i !== index)
    updateData('gambar', newImages)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Upload gambar produk (maksimal 5 gambar). Format: JPG, PNG (maks. 2MB per gambar)
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.gambar.map((file, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
              <img
                src={previewUrls[index]}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {data.gambar.length < 5 && (
          <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="gambarUpload"
            />
            <label htmlFor="gambarUpload" className="cursor-pointer text-center">
              <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Tambah Gambar</p>
              <p className="text-xs text-gray-500 mt-1">
                {5 - data.gambar.length} slot tersisa
              </p>
            </label>
          </div>
        )}
      </div>
      
      {errors.gambar && <p className="text-sm text-red-500">{errors.gambar}</p>}
    </div>
  )
}

// Step configurations
const steps: StepConfig[] = [
  {
    id: 'informasi-dasar',
    title: 'Informasi Dasar',
    description: 'Nama, kategori, dan deskripsi produk',
    icon: <Package size={20} />,
    component: StepInformasiDasar,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (!data.nama.trim()) errors.nama = 'Nama produk wajib diisi'
      if (!data.kategoriId) errors.kategoriId = 'Kategori produk wajib dipilih'
      if (!data.deskripsi.trim()) errors.deskripsi = 'Deskripsi produk wajib diisi'
      if (!data.harga || parseInt(data.harga) <= 0) errors.harga = 'Harga harus lebih dari 0'
      if (!data.stok || parseInt(data.stok) < 0) errors.stok = 'Stok tidak boleh negatif'
      if (!data.kondisi) errors.kondisi = 'Kondisi wajib dipilih'
      return errors
    }
  },
  {
    id: 'detail-produk',
    title: 'Detail Produk',
    description: 'Spesifikasi dan ukuran produk',
    icon: <FileText size={20} />,
    component: StepDetailProduk,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (!data.berat || parseInt(data.berat) <= 0) errors.berat = 'Berat harus lebih dari 0'
      return errors
    }
  },
  {
    id: 'informasi-penjual',
    title: 'Informasi Penjual',
    description: 'Data kontak dan alamat penjual',
    icon: <DollarSign size={20} />,
    component: StepInformasiPenjual,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (!data.namaPenjual.trim()) errors.namaPenjual = 'Nama penjual wajib diisi'
      if (!data.noTelepon.trim()) errors.noTelepon = 'Nomor telepon wajib diisi'
      if (!data.alamat.trim()) errors.alamat = 'Alamat wajib diisi'
      if (!data.kota.trim()) errors.kota = 'Kota wajib diisi'
      if (!data.provinsi.trim()) errors.provinsi = 'Provinsi wajib diisi'
      return errors
    }
  },
  {
    id: 'gambar-produk',
    title: 'Gambar Produk',
    description: 'Upload foto produk',
    icon: <Camera size={20} />,
    component: StepGambarProduk,
    validate: (data) => {
      const errors: Record<string, string> = {}
      if (data.gambar.length === 0) errors.gambar = 'Minimal upload 1 gambar produk'
      return errors
    }
  }
]

// Main Component
export function ProdukForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ProdukFormData>({
    nama: '',
    kategoriId: '',
    deskripsi: '',
    harga: '',
    stok: '',
    kondisi: 'BARU',
    berat: '',
    dimensiPanjang: '',
    dimensiLebar: '',
    dimensiTinggi: '',
    warna: '',
    ukuran: '',
    namaPenjual: '',
    noTelepon: '',
    alamat: '',
    kota: '',
    provinsi: '',
    gambar: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [kategori, setKategori] = useState<KategoriProduk[]>([])

  // Fetch kategori data
  useEffect(() => {
    fetch('/api/epasar/kategori')
      .then(res => res.json())
      .then(data => setKategori(data))
      .catch(err => {
        console.error('Failed to fetch kategori:', err)
        appToast({
          title: 'Error',
          description: 'Gagal memuat data kategori',
          variant: 'destructive'
        })
      })
  }, [])

  const updateData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (stepIndex: number): boolean => {
    const stepErrors = steps[stepIndex].validate(formData)
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'gambar') {
          // Add each image file
          value.forEach((file, index) => {
            submitData.append(`gambar${index}`, file)
          })
        } else {
          submitData.append(key, value)
        }
      })

      const response = await fetch('/api/epasar/produk', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Gagal menyimpan produk')
      }

      const result = await response.json()
      
      appToast({
        title: 'Berhasil!',
        description: 'Produk Anda telah berhasil disimpan',
      })

      // Reset form
      setFormData({
        nama: '',
        kategoriId: '',
        deskripsi: '',
        harga: '',
        stok: '',
        kondisi: 'BARU',
        berat: '',
        dimensiPanjang: '',
        dimensiLebar: '',
        dimensiTinggi: '',
        warna: '',
        ukuran: '',
        namaPenjual: '',
        noTelepon: '',
        alamat: '',
        kota: '',
        provinsi: '',
        gambar: []
      })
      setCurrentStep(0)

    } catch (error: any) {
      console.error('Submit error:', error)
      appToast({
        title: 'Error',
        description: error.message || 'Terjadi kesalahan saat menyimpan produk',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Tambah Produk e-Pasar
          </CardTitle>
          <CardDescription className="text-center">
            Jual produk Anda di pasar digital Pagesangan Timur
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    index <= currentStep
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-full h-0.5 mx-2 transition-colors",
                      index < currentStep ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Titles */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center">
                <h3
                  className={cn(
                    "text-sm font-medium transition-colors",
                    index <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Current Step Component */}
          <div className="min-h-[400px]">
            <CurrentStepComponent
              data={formData}
              updateData={updateData}
              errors={errors}
              kategori={kategori}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={16} className="mr-2" />
            Sebelumnya
          </Button>

          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                <CheckCircle2 size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Selanjutnya
                <ChevronRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
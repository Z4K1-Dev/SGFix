'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { Upload, FileText, User, MapPin, Calendar, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface FormData {
  // Data Pribadi
  namaLengkap: string
  nik: string
  tempatLahir: string
  tanggalLahir: string
  jenisKelamin: 'LAKI_LAKI' | 'PEREMPUAN'
  agama: string
  pekerjaan: string
  statusPerkawinan: string
  kewarganegaraan: string
  
  // Alamat
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupatenKota: string
  provinsi: string
  kodePos: string
  
  // Kontak
  noTelepon: string
  email: string
  
  // Data spesifik layanan
  dataSpesifik?: Record<string, any>
  
  // Dokumen
  dokumen?: Record<string, File | null>
}

interface StepConfig {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ComponentType<{
    data: FormData
    updateData: (field: string, value: any) => void
    errors: Record<string, string>
  }>
  validate: (data: FormData) => Record<string, string>
}

// Step Components
const StepDataPribadi: React.FC<{ data: FormData; updateData: (field: string, value: any) => void; errors: Record<string, string> }> = ({ data, updateData, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
        <Input
          id="namaLengkap"
          value={data.namaLengkap}
          onChange={(e) => updateData('namaLengkap', e.target.value)}
          placeholder="Masukkan nama lengkap"
          className={cn(errors.namaLengkap && "border-red-500")}
        />
        {errors.namaLengkap && <p className="text-sm text-red-500">{errors.namaLengkap}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nik">NIK *</Label>
        <Input
          id="nik"
          value={data.nik}
          onChange={(e) => updateData('nik', e.target.value)}
          placeholder="16 digit NIK"
          maxLength={16}
          className={cn(errors.nik && "border-red-500")}
        />
        {errors.nik && <p className="text-sm text-red-500">{errors.nik}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tempatLahir">Tempat Lahir *</Label>
        <Input
          id="tempatLahir"
          value={data.tempatLahir}
          onChange={(e) => updateData('tempatLahir', e.target.value)}
          placeholder="Kota/Kabupaten kelahiran"
          className={cn(errors.tempatLahir && "border-red-500")}
        />
        {errors.tempatLahir && <p className="text-sm text-red-500">{errors.tempatLahir}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tanggalLahir">Tanggal Lahir *</Label>
        <Input
          id="tanggalLahir"
          type="date"
          value={data.tanggalLahir}
          onChange={(e) => updateData('tanggalLahir', e.target.value)}
          className={cn(errors.tanggalLahir && "border-red-500")}
        />
        {errors.tanggalLahir && <p className="text-sm text-red-500">{errors.tanggalLahir}</p>}
      </div>
    </div>

    <div className="space-y-2">
      <Label>Jenis Kelamin *</Label>
      <RadioGroup
        value={data.jenisKelamin}
        onValueChange={(value) => updateData('jenisKelamin', value)}
        className="flex flex-row space-x-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="LAKI_LAKI" id="laki" />
          <Label htmlFor="laki">Laki-laki</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="PEREMPUAN" id="perempuan" />
          <Label htmlFor="perempuan">Perempuan</Label>
        </div>
      </RadioGroup>
      {errors.jenisKelamin && <p className="text-sm text-red-500">{errors.jenisKelamin}</p>}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="agama">Agama *</Label>
        <Select value={data.agama} onValueChange={(value) => updateData('agama', value)}>
          <SelectTrigger className={cn(errors.agama && "border-red-500")}>
            <SelectValue placeholder="Pilih agama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ISLAM">Islam</SelectItem>
            <SelectItem value="KRISTEN">Kristen</SelectItem>
            <SelectItem value="KATOLIK">Katolik</SelectItem>
            <SelectItem value="HINDU">Hindu</SelectItem>
            <SelectItem value="BUDDHA">Buddha</SelectItem>
            <SelectItem value="KONGHUCU">Konghucu</SelectItem>
          </SelectContent>
        </Select>
        {errors.agama && <p className="text-sm text-red-500">{errors.agama}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pekerjaan">Pekerjaan *</Label>
        <Input
          id="pekerjaan"
          value={data.pekerjaan}
          onChange={(e) => updateData('pekerjaan', e.target.value)}
          placeholder="Pekerjaan saat ini"
          className={cn(errors.pekerjaan && "border-red-500")}
        />
        {errors.pekerjaan && <p className="text-sm text-red-500">{errors.pekerjaan}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="statusPerkawinan">Status Perkawinan *</Label>
        <Select value={data.statusPerkawinan} onValueChange={(value) => updateData('statusPerkawinan', value)}>
          <SelectTrigger className={cn(errors.statusPerkawinan && "border-red-500")}>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BELUM_KAWIN">Belum Kawin</SelectItem>
            <SelectItem value="KAWIN">Kawin</SelectItem>
            <SelectItem value="CERAI_HIDUP">Cerai Hidup</SelectItem>
            <SelectItem value="CERAI_MATI">Cerai Mati</SelectItem>
          </SelectContent>
        </Select>
        {errors.statusPerkawinan && <p className="text-sm text-red-500">{errors.statusPerkawinan}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="kewarganegaraan">Kewarganegaraan *</Label>
        <Input
          id="kewarganegaraan"
          value={data.kewarganegaraan}
          onChange={(e) => updateData('kewarganegaraan', e.target.value)}
          placeholder="WNI/WNA"
          className={cn(errors.kewarganegaraan && "border-red-500")}
        />
        {errors.kewarganegaraan && <p className="text-sm text-red-500">{errors.kewarganegaraan}</p>}
      </div>
    </div>
  </div>
)

const StepAlamat: React.FC<{ data: FormData; updateData: (field: string, value: any) => void; errors: Record<string, string> }> = ({ data, updateData, errors }) => (
  <div className="space-y-6">
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

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="rt">RT *</Label>
        <Input
          id="rt"
          value={data.rt}
          onChange={(e) => updateData('rt', e.target.value)}
          placeholder="001"
          className={cn(errors.rt && "border-red-500")}
        />
        {errors.rt && <p className="text-sm text-red-500">{errors.rt}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rw">RW *</Label>
        <Input
          id="rw"
          value={data.rw}
          onChange={(e) => updateData('rw', e.target.value)}
          placeholder="001"
          className={cn(errors.rw && "border-red-500")}
        />
        {errors.rw && <p className="text-sm text-red-500">{errors.rw}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="kodePos">Kode Pos *</Label>
        <Input
          id="kodePos"
          value={data.kodePos}
          onChange={(e) => updateData('kodePos', e.target.value)}
          placeholder="12345"
          maxLength={5}
          className={cn(errors.kodePos && "border-red-500")}
        />
        {errors.kodePos && <p className="text-sm text-red-500">{errors.kodePos}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="kelurahan">Kelurahan *</Label>
        <Input
          id="kelurahan"
          value={data.kelurahan}
          onChange={(e) => updateData('kelurahan', e.target.value)}
          placeholder="Nama kelurahan"
          className={cn(errors.kelurahan && "border-red-500")}
        />
        {errors.kelurahan && <p className="text-sm text-red-500">{errors.kelurahan}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="kecamatan">Kecamatan *</Label>
        <Input
          id="kecamatan"
          value={data.kecamatan}
          onChange={(e) => updateData('kecamatan', e.target.value)}
          placeholder="Nama kecamatan"
          className={cn(errors.kecamatan && "border-red-500")}
        />
        {errors.kecamatan && <p className="text-sm text-red-500">{errors.kecamatan}</p>}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="kabupatenKota">Kabupaten/Kota *</Label>
        <Input
          id="kabupatenKota"
          value={data.kabupatenKota}
          onChange={(e) => updateData('kabupatenKota', e.target.value)}
          placeholder="Nama kabupaten/kota"
          className={cn(errors.kabupatenKota && "border-red-500")}
        />
        {errors.kabupatenKota && <p className="text-sm text-red-500">{errors.kabupatenKota}</p>}
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

const StepKontak: React.FC<{ data: FormData; updateData: (field: string, value: any) => void; errors: Record<string, string> }> = ({ data, updateData, errors }) => (
  <div className="space-y-6">
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
      <Label htmlFor="email">Email *</Label>
      <Input
        id="email"
        type="email"
        value={data.email}
        onChange={(e) => updateData('email', e.target.value)}
        placeholder="email@example.com"
        className={cn(errors.email && "border-red-500")}
      />
      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
    </div>
  </div>
)

const StepDokumen: React.FC<{ data: FormData; updateData: (field: string, value: any) => void; errors: Record<string, string> }> = ({ data, updateData, errors }) => {
  const handleFileUpload = (field: string, file: File | null) => {
    updateData(field, file)
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Upload dokumen yang diperlukan untuk pengajuan layanan. Format yang diterima: PDF, JPG, PNG (maks. 5MB)
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Scan KTP *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('ktpScan', e.target.files?.[0] || null)}
              className="hidden"
              id="ktpScan"
            />
            <label htmlFor="ktpScan" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {data.dokumen?.ktpScan ? data.dokumen.ktpScan.name : 'Klik untuk upload'}
              </p>
            </label>
          </div>
          {errors.ktpScan && <p className="text-sm text-red-500">{errors.ktpScan}</p>}
        </div>

        <div className="space-y-2">
          <Label>Scan KK *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('kkScan', e.target.files?.[0] || null)}
              className="hidden"
              id="kkScan"
            />
            <label htmlFor="kkScan" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {data.dokumen?.kkScan ? data.dokumen.kkScan.name : 'Klik untuk upload'}
              </p>
            </label>
          </div>
          {errors.kkScan && <p className="text-sm text-red-500">{errors.kkScan}</p>}
        </div>

        <div className="space-y-2">
          <Label>Surat Pengantar RT/RW *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('suratPengantar', e.target.files?.[0] || null)}
              className="hidden"
              id="suratPengantar"
            />
            <label htmlFor="suratPengantar" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {data.dokumen?.suratPengantar ? data.dokumen.suratPengantar.name : 'Klik untuk upload'}
              </p>
            </label>
          </div>
          {errors.suratPengantar && <p className="text-sm text-red-500">{errors.suratPengantar}</p>}
        </div>

        <div className="space-y-2">
          <Label>Pas Foto 4x6 (2 lembar) *</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('pasFoto', e.target.files?.[0] || null)}
              className="hidden"
              id="pasFoto"
            />
            <label htmlFor="pasFoto" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {data.dokumen?.pasFoto ? data.dokumen.pasFoto.name : 'Klik untuk upload'}
              </p>
            </label>
          </div>
          {errors.pasFoto && <p className="text-sm text-red-500">{errors.pasFoto}</p>}
        </div>
      </div>
    </div>
  )
}

const StepKonfirmasi: React.FC<{ data: FormData; updateData: (field: string, value: any) => void; errors: Record<string, string> }> = ({ data }) => (
  <div className="space-y-6">
    <div className="text-sm text-muted-foreground">
      Periksa kembali data yang Anda masukkan sebelum mengajukan layanan.
    </div>
    
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Data Pribadi</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Nama:</span> {data.namaLengkap}</p>
            <p><span className="font-medium">NIK:</span> {data.nik}</p>
            <p><span className="font-medium">Tempat/Tanggal Lahir:</span> {data.tempatLahir}, {data.tanggalLahir}</p>
            <p><span className="font-medium">Jenis Kelamin:</span> {data.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
            <p><span className="font-medium">Agama:</span> {data.agama}</p>
            <p><span className="font-medium">Pekerjaan:</span> {data.pekerjaan}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Alamat</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Alamat:</span> {data.alamat}</p>
            <p><span className="font-medium">RT/RW:</span> {data.rt}/{data.rw}</p>
            <p><span className="font-medium">Kelurahan:</span> {data.kelurahan}</p>
            <p><span className="font-medium">Kecamatan:</span> {data.kecamatan}</p>
            <p><span className="font-medium">Kabupaten/Kota:</span> {data.kabupatenKota}</p>
            <p><span className="font-medium">Provinsi:</span> {data.provinsi}</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Kontak</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Telepon:</span> {data.noTelepon}</p>
            <p><span className="font-medium">Email:</span> {data.email}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-2">Dokumen</h4>
          <div className="space-y-1 text-sm">
            {data.dokumen?.ktpScan && <p><span className="font-medium">✓</span> Scan KTP</p>}
            {data.dokumen?.kkScan && <p><span className="font-medium">✓</span> Scan KK</p>}
            {data.dokumen?.suratPengantar && <p><span className="font-medium">✓</span> Surat Pengantar</p>}
            {data.dokumen?.pasFoto && <p><span className="font-medium">✓</span> Pas Foto</p>}
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Persetujuan</p>
          <p>Dengan mengajukan layanan ini, saya menyatakan bahwa data yang saya berikan adalah benar dan dapat dipertanggungjawabkan.</p>
        </div>
      </div>
    </div>
  </div>
)

// Validation functions
const validateDataPribadi = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.namaLengkap.trim()) errors.namaLengkap = 'Nama lengkap wajib diisi'
  if (!data.nik.trim()) errors.nik = 'NIK wajib diisi'
  else if (data.nik.length !== 16) errors.nik = 'NIK harus 16 digit'
  if (!data.tempatLahir.trim()) errors.tempatLahir = 'Tempat lahir wajib diisi'
  if (!data.tanggalLahir) errors.tanggalLahir = 'Tanggal lahir wajib diisi'
  if (!data.jenisKelamin) errors.jenisKelamin = 'Jenis kelamin wajib dipilih'
  if (!data.agama) errors.agama = 'Agama wajib dipilih'
  if (!data.pekerjaan.trim()) errors.pekerjaan = 'Pekerjaan wajib diisi'
  if (!data.statusPerkawinan) errors.statusPerkawinan = 'Status perkawinan wajib dipilih'
  if (!data.kewarganegaraan.trim()) errors.kewarganegaraan = 'Kewarganegaraan wajib diisi'
  
  return errors
}

const validateAlamat = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.alamat.trim()) errors.alamat = 'Alamat lengkap wajib diisi'
  if (!data.rt.trim()) errors.rt = 'RT wajib diisi'
  if (!data.rw.trim()) errors.rw = 'RW wajib diisi'
  if (!data.kelurahan.trim()) errors.kelurahan = 'Kelurahan wajib diisi'
  if (!data.kecamatan.trim()) errors.kecamatan = 'Kecamatan wajib diisi'
  if (!data.kabupatenKota.trim()) errors.kabupatenKota = 'Kabupaten/Kota wajib diisi'
  if (!data.provinsi.trim()) errors.provinsi = 'Provinsi wajib diisi'
  if (!data.kodePos.trim()) errors.kodePos = 'Kode pos wajib diisi'
  else if (data.kodePos.length !== 5) errors.kodePos = 'Kode pos harus 5 digit'
  
  return errors
}

const validateKontak = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.noTelepon.trim()) errors.noTelepon = 'Nomor telepon wajib diisi'
  if (!data.email.trim()) errors.email = 'Email wajib diisi'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Format email tidak valid'
  
  return errors
}

const validateDokumen = (data: FormData): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  if (!data.dokumen?.ktpScan) errors.ktpScan = 'Scan KTP wajib diupload'
  if (!data.dokumen?.kkScan) errors.kkScan = 'Scan KK wajib diupload'
  if (!data.dokumen?.suratPengantar) errors.suratPengantar = 'Surat pengantar wajib diupload'
  if (!data.dokumen?.pasFoto) errors.pasFoto = 'Pas foto wajib diupload'
  
  return errors
}

const validateKonfirmasi = (): Record<string, string> => {
  return {} // No validation needed for confirmation step
}

// Main Component
interface MultiStepFormProps {
  jenisLayanan: string
  onSubmit: (data: FormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MultiStepForm({ jenisLayanan, onSubmit, onCancel, isLoading = false }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  
  const [formData, setFormData] = useState<FormData>({
    // Data Pribadi
    namaLengkap: '',
    nik: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'LAKI_LAKI',
    agama: '',
    pekerjaan: '',
    statusPerkawinan: '',
    kewarganegaraan: 'WNI',
    
    // Alamat
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kabupatenKota: '',
    provinsi: '',
    kodePos: '',
    
    // Kontak
    noTelepon: '',
    email: '',
    
    // Dokumen
    dokumen: {}
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps: StepConfig[] = [
    {
      id: 'data-pribadi',
      title: 'Data Pribadi',
      description: 'Informasi identitas diri',
      icon: <User className="h-5 w-5" />,
      component: StepDataPribadi,
      validate: validateDataPribadi
    },
    {
      id: 'alamat',
      title: 'Alamat',
      description: 'Informasi alamat lengkap',
      icon: <MapPin className="h-5 w-5" />,
      component: StepAlamat,
      validate: validateAlamat
    },
    {
      id: 'kontak',
      title: 'Kontak',
      description: 'Informasi kontak',
      icon: <FileText className="h-5 w-5" />,
      component: StepKontak,
      validate: validateKontak
    },
    {
      id: 'dokumen',
      title: 'Dokumen',
      description: 'Upload dokumen yang diperlukan',
      icon: <Upload className="h-5 w-5" />,
      component: StepDokumen,
      validate: validateDokumen
    },
    {
      id: 'konfirmasi',
      title: 'Konfirmasi',
      description: 'Periksa kembali data Anda',
      icon: <CheckCircle2 className="h-5 w-5" />,
      component: StepKonfirmasi,
      validate: validateKonfirmasi
    }
  ]

  const updateData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateCurrentStep = (): boolean => {
    const stepErrors = steps[currentStep].validate(formData)
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        setErrors({})
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData)
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold leading-tight">Pengajuan Layanan: {jenisLayanan}</h2>
            <Badge variant="outline" className="text-xs">
              {currentStep + 1}/{steps.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {steps[currentStep].icon}
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {/* Progress Steps - Compact Version */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs transition-colors",
                    index <= currentStep
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1 transition-colors",
                      index <= currentStep ? "bg-primary" : "border-muted-foreground border-t-2 border-dashed"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="min-h-[300px]">
          <CurrentStepComponent data={formData} updateData={updateData} errors={errors} />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <div className="flex w-full justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button size="sm" onClick={handleNext} disabled={isLoading}>
                Selanjutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Mengajukan...' : 'Ajukan'}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
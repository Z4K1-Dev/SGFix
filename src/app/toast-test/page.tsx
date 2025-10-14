"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCallback } from "react"

export default function ToastTestPage() {
  const { toast, dismiss } = useToast()

  const showSuccess = useCallback(() => {
    toast({ title: "Berhasil", description: "Data berhasil disimpan." })
  }, [toast])

  const showError = useCallback(() => {
    toast({ title: "Error", description: "Terjadi kesalahan.", variant: "destructive" })
  }, [toast])

  const showInfo = useCallback(() => {
    toast({ title: "Info", description: "Informasi singkat untuk pengguna." })
  }, [toast])

  const showWarning = useCallback(() => {
    toast({ title: "Peringatan", description: "Mohon periksa kembali input Anda." })
  }, [toast])

  const showLoadingThenSuccess = useCallback(() => {
    const t = toast({ title: "Loading", description: "Memproses..." })
    setTimeout(() => {
      t.update({ id: t.id, title: "Berhasil", description: "Selesai diproses." })
    }, 1500)
  }, [toast])

  const dismissAll = useCallback(() => {
    dismiss()
  }, [dismiss])

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Toast Test</h1>
        <p className="text-sm text-muted-foreground">Demo integrasi Sera UI Toast via useToast()</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Button onClick={showSuccess} variant="default">Success</Button>
        <Button onClick={showInfo} variant="secondary">Info</Button>
        <Button onClick={showWarning} variant="outline">Warning</Button>
        <Button onClick={showError} variant="destructive">Error</Button>
        <Button onClick={showLoadingThenSuccess} variant="ghost">Loading → Success</Button>
        <Button onClick={dismissAll} variant="outline">Dismiss All</Button>
      </div>

      <p className="text-xs text-muted-foreground">Buka halaman ini dan klik tombol untuk memunculkan toast. Komponen Toaster sudah dipasang global di layout.</p>
    </main>
  )
}


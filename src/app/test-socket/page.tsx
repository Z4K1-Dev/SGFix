'use client'

import dynamic from 'next/dynamic'

// Import komponen secara dinamik untuk menghindari error import
const SocketDebug = dynamic(() => import('@/components/socket-debug').then(mod => ({ default: mod.SocketDebug })), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading Socket Debug Component...</div>
})

/**
 * Halaman testing untuk koneksi Socket.IO
 * Menampilkan komponen debug untuk user dan admin
 */
export default function TestSocketPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Socket.IO Connection Test</h1>
          <p className="text-muted-foreground">
            Halaman ini digunakan untuk testing koneksi Socket.IO antara client dan server.
          </p>
        </div>

        {/* User Debug */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">User Connection Debug</h2>
          <SocketDebug role="user" />
        </div>

        {/* Admin Debug */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Admin Connection Debug</h2>
          <SocketDebug role="admin" />
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Petunjuk Penggunaan</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <p className="text-sm">
                Komponen akan otomatis mencoba terhubung ke Socket.IO server saat dimuat
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <p className="text-sm">
                Perhatikan status koneksi (Connected/Disconnected) pada setiap debug component
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <p className="text-sm">
                Jika status disconnected, periksa Connection Logs untuk error message
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <p className="text-sm">
                Gunakan tombol "Send Heartbeat" untuk test koneksi ke server
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">5.</span>
              <p className="text-sm">
                Kirim test notification untuk memastikan real-time communication berfungsi
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">6.</span>
              <p className="text-sm">
                Pastikan server berjalan dengan benar dan tidak ada firewall yang memblokir koneksi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
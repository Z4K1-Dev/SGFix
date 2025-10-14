'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useGlobalSocket } from '@/hooks/useGlobalSocket'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export default function TestNotifPage() {
  const {
    isConnected,
    connectionError,
    sendNotification,
    playNotificationSound,
    soundEnabled,
    toggleNotificationSound,
    notifications,
    clearNotifications,
    socketId
  } = useGlobalSocket('admin')

  const [debugLogs, setDebugLogs] = useState<string[]>([])

  // Add debug logging
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10)) // Keep last 10 logs
  }

  // Monitor socket connection
  useEffect(() => {
    if (isConnected) {
      addDebugLog('Socket connected successfully')
    } else {
      addDebugLog('Socket disconnected')
    }
  }, [isConnected])

  // Monitor connection errors
  useEffect(() => {
    if (connectionError) {
      addDebugLog(`Connection error: ${connectionError}`)
    }
  }, [connectionError])

  // Monitor notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      addDebugLog(`Notification received: ${latestNotification.judul} - ${latestNotification.pesan}`)
    }
  }, [notifications])

  const sendToAdmin = async () => {
    try {
      addDebugLog('Sending notification to admin...')
      await sendNotification({
        type: 'TEST_ADMIN',
        message: 'Ini adalah notifikasi test untuk admin',
        room: 'admin'
      })
      toast.success('Notifikasi dikirim ke admin')
      addDebugLog('Notification sent to admin successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error sending notification to admin:', error)
      toast.error('Gagal mengirim notifikasi ke admin')
      addDebugLog(`Failed to send notification to admin: ${errorMessage}`)
    }
  }

  const sendToUser = async () => {
    try {
      addDebugLog('Sending notification to user...')
      await sendNotification({
        type: 'TEST_USER',
        message: 'Ini adalah notifikasi test untuk user',
        room: 'public'
      })
      toast.success('Notifikasi dikirim ke user')
      addDebugLog('Notification sent to user successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error sending notification to user:', error)
      toast.error('Gagal mengirim notifikasi ke user')
      addDebugLog(`Failed to send notification to user: ${errorMessage}`)
    }
  }

  const testSound = () => {
    addDebugLog('Testing notification sound...')
    playNotificationSound()
    toast.info('Test suara notifikasi diputar')
  }

  const clearDebugLogs = () => {
    setDebugLogs([])
    addDebugLog('Debug logs cleared')
  }

  const copyDebugLogs = () => {
    const logsText = debugLogs.join('\n')
    navigator.clipboard.writeText(logsText)
    toast.success('Debug logs copied to clipboard')
  }

  const testMultipleNotifications = async () => {
    addDebugLog('Testing multiple notifications...')
    try {
      // Send 3 test notifications in sequence
      for (let i = 1; i <= 3; i++) {
        await sendNotification({
          type: 'TEST_MULTI',
          message: `Test notifikasi ke-${i}`,
          room: 'admin'
        })
        await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay
      }
      toast.success('Multiple notifications sent')
      addDebugLog('Multiple notifications test completed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error in multiple notifications test:', error)
      toast.error('Gagal mengirim multiple notifications')
      addDebugLog(`Multiple notifications test failed: ${errorMessage}`)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Notifikasi - Debug Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Status Koneksi: {isConnected ? 'Terhubung' : 'Terputus'}</span>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            {connectionError && (
              <div className="text-red-500">
                Error Koneksi: {connectionError}
              </div>
            )}

            {socketId && (
              <div className="text-sm text-muted-foreground">
                Socket ID: {socketId}
              </div>
            )}
          </div>

          {/* Debug Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Debug Logs
                <div className="flex gap-2">
                  <Button
                    onClick={clearDebugLogs}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={copyDebugLogs}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-40 overflow-y-auto">
                {debugLogs.length > 0 ? (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                ) : (
                  <div className="text-gray-500">No debug logs yet...</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Sending */}
            <Card>
              <CardHeader>
                <CardTitle>Kirim Notifikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={sendToAdmin}
                  className="w-full"
                  disabled={!isConnected}
                >
                  Kirim ke Admin
                </Button>
                
                <Button
                  onClick={sendToUser}
                  className="w-full"
                  disabled={!isConnected}
                >
                  Kirim ke User
                </Button>

                <Button
                  onClick={testMultipleNotifications}
                  className="w-full"
                  disabled={!isConnected}
                  variant="outline"
                >
                  Test Multiple (3x)
                </Button>
              </CardContent>
            </Card>

            {/* Sound Testing */}
            <Card>
              <CardHeader>
                <CardTitle>Test Suara</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span>Status Suara: {soundEnabled ? 'Aktif' : 'Nonaktif'}</span>
                  <Badge variant={soundEnabled ? 'default' : 'secondary'}>
                    {soundEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button
                    onClick={toggleNotificationSound}
                    variant="outline"
                    size="sm"
                  >
                    Toggle
                  </Button>
                </div>
                
                <Button
                  onClick={testSound}
                  className="w-full"
                  disabled={!soundEnabled}
                >
                  Test Suara Notifikasi
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Received */}
          {notifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Notifikasi Terima ({notifications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notifications.slice(0, 5).map((notif, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <div className="font-medium">{notif.judul}</div>
                      <div className="text-muted-foreground">{notif.pesan}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={clearNotifications}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Clear Notifications
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Instruksi Debug:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Buka halaman admin di tab/browser lain</li>
              <li>Klik tombol "Kirim ke Admin" untuk mengirim notifikasi</li>
              <li>Buka halaman user di tab/browser lain</li>
              <li>Klik tombol "Kirim ke User" untuk mengirim notifikasi</li>
              <li>Periksa apakah toast dan suara notifikasi muncul</li>
              <li>Periksa debug logs untuk melihat detail koneksi</li>
              <li>Gunakan "Test Multiple" untuk mengirim 3 notifikasi sekaligus</li>
              <li>Copy debug logs jika ada masalah untuk analisis lebih lanjut</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw, Send } from 'lucide-react'

interface Notification {
  id: number
  judul: string
  pesan: string
  tipe: string
  timestamp: string
}

/**
 * Komponen untuk debugging koneksi Socket.IO
 * Menampilkan status koneksi dan menyediakan kontrol untuk testing
 */
export function SocketDebug({ role = 'user' }: { role?: 'user' | 'admin' }) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [testMessage, setTestMessage] = useState('Test message')
  const [isSending, setIsSending] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const socketRef = useRef<any>(null)
  const [socketId, setSocketId] = useState<string | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const connectSocket = async () => {
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    addLog(`Connecting to Socket.IO server as ${role}...`)
    setIsConnected(false)
    setConnectionError(null)
    
    try {
      // Import socket.io-client dynamically
      const { io } = await import('socket.io-client')
      
      // Create socket connection with simpler configuration
      const socket = io(window.location.origin, {
        path: '/api/socket',
        transports: ['polling'], // Use only polling for more stable connection
        timeout: 10000
      })
      
      socketRef.current = socket
      
      // Handle connection
      socket.on('connect', () => {
        addLog(`Connected to Socket.IO server with ID: ${socket.id}`)
        setIsConnected(true)
        setConnectionError(null)
        setSocketId(socket.id)
        
        // Join appropriate room based on role
        if (role === 'admin') {
          socket.emit('join-admin')
          addLog('Joined admin room')
        } else {
          socket.emit('join-user')
          addLog('Joined user room')
        }
      })
      
      // Handle connection error
      socket.on('connect_error', (error: any) => {
        addLog(`Connection error: ${error.message}`)
        setIsConnected(false)
        setConnectionError(error.message)
        setSocketId(null)
      })
      
      // Handle disconnect
      socket.on('disconnect', (reason: string) => {
        addLog(`Disconnected: ${reason}`)
        setIsConnected(false)
        setConnectionError(`Disconnected: ${reason}`)
        setSocketId(null)
      })
      
      // Handle notifications
      socket.on('notification', (data: any) => {
        addLog(`Received notification: ${JSON.stringify(data)}`)
        if (data && data.judul) {
          setNotifications(prev => [data, ...prev])
        } else {
          addLog('Invalid notification data received')
        }
      })
      
      // Handle heartbeat response
      socket.on('heartbeat-response', (data: any) => {
        addLog(`Heartbeat response received: ${JSON.stringify(data)}`)
      })
      
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsConnected(false)
      setConnectionError(error instanceof Error ? error.message : 'Unknown error')
      setSocketId(null)
    }
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      addLog('Socket disconnected')
      socketRef.current = null
      setIsConnected(false)
      setSocketId(null)
    }
  }

  const handleSendTestNotification = async () => {
    if (!socketRef.current || !socketRef.current.connected) return
    
    setIsSending(true)
    try {
      const notificationData = {
        type: 'test',
        message: testMessage,
        room: role === 'admin' ? 'admin' : 'public'
      }
      
      addLog(`Sending notification: ${JSON.stringify(notificationData)}`)
      socketRef.current.emit('send-notification', notificationData)
      addLog(`Test notification sent: ${testMessage}`)
      setTestMessage('Test message sent!')
      setTimeout(() => setTestMessage('Test message'), 2000)
    } catch (error) {
      addLog(`Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTestMessage('Failed to send')
      setTimeout(() => setTestMessage('Test message'), 2000)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendHeartbeat = () => {
    if (!socketRef.current || !socketRef.current.connected) return
    
    try {
      socketRef.current.emit('heartbeat')
      addLog('Heartbeat sent')
    } catch (error) {
      addLog(`Failed to send heartbeat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const clearLogs = () => {
    setLogs([])
  }

  // Auto-connect on component mount
  useEffect(() => {
    connectSocket()
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [role])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="text-green-500" size={20} />
          ) : (
            <WifiOff className="text-red-500" size={20} />
          )}
          Socket.IO Debug ({role})
        </CardTitle>
        {socketId && (
          <p className="text-xs text-muted-foreground">ID: {socketId}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Connection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Error Message */}
        {connectionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{connectionError}</p>
          </div>
        )}

        {/* Connection Controls */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={connectSocket} variant="outline" size="sm" className="flex-1">
              <RefreshCw size={16} className="mr-2" />
              Connect
            </Button>
          ) : (
            <Button onClick={disconnectSocket} variant="outline" size="sm" className="flex-1">
              Disconnect
            </Button>
          )}
        </div>

        {/* Control Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleSendHeartbeat}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!isConnected}
          >
            <RefreshCw size={16} className="mr-2" />
            Send Heartbeat
          </Button>

          <div className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Test message"
            />
            <Button
              onClick={handleSendTestNotification}
              size="sm"
              disabled={!isConnected || isSending}
            >
              <Send size={16} className="mr-1" />
              Send
            </Button>
          </div>

          {notifications.length > 0 && (
            <Button
              onClick={clearNotifications}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Notifications
            </Button>
          )}
        </div>

        {/* Notifications Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Notifications:</span>
          <Badge variant="outline">{notifications.length}</Badge>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Notifications:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {notifications.slice(0, 5).map((notif, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium">{notif.judul}</p>
                  <p className="text-gray-600">{notif.pesan}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Logs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Connection Logs:</h4>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              Clear
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 h-32 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Tambahkan default export untuk dynamic import
export default SocketDebug
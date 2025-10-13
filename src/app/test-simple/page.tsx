'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

/**
 * Halaman testing sederhana untuk koneksi Socket.IO
 */
export default function TestSimplePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testConnection = async () => {
    addLog('Testing Socket.IO connection...')
    
    try {
      // Import socket.io-client dynamically
      const { io } = await import('socket.io-client')
      
      // Create socket connection
      const socket = io(window.location.origin, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        timeout: 5000
      })
      
      // Handle connection
      socket.on('connect', () => {
        addLog(`Connected to Socket.IO server with ID: ${socket.id}`)
        setIsConnected(true)
        setConnectionError(null)
      })
      
      // Handle connection error
      socket.on('connect_error', (error) => {
        addLog(`Connection error: ${error.message}`)
        setIsConnected(false)
        setConnectionError(error.message)
      })
      
      // Handle disconnect
      socket.on('disconnect', (reason) => {
        addLog(`Disconnected: ${reason}`)
        setIsConnected(false)
        setConnectionError(`Disconnected: ${reason}`)
      })
      
      // Test heartbeat
      socket.on('heartbeat-response', (data) => {
        addLog(`Heartbeat response received: ${JSON.stringify(data)}`)
      })
      
      // Send heartbeat after connection
      setTimeout(() => {
        if (socket.connected) {
          socket.emit('heartbeat')
          addLog('Heartbeat sent')
        }
      }, 1000)
      
      // Cleanup after 10 seconds
      setTimeout(() => {
        socket.disconnect()
        addLog('Socket disconnected after test')
      }, 10000)
      
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsConnected(false)
      setConnectionError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple Socket.IO Test</h1>
        
        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="text-green-500" size={20} />
              ) : (
                <WifiOff className="text-red-500" size={20} />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            {connectionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-600">Error: {connectionError}</p>
              </div>
            )}
            
            <Button onClick={testConnection} className="w-full">
              <RefreshCw size={16} className="mr-2" />
              Test Connection
            </Button>
          </CardContent>
        </Card>
        
        {/* Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Connection Logs</CardTitle>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Click "Test Connection" to start.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
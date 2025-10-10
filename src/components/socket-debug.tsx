'use client'

import { useEffect, useState } from 'react'
import socketClient from '@/lib/socket-client'

export default function SocketDebug() {
  const [logs, setLogs] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const addLog = (message: string) => {
      const timestamp = new Date().toISOString()
      setLogs(prev => [...prev, `${timestamp} - ${message}`])
    }

    const testConnection = async () => {
      try {
        addLog('Starting socket connection test...')
        const socket = await socketClient.connect()
        
        socket.on('connect', () => {
          addLog(`Connected with ID: ${socket.id}`)
          setIsConnected(true)
        })
        
        socket.on('connect_error', (error) => {
          addLog(`Connection error: ${error.message}`)
          setIsConnected(false)
        })
        
        socket.on('disconnect', (reason) => {
          addLog(`Disconnected: ${reason}`)
          setIsConnected(false)
        })
        
        socket.on('heartbeat-response', (data) => {
          addLog(`Heartbeat response: ${JSON.stringify(data)}`)
        })
        
        // Test heartbeat
        socket.emit('heartbeat')
        addLog('Sent heartbeat')
        
      } catch (error) {
        addLog(`Failed to connect: ${error}`)
        setIsConnected(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-w-md max-h-64 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Socket Debug</h3>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>
      <div className="text-xs space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="text-gray-600 dark:text-gray-400">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
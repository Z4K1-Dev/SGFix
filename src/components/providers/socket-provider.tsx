'use client'

import { socketManager } from '@/lib/socket-manager'
import { useEffect, useRef, useState } from 'react'
import { SocketContext } from '@/contexts/socket-context'

/**
 * Global Socket Provider
 * Memastikan hanya ada satu instance Socket.IO untuk seluruh aplikasi
 * Mengatasi masalah HMR dan multiple component lifecycle
 */

interface SocketProviderProps {
  children: React.ReactNode
}


export function SocketProvider({ children }: SocketProviderProps) {
  const initializedRef = useRef(false)
  const [connectedSocket, setConnectedSocket] = useState<any>(null)

  useEffect(() => {
    // Only initialize once per app lifecycle
    if (initializedRef.current) {
      console.log('SocketProvider: Already initialized, skipping...')
      return
    }

    initializedRef.current = true
    console.log('=== SOCKET PROVIDER INIT ===')
    console.log('SocketProvider: Initializing global socket connection...')
    console.log('Timestamp:', new Date().toISOString())
    console.log('URL:', window.location.href)

    const initializeSocket = async () => {
      try {
        // Connect via SocketManager (singleton)
        const socket = await socketManager.connect()
        console.log('SocketProvider: Global socket connected:', socket.id)
        setConnectedSocket(socket)

        // Join default rooms for global connection
        socket.emit('join-room', 'public')
        socket.emit('join-room', 'admin')

        // Handle global socket events
        socketManager.on('disconnect', (reason) => {
          console.log('SocketProvider: Global socket disconnected:', reason)
        })

        socketManager.on('connect', () => {
          console.log('SocketProvider: Global socket reconnected')
        })

      } catch (error) {
        console.error('SocketProvider: Failed to initialize global socket:', error)
      }
    }

    // Initialize socket with a delay to ensure DOM is ready and prevent HMR issues
    const timeout = setTimeout(initializeSocket, 500)

    return () => {
      clearTimeout(timeout)
      console.log('SocketProvider: Cleanup - keeping global socket alive for other components')
    }
  }, [])

  // Global cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('SocketProvider: Page unloading, disconnecting socket...')
      socketManager.disconnect()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return (
    <SocketContext.Provider value={connectedSocket}>
      {children}
    </SocketContext.Provider>
  )
}
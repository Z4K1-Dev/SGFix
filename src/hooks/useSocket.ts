'use client'

import { useEffect, useState, useCallback } from 'react'
import socketClient from '@/lib/socket-client'

interface Notification {
  id?: number
  judul: string
  pesan: string
  tipe: string
  timestamp: string
  beritaId?: string
  laporanId?: string
  layananId?: string
  data?: any
}

export const useSocket = (role: 'admin' | 'user' = 'user') => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Set initialization complete after mount
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Initialize socket connection after initialization
  useEffect(() => {
    // Only run on client side and after initialization
    if (typeof window === 'undefined' || !isInitialized) return
    
    let mounted = true

    const initializeSocket = async () => {
      try {
        console.log('Initializing socket connection...')
        
        // Add a small delay to ensure HMR is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const socket = await socketClient.connect()
        
        if (!mounted) return

        console.log('Socket connected successfully:', socket.id)

        // Listen untuk notifikasi
        socket.on('notification', (data: Notification) => {
          console.log('Received notification:', data)
          setNotifications(prev => [data, ...prev])
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.judul, {
              body: data.pesan,
              icon: '/favicon.ico'
            })
          }
        })

        // Listen untuk update status layanan
        socket.on('layanan-status-updated', (data: any) => {
          console.log('Layanan status updated:', data)
        })

        // Listen untuk update status laporan
        socket.on('laporan-status-updated', (data: any) => {
          console.log('Laporan status updated:', data)
        })

        // Listen untuk balasan baru
        socket.on('balasan-added', (data: any) => {
          console.log('Balasan added:', data)
        })

        // Listen untuk heartbeat response
        socket.on('heartbeat-response', (data: any) => {
          console.log('Heartbeat response:', data)
        })

        // Listen untuk connect/disconnect events
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id)
          setIsConnected(true)
          setConnectionError(null)
        })

        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason)
          setIsConnected(false)
          setConnectionError(`Disconnected: ${reason}`)
        })

        socket.on('connect_error', (error) => {
          console.error('Socket connect error:', error)
          setConnectionError(`Connection error: ${error.message}`)
          setIsConnected(false)
        })

        // Update connection status
        setIsConnected(true)
        setConnectionError(null)

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission()
        }

      } catch (error) {
        console.error('Failed to initialize socket:', error)
        if (mounted) {
          setConnectionError(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
          setIsConnected(false)
        }
      }
    }

    initializeSocket()

    return () => {
      mounted = false
      socketClient.disconnect()
    }
  }, [])

  // Set initialization complete after mount
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Send notification
  const sendNotification = useCallback((data: {
    type: string
    message: string
    room?: string
    data?: any
  }) => {
    socketClient.sendNotification(data)
  }, [])

  // Update layanan status
  const updateLayananStatus = useCallback((data: {
    layananId: string
    status: string
    room?: string
  }) => {
    socketClient.updateLayananStatus(data)
  }, [])

  // Update laporan status
  const updateLaporanStatus = useCallback((data: {
    laporanId: string
    status: string
    room?: string
  }) => {
    socketClient.updateLaporanStatus(data)
  }, [])

  // Send balasan
  const sendBalasan = useCallback((data: {
    type: 'layanan' | 'laporan'
    id: string
    balasan: any
    room?: string
  }) => {
    socketClient.sendBalasan(data)
  }, [])

  // Join room
  const joinRoom = useCallback((room: string) => {
    socketClient.joinRoom(room)
  }, [])

  // Leave room
  const leaveRoom = useCallback((room: string) => {
    socketClient.leaveRoom(room)
  }, [])

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    socketClient.sendHeartbeat()
  }, [])

  // If socket is not connected after initialization, set a friendly message
  useEffect(() => {
    if (isInitialized && !isConnected && !connectionError) {
      console.log('Socket not connected after initialization, setting offline mode')
      setConnectionError('Offline mode - real-time features not available')
    }
  }, [isInitialized, isConnected, connectionError])

  // Calculate offline mode
  const isOfflineMode = isInitialized && !isConnected

  // Debug logging
  useEffect(() => {
    console.log('Socket status changed:', {
      isInitialized,
      isConnected,
      connectionError,
      isOfflineMode
    })
  }, [isInitialized, isConnected, connectionError, isOfflineMode])

  return {
    socket: socketClient.getSocket(),
    isConnected,
    connectionError,
    notifications,
    clearNotifications,
    sendNotification,
    updateLayananStatus,
    updateLaporanStatus,
    sendBalasan,
    joinRoom,
    leaveRoom,
    sendHeartbeat,
    isOfflineMode: isInitialized && !isConnected
  }
}
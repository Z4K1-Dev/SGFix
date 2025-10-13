'use client'

import { socketClient } from '@/lib/socket-client'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Notification {
  id: number
  judul: string
  pesan: string
  tipe: string
  timestamp: string
}

interface UseSocketReturn {
  isConnected: boolean
  connectionError: string | null
  notifications: Notification[]
  clearNotifications: () => void
  sendNotification: (data: { type: string; message: string; room?: string }) => Promise<void>
  sendHeartbeat: () => Promise<void>
  isOfflineMode: boolean
}

/**
 * Hook untuk mengelola koneksi Socket.IO
 * @param role - Role user ('user' atau 'admin')
 * @returns Objek dengan status koneksi dan fungsi-fungsi Socket.IO
 */
export function useSocket(role: 'user' | 'admin' = 'user'): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const socketRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Send notification
  const sendNotification = useCallback(async (data: { type: string; message: string; room?: string }) => {
    if (!socketRef.current || !socketRef.current.connected) {
      throw new Error('Socket not connected')
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        socketRef.current.emit('send-notification', {
          type: data.type,
          message: data.message,
          room: data.room || (role === 'admin' ? 'admin' : 'public')
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }, [role])

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!socketRef.current || !socketRef.current.connected) {
      throw new Error('Socket not connected')
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        socketRef.current.emit('heartbeat')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }, [])

  // Initialize socket connection
  const connectSocket = useCallback(async () => {
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    try {
      console.log('Initializing socket connection...')
      
      const socketInstance = await socketClient.connect()
      
      if (!mountedRef.current) {
        socketInstance.disconnect()
        return
      }

      console.log('Socket connected successfully:', socketInstance.id)
      socketRef.current = socketInstance
      
      // Join appropriate room based on role
      if (role === 'admin') {
        socketInstance.emit('join-admin')
        console.log('Joined admin room')
      } else {
        socketInstance.emit('join-user')
        console.log('Joined user room')
      }

      // Listen untuk notifikasi
      socketInstance.on('notification', (data: any) => {
        console.log('Received notification:', data)
        if (data && data.judul && mountedRef.current) {
          setNotifications(prev => [data, ...prev])
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.judul, {
              body: data.pesan,
              icon: '/favicon.ico'
            })
          }
        }
      })

      // Listen untuk update status layanan
      socketInstance.on('layanan-status-updated', (data: any) => {
        console.log('Layanan status updated:', data)
      })

      // Listen untuk update status laporan
      socketInstance.on('laporan-status-updated', (data: any) => {
        console.log('Laporan status updated:', data)
      })

      // Listen untuk balasan baru
      socketInstance.on('balasan-added', (data: any) => {
        console.log('Balasan added:', data)
      })

      // Listen untuk heartbeat response
      socketInstance.on('heartbeat-response', (data: any) => {
        console.log('Heartbeat response:', data)
      })

      // Listen untuk connect/disconnect events
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id)
        if (mountedRef.current) {
          setIsConnected(true)
          setConnectionError(null)
          setIsOfflineMode(false)
        }
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        if (mountedRef.current) {
          setIsConnected(false)
          // Don't set error for normal disconnects (like HMR)
          if (reason !== 'transport close') {
            setConnectionError(`Disconnected: ${reason}`)
          }
        }
      })

      socketInstance.on('connect_error', (error: any) => {
        console.error('Socket connect error:', error)
        if (mountedRef.current) {
          setConnectionError(`Connection error: ${error.message}`)
          setIsConnected(false)
        }
      })

      socketInstance.on('reconnect', (attemptNumber: number) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts')
        if (mountedRef.current) {
          setIsConnected(true)
          setConnectionError(null)
          setIsOfflineMode(false)
        }
      })

      socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
        console.log('Socket reconnection attempt:', attemptNumber)
      })

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed')
        if (mountedRef.current) {
          setConnectionError('Reconnection failed')
          setIsConnected(false)
          setIsOfflineMode(true)
        }
      })

      // Update connection status
      if (mountedRef.current) {
        setIsConnected(true)
        setConnectionError(null)
        setIsOfflineMode(false)
      }

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }

    } catch (error) {
      console.error('Failed to initialize socket:', error)
      if (mountedRef.current) {
        setConnectionError(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsConnected(false)
        setIsOfflineMode(true)
      }
    }
  }, [role])

  // Initialize socket connection
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    mountedRef.current = true
    
    // Add a small delay to ensure HMR is ready
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        connectSocket()
      }
    }, 500)

    return () => {
      mountedRef.current = false
      
      // Clear any pending timeouts
      if (timeout) {
        clearTimeout(timeout)
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [connectSocket])

  // Handle hot reload - reconnect after HMR
  useEffect(() => {
    const handleHotReload = () => {
      console.log('Hot reload detected, reconnecting socket...')
      if (mountedRef.current) {
        // Add a delay to ensure the new component is mounted
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connectSocket()
          }
        }, 1000)
      }
    }

    // Listen for hot reload events
    if (typeof window !== 'undefined') {
      window.addEventListener('hot-reload', handleHotReload)
      
      return () => {
        window.removeEventListener('hot-reload', handleHotReload)
      }
    }
  }, [connectSocket])

  // If socket is not connected after initialization, set a friendly message
  useEffect(() => {
    // Wait longer before setting offline mode to allow connection to establish
    const timer = setTimeout(() => {
      if (!isConnected && !connectionError && mountedRef.current) {
        console.log('Socket not connected after initialization, setting offline mode')
        setConnectionError('Offline mode - real-time features not available')
        setIsOfflineMode(true)
      }
    }, 3000) // Wait 3 seconds before setting offline mode

    return () => clearTimeout(timer)
  }, [isConnected, connectionError])

  return {
    isConnected,
    connectionError,
    notifications,
    clearNotifications,
    sendNotification,
    sendHeartbeat,
    isOfflineMode
  }
}
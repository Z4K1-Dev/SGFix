'use client'

import { useEffect, useState } from 'react'

interface Notification {
  judul: string;
  pesan: string;
  tipe: string;
  timestamp: string;
  beritaId?: string;
  laporanId?: string;
}

export const useSocket = (role: 'admin' | 'user') => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only import socket.io-client on the client side
    if (typeof window === 'undefined') return

    let socketInstance: any = null

    const initializeSocket = async () => {
      try {
        // Dynamic import to avoid build-time issues
        const { io } = await import('socket.io-client')

        // Detect if we're in remote access environment
        const isRemoteAccess =
          (window.location.hostname.includes('space.z.ai') ||
           window.location.hostname.includes('preview-chat') ||
           window.location.protocol === 'https:')

        // Socket.io configuration
        let socketUrl: string
        let socketOptions: any = {
          forceNew: true,
          reconnection: false, // Disable auto reconnection to reduce errors
          timeout: 5000, // Shorter timeout
          withCredentials: false
        }

        if (isRemoteAccess) {
          // For remote access, use fallback mode immediately
          console.log('Remote access detected, using offline mode')
          setConnectionError('Offline mode - real-time features not available')
          setIsConnected(false)
          return
        } else {
          socketUrl = '/api/socket/io'
          socketOptions.transports = ['polling'] // Use polling only for better compatibility
          socketOptions.upgrade = false
          socketOptions.rememberUpgrade = false
        }

        socketInstance = io(socketUrl, socketOptions)

        socketInstance.on('connect', () => {
          console.log('Connected to server with socket ID:', socketInstance.id)
          setIsConnected(true)
          setConnectionError(null)
          
          // Join room berdasarkan role
          if (role === 'admin') {
            socketInstance.emit('join-admin')
            console.log('Joined admin room')
          } else {
            socketInstance.emit('join-user')
            console.log('Joined user room')
          }
        })

        socketInstance.on('disconnect', (reason: any) => {
          console.log('Disconnected from server. Reason:', reason)
          setIsConnected(false)
        })

        socketInstance.on('connect_error', (error: any) => {
          console.log('Socket connection failed, using fallback mode')
          setConnectionError('Connection failed - using offline mode')
          setIsConnected(false)
          
          // Don't log full error to reduce console noise
          if (process.env.NODE_ENV === 'development') {
            console.log('Socket connection details:', {
              url: socketUrl,
              error: error.message
            })
          }
        })

        // Listen for notifications
        socketInstance.on('notification', (data: Notification) => {
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

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission()
        }

      } catch (error) {
        console.error('Failed to initialize socket:', error)
        setConnectionError('Failed to initialize socket connection')
      }
    }

    initializeSocket()

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [role])

  // Set initialization complete after mount
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  const clearNotifications = () => {
    setNotifications([])
  }

  // If socket is not connected after initialization, set a friendly message
  useEffect(() => {
    if (isInitialized && !isConnected && !connectionError) {
      setConnectionError('Offline mode - real-time features not available')
    }
  }, [isInitialized, isConnected, connectionError])

  return {
    socket: null,
    isConnected,
    connectionError,
    notifications,
    clearNotifications,
    isOfflineMode: isInitialized && !isConnected
  }
}
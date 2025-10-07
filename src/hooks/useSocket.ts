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

        console.log('Environment detection:', {
          isRemoteAccess,
          hostname: window.location?.hostname,
          protocol: window.location?.protocol,
          host: window.location?.host
        })

        // Socket.io configuration
        let socketUrl: string
        let socketOptions: any = {
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: isRemoteAccess ? 5 : 3,
          reconnectionDelay: 2000,
          timeout: 10000,
          withCredentials: false
        }

        if (isRemoteAccess) {
          // For remote access, try to use socket.io but with fallback
          socketUrl = `${window.location.protocol}//${window.location.host}/api/socketio`
          socketOptions.transports = ['polling'] // Only polling for remote
          socketOptions.upgrade = false
          socketOptions.rememberUpgrade = false
          
          console.log('Remote socket configuration:', { url: socketUrl })
          
          // Test if socket.io is available by making a simple request first
          try {
            const testResponse = await fetch(`${socketUrl}?EIO=4&transport=polling`, {
              method: 'GET',
              headers: {
                'Accept': 'text/plain',
                'Content-Type': 'text/plain'
              }
            })
            
            if (!testResponse.ok) {
              throw new Error('Socket.IO not available')
            }
            
            console.log('Socket.IO endpoint is accessible')
          } catch (testError) {
            console.log('Socket.IO not accessible, using mock mode')
            setConnectionError('Socket.IO not available in this environment')
            setIsConnected(false)
            return
          }
        } else {
          socketUrl = '/api/socketio'
          socketOptions.transports = ['websocket', 'polling']
          socketOptions.upgrade = true
          socketOptions.rememberUpgrade = true
          console.log('Local socket configuration:', { url: socketUrl })
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
          console.error('Socket connection error:', error.message)
          setConnectionError(error.message)
          setIsConnected(false)
          
          // Additional logging for remote access debugging
          if (isRemoteAccess) {
            console.log('Remote access detected - connection details:', {
              url: socketUrl,
              protocol: window.location.protocol,
              hostname: window.location.hostname,
              port: window.location.port,
              userAgent: navigator.userAgent
            })
            
            // Set fallback mode for remote access
            setConnectionError('Real-time features not available in this environment')
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

  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    socket: null,
    isConnected,
    connectionError,
    notifications,
    clearNotifications
  }
}
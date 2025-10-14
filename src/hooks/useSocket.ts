'use client'

import { socketManager } from '@/lib/socket-manager'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import { useCallback, useEffect, useRef, useState, useContext } from 'react'
import { SocketContext } from '@/contexts/socket-context'

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
  playNotificationSound: () => void
  toggleNotificationSound: () => void
  soundEnabled: boolean
  socketId: string
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
  const [socketId, setSocketId] = useState<string>('')
  const socketRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  
  // Get global socket from context (provider)
  const globalSocket = useContext(SocketContext)

  // Gunakan hook untuk manajemen suara notifikasi
  const {
    soundEnabled,
    playSound: playNotificationSound,
    toggleSound: toggleNotificationSound
  } = useNotificationSound()

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Send notification
  const sendNotification = useCallback(async (data: { type: string; message: string; room?: string }) => {
    if (!socketManager.isConnected()) {
      throw new Error('Socket not connected')
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        socketManager.emit('send-notification', {
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
    if (!socketManager.isConnected()) {
      throw new Error('Socket not connected')
    }
    
    return new Promise<void>((resolve, reject) => {
      try {
        socketManager.emit('heartbeat')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }, [])

  // Initialize socket connection
  const connectSocket = useCallback(async () => {
    // DEBUG: Log component mount state
    console.log('=== SOCKET HOOK DEBUG ===')
    console.log('Component mounting:', mountedRef.current)
    console.log('Using global socket from provider:', !!globalSocket)
    console.log('Role:', role)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Window location:', window.location.href)
    
    try {
      // Use global socket from provider (should already be connected)
      if (globalSocket) {
        console.log('Using global socket from provider:', globalSocket.id)
        socketRef.current = globalSocket
      } else {
        // Fallback to SocketManager if provider not available
        console.log('Provider socket not available, using SocketManager fallback...')
        const socketInstance = socketManager.getSocket()
        
        if (!socketInstance) {
          console.log('No socket found in SocketManager, connecting...')
          const newSocket = await socketManager.connect()
          socketRef.current = newSocket
        } else {
          console.log('Using existing socket from SocketManager:', socketInstance.id)
          socketRef.current = socketInstance
        }
      }
      
      if (!mountedRef.current) {
        console.log('Component unmounted during connection, cleaning up...')
        return
      }

      const activeSocket = socketRef.current
      if (!activeSocket) {
        console.error('No active socket after connection attempt')
        return
      }

      console.log('Socket ready for component:', activeSocket.id)
      
      // Join appropriate room based on role
      if (role === 'admin') {
        activeSocket.emit('join-admin')
        console.log('Joined admin room')
      } else {
        activeSocket.emit('join-user')
        console.log('Joined user room')
      }

      // Listen untuk notifikasi menggunakan SocketManager
      const handleNotification = (data: any) => {
        console.log('=== SOCKET NOTIFICATION EVENT ===');
        console.log('Raw notification data received:', data);
        console.log('Sound enabled status:', soundEnabled);
        console.log('Socket connected ID:', socketInstance?.id);
        console.log('Component mounted status:', mountedRef.current);
        
        if (data && data.judul && mountedRef.current) {
          console.log('Processing valid notification data...');
          setNotifications(prev => {
            console.log('Previous notifications:', prev);
            const updated = [data, ...prev];
            console.log('Updated notifications:', updated);
            return updated;
          });
          
          // Putar suara notifikasi jika diaktifkan
          if (soundEnabled) {
            console.log('Sound is enabled, attempting to play notification sound...');
            console.log('Calling playNotificationSound function');
            playNotificationSound();
            console.log('playNotificationSound function called');
          } else {
            console.log('Notification sound skipped - sound is disabled');
          }
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            console.log('Browser notification permission granted, showing notification...');
            new Notification(data.judul, {
              body: data.pesan,
              icon: '/favicon.ico'
            });
          } else {
            console.log('Browser notification not shown - permission status:', Notification.permission);
          }
        } else {
          console.log('Notification received but skipped:', {
            hasData: !!data,
            hasJudul: !!(data && data.judul),
            mounted: mountedRef.current,
            data: data
          });
        }
      };
      
      // Use SocketManager for event handling
      socketManager.on('notification', handleNotification);
      
      // Tambahkan logging untuk memastikan event listener terdaftar
      console.log('Notification event listener registered via SocketManager for socket:', activeSocket.id);

      // Listen untuk update status layanan
      socketManager.on('layanan-status-updated', (data: any) => {
        console.log('Layanan status updated:', data)
      })

      // Listen untuk update status laporan
      socketManager.on('laporan-status-updated', (data: any) => {
        console.log('Laporan status updated:', data)
      })

      // Listen untuk balasan baru
      socketManager.on('balasan-added', (data: any) => {
        console.log('Balasan added:', data)
      })

      // Listen untuk heartbeat response
      socketManager.on('heartbeat-response', (data: any) => {
        console.log('Heartbeat response:', data)
      })

      // Listen untuk connect/disconnect events
      socketManager.on('connect', () => {
        console.log('Socket connected via SocketManager:', socketInstance?.id)
        if (mountedRef.current) {
          setIsConnected(true)
          setConnectionError(null)
          setIsOfflineMode(false)
          setSocketId(socketInstance?.id || '')
        }
      })

      socketManager.on('disconnect', (reason) => {
        console.log('=== SOCKET DISCONNECT DEBUG ===')
        console.log('Disconnect reason:', reason)
        console.log('Socket ID:', socketInstance?.id)
        console.log('Component mounted:', mountedRef.current)
        console.log('Current URL:', window.location.href)
        console.log('Timestamp:', new Date().toISOString())
        console.log('Active element:', document.activeElement?.tagName)
        console.log('Document visibility:', document.visibilityState)
        
        if (mountedRef.current) {
          setIsConnected(false)
          // Don't set error for normal disconnects (like HMR)
          if (reason !== 'transport close') {
            setConnectionError(`Disconnected: ${reason}`)
          }
        }
      })

      socketManager.on('connect_error', (error: any) => {
        console.error('Socket connect error:', error)
        if (mountedRef.current) {
          setConnectionError(`Connection error: ${error.message}`)
          setIsConnected(false)
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
  }, [role, soundEnabled, playNotificationSound])

  // Initialize socket connection
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    mountedRef.current = true
    
    // Add delay to ensure SocketProvider has initialized and prevent rapid remounting
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        connectSocket()
      }
    }, 500) // Increased delay to prevent rapid remounting
    
    // Prevent rapid re-initialization
    const preventRapidRemount = setInterval(() => {
      if (mountedRef.current && !socketRef.current && socketManager.isConnected()) {
        console.log('useSocket: Socket exists but ref is null, fixing reference...')
        socketRef.current = socketManager.getSocket()
      }
    }, 1000)

    return () => {
      console.log('=== SOCKET HOOK CLEANUP DEBUG ===')
      console.log('Component unmounting...')
      console.log('Socket exists before cleanup:', !!socketRef.current)
      console.log('Socket connected before cleanup:', socketRef.current?.connected)
      console.log('Socket ID before cleanup:', socketRef.current?.id)
      console.log('Socket Manager Stats before cleanup:', socketManager.getStats())
      console.log('Timestamp:', new Date().toISOString())
      
      mountedRef.current = false
      
      // Clear any pending timeouts
      if (timeout) {
        clearTimeout(timeout)
      }
      clearInterval(preventRapidRemount)
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      // Remove event listeners from SocketManager (don't disconnect, let manager handle it)
      socketManager.off('notification')
      socketManager.off('layanan-status-updated')
      socketManager.off('laporan-status-updated')
      socketManager.off('balasan-added')
      socketManager.off('heartbeat-response')
      socketManager.off('connect')
      socketManager.off('disconnect')
      socketManager.off('connect_error')
      
      socketRef.current = null
      
      console.log('Hook cleanup completed - SocketManager still managing connection')
    }
  }, [connectSocket])

  // Handle hot reload - reconnect after HMR
  useEffect(() => {
    const handleHotReload = () => {
      console.log('Hot reload detected, but SocketManager should handle reconnection...')
      // Don't reconnect here - let SocketManager handle it
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
    isOfflineMode,
    playNotificationSound,
    toggleNotificationSound,
    soundEnabled,
    socketId
  }
}
'use client'

import { useContext, useMemo } from 'react'
import { SocketContext } from '@/contexts/socket-context'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import { useCallback, useEffect, useRef, useState } from 'react'
import { socketManager } from '@/lib/socket-manager'

interface Notification {
  id: number
  judul: string
  pesan: string
  tipe: string
  timestamp: string
}

interface UseGlobalSocketReturn {
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
 * Global Socket Hook - Stabil dan tidak menyebabkan unmount/mount
 * Menggunakan global socket dari provider dengan lifecycle yang stabil
 */
export function useGlobalSocket(role: 'user' | 'admin' = 'user'): UseGlobalSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [socketId, setSocketId] = useState<string>('')
  const socketRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const initializedRef = useRef(false)
  
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

  // Initialize socket connection - hanya sekali
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return
    initializedRef.current = true
    
    console.log('=== GLOBAL SOCKET HOOK INIT ===')
    console.log('Role:', role)
    console.log('Using global socket from provider:', !!globalSocket)
    console.log('Timestamp:', new Date().toISOString())
    
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
          console.log('No socket found, connecting...')
          socketManager.connect().then((socket) => {
            socketRef.current = socket
          }).catch(error => {
            console.error('Failed to connect:', error)
          })
        } else {
          console.log('Using existing socket from SocketManager:', socketInstance.id)
          socketRef.current = socketInstance
        }
      }

      const activeSocket = socketRef.current
      if (!activeSocket) return

      console.log('Global socket ready:', activeSocket.id)
      
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
        if (data && data.judul && mountedRef.current) {
          setNotifications(prev => [data, ...prev])
          
          // Putar suara notifikasi jika diaktifkan
          if (soundEnabled) {
            playNotificationSound()
          }
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(data.judul, {
              body: data.pesan,
              icon: '/favicon.ico'
            })
          }
        }
      };
      
      socketManager.on('notification', handleNotification)
      
      // Listen untuk connect/disconnect events
      socketManager.on('connect', () => {
        if (mountedRef.current) {
          setIsConnected(true)
          setConnectionError(null)
          setIsOfflineMode(false)
          setSocketId(globalSocket?.id || '')
        }
      })

      socketManager.on('disconnect', (reason) => {
        if (mountedRef.current) {
          setIsConnected(false)
          if (reason !== 'transport close') {
            setConnectionError(`Disconnected: ${reason}`)
          }
        }
      })

      socketManager.on('connect_error', (error: any) => {
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

    } catch (error) {
      console.error('Failed to initialize global socket:', error)
      if (mountedRef.current) {
        setConnectionError(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setIsConnected(false)
        setIsOfflineMode(true)
      }
    }
  }, [role, globalSocket, soundEnabled, playNotificationSound])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

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
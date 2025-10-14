/**
 * Global Socket Manager - Singleton Pattern
 * Mencegah multiple instance Socket.IO dan mengatasi HMR interference
 */

import { io, Socket } from 'socket.io-client'

interface SocketManagerInstance {
  socket: Socket | null
  isConnecting: boolean
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number
  listeners: Map<string, ((...args: any[]) => void)[]>
  lastConnectionAttempt: number
}

class SocketManager {
  private static instance: SocketManager
  private state: SocketManagerInstance
  private reconnectTimeout: NodeJS.Timeout | null = null

  private constructor() {
    this.state = {
      socket: null,
      isConnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      listeners: new Map(),
      lastConnectionAttempt: 0
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  /**
   * Connect to Socket.IO server
   */
  async connect(): Promise<Socket> {
    // Prevent multiple concurrent connections
    if (this.state.isConnecting) {
      console.log('SocketManager: Connection already in progress, waiting...')
      return this.waitForConnection()
    }

    // Return existing socket if already connected
    if (this.state.socket?.connected) {
      console.log('SocketManager: Already connected, returning existing socket')
      return this.state.socket
    }

    // Rate limit connection attempts
    const now = Date.now()
    if (now - this.state.lastConnectionAttempt < 1000) {
      console.log('SocketManager: Rate limiting connection attempt')
      throw new Error('Connection rate limited')
    }

    this.state.lastConnectionAttempt = now
    this.state.isConnecting = true

    try {
      console.log('=== SOCKET MANAGER CONNECT ===')
      console.log('SocketManager: Initializing connection...')
      console.log('URL:', window.location.origin)
      console.log('Path:', '/api/socket')
      console.log('Timestamp:', new Date().toISOString())

      // Disconnect existing socket if any
      if (this.state.socket) {
        this.state.socket.removeAllListeners()
        this.state.socket.disconnect()
        this.state.socket = null
      }

      // Create new socket connection
      this.state.socket = io(window.location.origin, {
        path: '/api/socket',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: false, // Disable auto-reconnect, we'll handle it manually
        withCredentials: false,
      })

      // Handle connection success
      this.state.socket.on('connect', () => {
        console.log('SocketManager: Connected successfully:', this.state.socket?.id)
        this.state.isConnecting = false
        this.state.reconnectAttempts = 0
        
        // Join default rooms
        this.state.socket?.emit('join-room', 'public')
        this.state.socket?.emit('join-room', 'admin')
        
        // Re-register all listeners
        this.reregisterListeners()
      })

      // Handle connection error
      this.state.socket.on('connect_error', (error) => {
        console.error('SocketManager: Connection error:', error)
        this.state.isConnecting = false
        this.state.reconnectAttempts++
        
        if (this.state.reconnectAttempts < this.state.maxReconnectAttempts) {
          this.scheduleReconnect()
        } else {
          console.error('SocketManager: Max reconnection attempts reached')
        }
      })

      // Handle disconnect
      this.state.socket.on('disconnect', (reason) => {
        console.log('=== SOCKET MANAGER DISCONNECT ===')
        console.log('SocketManager: Disconnected:', reason)
        console.log('Socket ID:', this.state.socket?.id)
        console.log('Reason:', reason)
        console.log('Timestamp:', new Date().toISOString())
        
        this.state.isConnecting = false
        
        // Attempt to reconnect if not a client-side disconnect or Fast Refresh
        if (reason !== 'io server disconnect') {
          this.scheduleReconnect()
        }
      })

      // Wait for connection
      return this.waitForConnection()

    } catch (error) {
      this.state.isConnecting = false
      console.error('SocketManager: Failed to connect:', error)
      throw error
    }
  }

  /**
   * Wait for connection to be established
   */
  private waitForConnection(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (!this.state.socket) {
        reject(new Error('No socket instance'))
        return
      }

      if (this.state.socket.connected) {
        resolve(this.state.socket)
        return
      }

      const timeout = setTimeout(() => {
        this.state.socket?.off('connect')
        this.state.socket?.off('connect_error')
        reject(new Error('Connection timeout'))
      }, 10000)

      const onConnect = () => {
        clearTimeout(timeout)
        resolve(this.state.socket!)
      }

      const onError = (error: any) => {
        clearTimeout(timeout)
        reject(error)
      }

      this.state.socket.once('connect', onConnect)
      this.state.socket.once('connect_error', onError)
    })
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.min(
      this.state.reconnectDelay * Math.pow(2, this.state.reconnectAttempts),
      5000
    )

    console.log(`SocketManager: Scheduling reconnect in ${delay}ms (attempt ${this.state.reconnectAttempts + 1})`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('SocketManager: Reconnect failed:', error)
      })
    }, delay)
  }

  /**
   * Re-register all event listeners after reconnection
   */
  private reregisterListeners(): void {
    if (!this.state.socket) return

    console.log('SocketManager: Re-registering listeners...')
    
    for (const [event, callbacks] of this.state.listeners) {
      for (const callback of callbacks) {
        this.state.socket.on(event, callback)
      }
    }
    
    console.log('SocketManager: Listeners re-registered')
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.state.socket?.connected ? this.state.socket : null
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state.socket?.connected || false
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (...args: any[]) => void): void {
    // Store callback for reconnection
    if (!this.state.listeners.has(event)) {
      this.state.listeners.set(event, [])
    }
    this.state.listeners.get(event)!.push(callback)

    // Add to current socket if connected
    if (this.state.socket?.connected) {
      this.state.socket.on(event, callback)
    }
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      // Remove from stored listeners
      const callbacks = this.state.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    } else {
      // Remove all listeners for event
      this.state.listeners.delete(event)
    }

    // Remove from current socket
    if (this.state.socket) {
      if (callback) {
        this.state.socket.off(event, callback)
      } else {
        this.state.socket.off(event)
      }
    }
  }

  /**
   * Emit event
   */
  emit(event: string, ...args: any[]): void {
    if (this.state.socket?.connected) {
      this.state.socket.emit(event, ...args)
    } else {
      console.warn('SocketManager: Cannot emit event - not connected')
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    console.log('=== SOCKET MANAGER CLEANUP ===')
    console.log('SocketManager: Disconnecting...')
    console.log('Connected:', this.isConnected())
    console.log('Socket ID:', this.state.socket?.id)
    console.log('Timestamp:', new Date().toISOString())

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.state.socket) {
      this.state.socket.removeAllListeners()
      this.state.socket.disconnect()
      this.state.socket = null
    }

    this.state.isConnecting = false
    this.state.reconnectAttempts = 0
    this.state.listeners.clear()

    console.log('SocketManager: Cleanup completed')
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      connected: this.isConnected(),
      connecting: this.state.isConnecting,
      reconnectAttempts: this.state.reconnectAttempts,
      socketId: this.state.socket?.id,
      listenerCount: Array.from(this.state.listeners.values()).reduce((sum, callbacks) => sum + callbacks.length, 0)
    }
  }
}

// Export singleton instance
export const socketManager = SocketManager.getInstance()
export default socketManager
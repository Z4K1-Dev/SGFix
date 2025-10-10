import { io, Socket } from 'socket.io-client'

/**
 * Socket Client Handler
 * Mengelola koneksi Socket.IO client untuk real-time communication
 */

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Menghubungkan ke Socket.IO server
   * @param token - Authentication token (optional untuk demo)
   */
  connect(token?: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      // Check if already connected
      if (this.socket?.connected) {
        console.log('Socket already connected:', this.socket.id)
        resolve(this.socket)
        return
      }

      // Gunakan URL dinamis dari current origin
      const socketUrl = window.location.origin

      console.log('Connecting to Socket.IO server:', socketUrl)
      console.log('Socket path:', '/api/socket')

      // Buat koneksi socket dengan HMR-safe configuration
      this.socket = io(socketUrl, {
        path: '/api/socket',
        addTrailingSlash: false,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        // Disable HMR interference
        autoConnect: true,
      })

      // Handle connection success
      this.socket.on('connect', () => {
        console.log('Connected to Socket.IO server:', this.socket?.id)
        this.reconnectAttempts = 0
        
        // Join rooms (untuk demo, join semua room)
        this.socket?.emit('join-room', 'public')
        this.socket?.emit('join-room', 'admin')
        
        resolve(this.socket!)
      })

      // Handle connection error
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.reconnectAttempts++
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached')
          reject(new Error('Failed to connect to Socket.IO server'))
        }
      })

      // Handle disconnect
      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.IO server:', reason)
        
        if (reason === 'io server disconnect') {
          // Server memutuskan koneksi, coba reconnect
          console.log('Attempting to reconnect...')
          this.socket?.connect()
        }
      })

      // Handle reconnect
      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts')
      })

      // Handle reconnect error
      this.socket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error)
      })
    })
  }

  /**
   * Memutuskan koneksi socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Mendapatkan instance socket
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Mengecek apakah socket terhubung
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Join room
   */
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-room', room)
    }
  }

  /**
   * Leave room
   */
  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-room', room)
    }
  }

  /**
   * Mengirim notifikasi
   */
  sendNotification(data: {
    type: string
    message: string
    room?: string
    data?: any
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('send-notification', data)
    }
  }

  /**
   * Update status layanan
   */
  updateLayananStatus(data: {
    layananId: string
    status: string
    room?: string
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('update-layanan-status', data)
    }
  }

  /**
   * Update status laporan
   */
  updateLaporanStatus(data: {
    laporanId: string
    status: string
    room?: string
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('update-laporan-status', data)
    }
  }

  /**
   * Mengirim balasan baru
   */
  sendBalasan(data: {
    type: 'layanan' | 'laporan'
    id: string
    balasan: any
    room?: string
  }): void {
    if (this.socket?.connected) {
      this.socket.emit('new-balasan', data)
    }
  }

  /**
   * Mengirim heartbeat
   */
  sendHeartbeat(): void {
    if (this.socket?.connected) {
      this.socket.emit('heartbeat')
    }
  }

  /**
   * Listen untuk notifikasi
   */
  onNotification(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('notification', callback)
    }
  }

  /**
   * Listen untuk update status layanan
   */
  onLayananStatusUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('layanan-status-updated', callback)
    }
  }

  /**
   * Listen untuk update status laporan
   */
  onLaporanStatusUpdated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('laporan-status-updated', callback)
    }
  }

  /**
   * Listen untuk balasan baru
   */
  onBalasanAdded(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('balasan-added', callback)
    }
  }

  /**
   * Listen untuk heartbeat response
   */
  onHeartbeatResponse(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('heartbeat-response', callback)
    }
  }

  /**
   * Remove listener
   */
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient()
export default socketClient
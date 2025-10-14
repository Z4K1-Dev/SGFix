/**
 * Utility untuk mengakses Socket.io instance dari API routes
 */
export const getSocketIO = () => {
  return (global as any).io
}

/**
 * Mengirim notifikasi realtime ke admin
 */
export const notifyAdmin = async (data: {
  judul: string;
  pesan: string;
  tipe: string;
  laporanId?: string;
  balasanId?: string;
}) => {
  const io = getSocketIO()
  if (io) {
    io.to('admin').emit('notification', {
      ...data,
      timestamp: new Date().toISOString()
    })
    
    // Also send balasan-added event for real-time updates
    if (data.laporanId && data.balasanId) {
      io.to('admin').emit('balasan-added', {
        type: 'laporan',
        id: data.laporanId,
        balasanId: data.balasanId,
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('Notification sent to admin room:', data)
  } else {
    console.error('Socket.IO not available for admin notification')
  }
}

/**
 * Mengirim notifikasi realtime ke user
 */
export const notifyUser = async (data: {
  judul: string;
  pesan: string;
  tipe: string;
  beritaId?: string;
  laporanId?: string;
  layananId?: string;
  balasanId?: string;
}) => {
  const io = getSocketIO()
  if (io) {
    // Send to public room (all users)
    io.to('public').emit('notification', {
      ...data,
      timestamp: new Date().toISOString()
    })
    
    // Also send balasan-added event for real-time updates
    if (data.laporanId && data.balasanId) {
      io.to('public').emit('balasan-added', {
        type: 'laporan',
        id: data.laporanId,
        balasanId: data.balasanId,
        timestamp: new Date().toISOString()
      })
    }
    
    // Send layanan-status-updated event for real-time updates
    if (data.layananId) {
      io.to('public').emit('layanan-status-updated', {
        layananId: data.layananId,
        tipe: data.tipe,
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('Notification sent to public room:', data)
  } else {
    console.error('Socket.IO not available for user notification')
  }
}
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
}) => {
  const io = getSocketIO()
  if (io) {
    io.to('admin').emit('notification', {
      ...data,
      timestamp: new Date().toISOString()
    })
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
}) => {
  const io = getSocketIO()
  if (io) {
    io.to('user').emit('notification', {
      ...data,
      timestamp: new Date().toISOString()
    })
  }
}
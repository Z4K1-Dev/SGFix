import { Server } from 'socket.io';
import { db } from '@/lib/db';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join room berdasarkan role
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log('Admin joined:', socket.id);
    });
    
    socket.on('join-user', () => {
      socket.join('user');
      console.log('User joined:', socket.id);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

/**
 * Mengirim notifikasi realtime ke admin
 */
export const notifyAdmin = async (io: Server, data: {
  judul: string;
  pesan: string;
  tipe: string;
  laporanId?: string;
}) => {
  io.to('admin').emit('notification', {
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Mengirim notifikasi realtime ke user
 */
export const notifyUser = async (io: Server, data: {
  judul: string;
  pesan: string;
  tipe: string;
  beritaId?: string;
  laporanId?: string;
}) => {
  io.to('user').emit('notification', {
    ...data,
    timestamp: new Date().toISOString()
  });
};
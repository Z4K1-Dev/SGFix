// server.ts - Next.js Standalone Server dengan Socket.IO
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

// Custom server untuk Next.js dengan Socket.IO
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: './.next' }
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer((req, res) => {
      // Add CORS headers for all requests
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Forwarded-For, X-Real-IP');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      // Let Next.js handle all requests
      handle(req, res);
    });

    // Setup Socket.IO server
    const io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: dev
          ? ['http://localhost:3000', 'https://preview-chat-af47107e-3f47-4194-b3a8-37b349a85b62.space.z.ai', '*']
          : ['https://preview-chat-63e78080-40b1-453f-b361-0564260db910.space.z.ai', '*.space.z.ai', '*'],
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For', 'X-Real-IP'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8, // 100 MB
      allowEIO3: true, // Support older versions of Engine.IO
    });

    // Socket connection handler
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Join room berdasarkan role (untuk demo, semua join public room)
      socket.join('public');
      socket.join('admin');
      
      // Handle join admin room
      socket.on('join-admin', () => {
        socket.join('admin');
        console.log(`Admin ${socket.id} joined admin room`);
      });
      
      // Handle join user room
      socket.on('join-user', () => {
        socket.join('user');
        console.log(`User ${socket.id} joined user room`);
      });
      
      // Handle koneksi real-time
      socket.on('join-room', (room: string) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
      });
      
      // Handle leave room
      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        console.log(`Client ${socket.id} left room: ${room}`);
      });
      
      // Handle notifikasi real-time
      socket.on('send-notification', (data: {
        type: string;
        message: string;
        room?: string;
        data?: any;
      }) => {
        console.log('Received send-notification event:', data);
        const targetRoom = data.room || 'public';
        const notification = {
          id: Date.now(),
          judul: `Notification (${data.type})`,
          pesan: data.message,
          tipe: data.type,
          data: data.data,
          timestamp: new Date().toISOString()
        };
        console.log('Sending notification to room:', targetRoom, notification);
        io.to(targetRoom).emit('notification', notification);
      });
      
      // Handle update status layanan
      socket.on('update-layanan-status', (data: {
        layananId: string;
        status: string;
        room?: string;
      }) => {
        const targetRoom = data.room || 'admin';
        io.to(targetRoom).emit('layanan-status-updated', {
          layananId: data.layananId,
          status: data.status,
          timestamp: new Date().toISOString()
        });
      });
      
      // Handle update status laporan
      socket.on('update-laporan-status', (data: {
        laporanId: string;
        status: string;
        room?: string;
      }) => {
        const targetRoom = data.room || 'admin';
        io.to(targetRoom).emit('laporan-status-updated', {
          laporanId: data.laporanId,
          status: data.status,
          timestamp: new Date().toISOString()
        });
      });
      
      // Handle balasan baru
      socket.on('new-balasan', (data: {
        type: 'layanan' | 'laporan';
        id: string;
        balasan: any;
        room?: string;
      }) => {
        const targetRoom = data.room || 'public';
        io.to(targetRoom).emit('balasan-added', {
          type: data.type,
          id: data.id,
          balasan: data.balasan,
          timestamp: new Date().toISOString()
        });
      });
      
      // Handle heartbeat untuk keep-alive
      socket.on('heartbeat', () => {
        socket.emit('heartbeat-response', {
          timestamp: new Date().toISOString()
        });
      });
      
      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });
      
      // Handle error
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });

    // Log socket.io connections
    io.engine.on('connection_error', (err) => {
      console.log('Socket.IO connection error:', err.req, err.code, err.message, err.context);
    });

    // Log when socket.io server is ready
    io.on('connection', (socket) => {
      console.log(`Socket.IO server: Client connected with ID ${socket.id}`);
    });

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socket`);
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
      console.log(`> Socket.IO path: /api/socket`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();

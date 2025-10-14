// server.ts - Next.js Standalone Server (tanpa Socket.IO)
import { createServer } from 'http';
import next from 'next';
import { Server as IOServer } from 'socket.io';



const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

// Custom server untuk Next.js
async function createCustomServer() {
  try {
    // Create Next.js app
    const nextApp = next({
      dev,
      dir: process.cwd(),
      // In production, use the current directory where .next is located
      conf: dev ? undefined : { distDir: '.next' }
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

    // Initialize Socket.IO server
    const io = new IOServer(server, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['*'],
        credentials: false,
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    });

    // Expose globally for API routes to use in tests/debug
    ;(globalThis as any).__io = io;

    io.on('connection', (socket) => {
      console.log('[socket] connected:', socket.id);

      socket.on('join-admin', () => {
        socket.join('admin');
        console.log(`[socket] ${socket.id} joined admin`);
      });

      socket.on('join-user', () => {
        socket.join('user');
        console.log(`[socket] ${socket.id} joined user`);
      });

      socket.on('join-room', (room: string) => {
        if (room) socket.join(room);
      });

      socket.on('leave-room', (room: string) => {
        if (room) socket.leave(room);
      });

      socket.on('heartbeat', () => {
        socket.emit('heartbeat-response', { ts: Date.now() });
      });

      socket.on('disconnect', (reason) => {
        console.log('[socket] disconnect:', socket.id, reason);
      });
    });


    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();

import { Server as NetServer } from 'http'
import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'

export const config = {
  runtime: 'nodejs',
}

// This is needed for the socket.io to work with Next.js
const SocketHandler = (req: NextRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      transports: ['polling'],
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-admin', () => {
        socket.join('admin')
        console.log('Admin joined room:', socket.id)
      })

      socket.on('join-user', () => {
        socket.join('user')
        console.log('User joined room:', socket.id)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  res.end()
}

export const GET = SocketHandler
export const POST = SocketHandler
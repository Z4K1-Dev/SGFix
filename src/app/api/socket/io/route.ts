import { Server as NetServer } from 'http'
import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'
import { setupSocket } from '@/lib/socket'

export const config = {
  runtime: 'nodejs',
}

export async function GET(req: NextRequest) {
  // This is a placeholder - socket.io setup is handled in server.ts
  return new Response('Socket.IO endpoint', { status: 200 })
}

export async function POST(req: NextRequest) {
  // This is a placeholder - socket.io setup is handled in server.ts
  return new Response('Socket.IO endpoint', { status: 200 })
}
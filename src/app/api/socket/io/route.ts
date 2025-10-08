import { Server as NetServer } from 'http'
import { NextRequest } from 'next/server'
import { Server as ServerIO } from 'socket.io'

export const config = {
  runtime: 'nodejs',
}

// This is needed for the socket.io to work with Next.js
export async function GET(req: NextRequest) {
  return new Response('Socket.IO endpoint', { status: 200 })
}

export async function POST(req: NextRequest) {
  return new Response('Socket.IO endpoint', { status: 200 })
}
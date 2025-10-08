import { NextRequest, NextResponse } from 'next/server'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Just return a simple response for the socket.io client
  // The actual socket.io server is handled in server.ts
  return NextResponse.json({ message: 'Socket.IO endpoint' })
}

export async function POST(req: NextRequest) {
  // Just return a simple response for the socket.io client
  // The actual socket.io server is handled in server.ts
  return NextResponse.json({ message: 'Socket.IO endpoint' })
}
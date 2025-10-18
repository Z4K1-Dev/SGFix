import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const room = body?.room || 'user'
    const type = body?.type || 'notification'
    const title = body?.title || 'Test Notif'
    const message = body?.message || 'Ini pesan percobaan'
    const status = body?.status || body?.newStatus
    const entity = body?.entity || body?.judul || body?.subject

    const io = (globalThis as any).__io as any | undefined
    if (!io) {
      return NextResponse.json(
        { ok: false, error: 'Socket.IO not initialized' },
        { status: 500 },
      )
    }

    // Build payload per type
    let eventName = type as string
    let payload: any
    switch (type) {
      case 'chat-reply':
        payload = { message, ts: Date.now() }
        break
      case 'pengaduan-status-changed':
        payload = { pengaduan: entity || 'Pengaduan', status: status || 'DIKERJAKAN', ts: Date.now() }
        break
      case 'layanan-status-changed':
        payload = { layanan: entity || 'Layanan', status: status || 'DIPROSES', ts: Date.now() }
        break
      default:
        eventName = 'notification'
        payload = { title, message, ts: Date.now() }
    }

    io.to(room).emit(eventName, payload)

    return NextResponse.json({ ok: true, room, event: eventName, payload })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function GET() {
  const io = (globalThis as any).__io as any | undefined
  const status = {
    initialized: !!io,
    sockets: io ? io.sockets.sockets.size : 0,
    rooms: io ? Array.from(io.sockets.adapter.rooms.keys()) : [],
  }
  return NextResponse.json({ ok: true, status })
}


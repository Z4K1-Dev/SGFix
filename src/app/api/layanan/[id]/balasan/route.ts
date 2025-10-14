import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Server } from 'socket.io'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findFirst({
      where: {
        id
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const balasan = await db.balasanLayanan.findMany({
      where: {
        layananId: id
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await db.balasanLayanan.count({
      where: {
        layananId: id
      }
    })

    return NextResponse.json({
      data: balasan,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching balasan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findFirst({
      where: {
        id
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    const body = await request.json()
    const { pesan } = body

    if (!pesan || !pesan.trim()) {
      return NextResponse.json(
        { error: 'Pesan wajib diisi' },
        { status: 400 }
      )
    }

    // Create balasan - untuk demo, tidak perlu userId
    const balasan = await db.balasanLayanan.create({
      data: {
        layananId: id,
        isi: pesan.trim(),
        dariAdmin: false
      }
    })

    // Create notification - untuk demo, tidak perlu userId
    const notifikasi = await db.notifikasi.create({
      data: {
        judul: `Balasan terkirim untuk ${layanan.judul}`,
        pesan: `Balasan: ${pesan.trim()}`,
        tipe: 'LAYANAN_BALASAN' as any,
        layananId: id
        // balasanId: balasan.id // Remove for now to avoid foreign key constraint
      }
    })

    // Send real-time notification via Socket.IO
    try {
      // Get Socket.IO server instance
      const { getSocketServer } = await import('@/lib/socket')
      const io: Server = getSocketServer()
      
      if (io) {
        // Send to admin room
        io.to('admin').emit('notification', {
          id: notifikasi.id,
          judul: notifikasi.judul,
          pesan: notifikasi.pesan,
          tipe: notifikasi.tipe,
          data: {
            layananId: id,
            balasanId: balasan.id,
            dariAdmin: false
          },
          timestamp: new Date().toISOString()
        })

        // Send balasan-added event for real-time updates
        io.to('admin').emit('balasan-added', {
          type: 'layanan',
          id: id,
          balasan: {
            id: balasan.id,
            isi: balasan.isi,
            dariAdmin: false,
            createdAt: balasan.createdAt
          },
          timestamp: new Date().toISOString()
        })

        console.log('Real-time notification sent for layanan balasan:', {
          layananId: id,
          balasanId: balasan.id,
          notifikasiId: notifikasi.id
        })
      }
    } catch (socketError) {
      console.error('Failed to send Socket.IO notification:', socketError)
      // Continue with response even if socket fails
    }

    return NextResponse.json({
      message: 'Balasan berhasil terkirim',
      data: balasan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating balasan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
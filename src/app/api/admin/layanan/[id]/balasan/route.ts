import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Server } from 'socket.io'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findUnique({
      where: { id }
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

    // Create admin balasan - untuk demo, tidak perlu userId
    const balasan = await db.balasanLayanan.create({
      data: {
        layananId: id,
        isi: pesan.trim(),
        dariAdmin: true
      }
    })

    // Create notification - untuk demo, tidak perlu userId
    const notifikasi = await db.notifikasi.create({
      data: {
        judul: `Ada balasan baru untuk ${layanan.judul}`,
        pesan: `Admin: ${pesan.trim()}`,
        tipe: 'LAYANAN_BALASAN' as any,
        layananId: id,
        // balasanId: balasan.id, // Remove for now to avoid foreign key constraint
        untukAdmin: false
      }
    })

    // Send real-time notification via Socket.IO
    try {
      // Get Socket.IO server instance
      const { getSocketServer } = await import('@/lib/socket')
      const io: Server = getSocketServer()
      
      if (io) {
        // Send to public room (users)
        io.to('public').emit('notification', {
          id: notifikasi.id,
          judul: notifikasi.judul,
          pesan: notifikasi.pesan,
          tipe: notifikasi.tipe,
          data: {
            layananId: id,
            balasanId: balasan.id,
            dariAdmin: true
          },
          timestamp: new Date().toISOString()
        })

        // Send balasan-added event for real-time updates
        io.to('public').emit('balasan-added', {
          type: 'layanan',
          id: id,
          balasan: {
            id: balasan.id,
            isi: balasan.isi,
            dariAdmin: true,
            createdAt: balasan.createdAt
          },
          timestamp: new Date().toISOString()
        })

        console.log('Real-time notification sent for admin layanan balasan:', {
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
    console.error('Error creating admin balasan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
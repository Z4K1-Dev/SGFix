import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Build-time check to prevent static generation
export const fetchCache = 'force-no-store'

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
    await db.notifikasi.create({
      data: {
        judul: `Ada balasan baru untuk ${layanan.judul}`,
        pesan: `Admin telah membalas pengajuan layanan Anda`,
        tipe: 'LAYANAN_BALASAN' as any,
        layananId: id
      }
    })

    // Emit realtime notification to user (admin sent reply)
    const io = (globalThis as any).__io
    if (io) {
      io.to('user').emit('chat-reply', {
        pesan: `Admin telah membalas pengajuan layanan "${layanan.judul}"`,
        layananId: id,
        ts: Date.now()
      })
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
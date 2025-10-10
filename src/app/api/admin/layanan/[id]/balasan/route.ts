import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Verify layanan exists
    const layanan = await db.layanan.findUnique({
      where: { id: params.id }
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

    // Create admin balasan
    const balasan = await db.balasanLayanan.create({
      data: {
        layananId: params.id,
        userId: user.id,
        pesan: pesan.trim(),
        isFromAdmin: true,
        isRead: false
      }
    })

    // Create notification for user
    await db.notifikasi.create({
      data: {
        userId: layanan.userId,
        judul: `Ada balasan baru untuk ${layanan.judul}`,
        pesan: `Admin telah membalas pengajuan layanan Anda`,
        tipe: 'LAYANAN_BALASAN',
        layananId: params.id
      }
    })

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
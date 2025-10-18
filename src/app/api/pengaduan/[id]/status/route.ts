import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Update status pengaduan
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status wajib diisi' },
        { status: 400 }
      )
    }

    const pengaduan = await db.pengaduan.update({
      where: { id },
      data: { status }
    })

    // Buat notifikasi untuk user
    await db.notifikasi.create({
      data: {
        judul: 'Status Pengaduan Diperbarui',
        pesan: `Status pengaduan "${pengaduan.judul}" telah diperbarui menjadi ${status}`,
        tipe: 'PENGADUAN_UPDATE',
        untukAdmin: false,
        pengaduanId: pengaduan.id
      }
    })

    // Emit realtime notification to user
    const io = (globalThis as any).__io
    if (io) {
      io.to('user').emit('pengaduan-status-changed', {
        pengaduan: pengaduan.judul,
        status: status,
        pengaduanId: pengaduan.id,
        ts: Date.now()
      })
    }


    return NextResponse.json(pengaduan)
  } catch (error) {
    console.error('Error updating pengaduan status:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui status pengaduan' },
      { status: 500 }
    )
  }
}
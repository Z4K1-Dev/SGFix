import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Update status laporan
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

    const laporan = await db.laporan.update({
      where: { id },
      data: { status }
    })

    // Buat notifikasi untuk user
    await db.notifikasi.create({
      data: {
        judul: 'Status Laporan Diperbarui',
        pesan: `Status laporan "${laporan.judul}" telah diperbarui menjadi ${status}`,
        tipe: 'LAPORAN_UPDATE',
        untukAdmin: false,
        laporanId: laporan.id
      }
    })

    // Emit realtime notification to user
    const io = (globalThis as any).__io
    if (io) {
      io.to('user').emit('laporan-status-changed', {
        laporan: laporan.judul,
        status: status,
        laporanId: laporan.id,
        ts: Date.now()
      })
    }


    return NextResponse.json(laporan)
  } catch (error) {
    console.error('Error updating laporan status:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui status laporan' },
      { status: 500 }
    )
  }
}
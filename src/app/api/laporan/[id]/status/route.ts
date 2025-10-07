import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/socket-utils'

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

    // Kirim notifikasi realtime ke user
    await notifyUser({
      judul: 'Status Laporan Diperbarui',
      pesan: `Status laporan "${laporan.judul}" telah diperbarui menjadi ${status}`,
      tipe: 'LAPORAN_UPDATE',
      laporanId: laporan.id
    })

    return NextResponse.json(laporan)
  } catch (error) {
    console.error('Error updating laporan status:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui status laporan' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Menghapus notifikasi berdasarkan ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Cek apakah notifikasi ada
    const existingNotifikasi = await db.notifikasi.findUnique({
      where: { id: id }
    })

    if (!existingNotifikasi) {
      return NextResponse.json(
        { error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.notifikasi.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ message: 'Notifikasi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting notifikasi:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus notifikasi' },
      { status: 500 }
    )
  }
}
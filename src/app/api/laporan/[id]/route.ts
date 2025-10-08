import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Mendapatkan detail laporan berdasarkan ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const laporan = await db.laporan.findUnique({
      where: {
        id: id
      },
      include: {
        balasan: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!laporan) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(laporan)
  } catch (error) {
    console.error('Error fetching laporan detail:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

/**
 * Update laporan (untuk perubahan status dll)
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
      where: {
        id: id
      },
      data: {
        status: status,
        updatedAt: new Date()
      },
      include: {
        balasan: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    return NextResponse.json(laporan)
  } catch (error) {
    console.error('Error updating laporan:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate laporan' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Mendapatkan detail pengaduan berdasarkan ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const pengaduan = await db.pengaduan.findUnique({
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

    if (!pengaduan) {
      return NextResponse.json(
        { error: 'Pengaduan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(pengaduan)
  } catch (error) {
    console.error('Error fetching pengaduan detail:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

/**
 * Update pengaduan (untuk perubahan status dll)
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

    return NextResponse.json(pengaduan)
  } catch (error) {
    console.error('Error updating pengaduan:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pengaduan' },
      { status: 500 }
    )
  }
}
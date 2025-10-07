import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const berita = await db.berita.findUnique({
      where: {
        id: id,
        published: true
      },
      include: {
        kategori: true
      }
    })

    if (!berita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(berita)
  } catch (error) {
    console.error('Error fetching berita detail:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
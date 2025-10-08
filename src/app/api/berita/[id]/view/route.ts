import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if berita exists
    const berita = await db.berita.findUnique({
      where: { id: id }
    })

    if (!berita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

    // Increment views
    await db.berita.update({
      where: { id: id },
      data: {
        views: {
          increment: 1
        }
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating views:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
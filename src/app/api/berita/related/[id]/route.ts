import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get the current berita to find its category
    const currentBerita = await db.berita.findUnique({
      where: { id: id },
      include: { kategori: true }
    })

    if (!currentBerita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get related berita (same category, excluding current)
    const relatedBerita = await db.berita.findMany({
      where: {
        id: { not: id },
        published: true,
        kategoriId: currentBerita.kategoriId
      },
      include: {
        kategori: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json(relatedBerita)
  } catch (error) {
    console.error('Error fetching related berita:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
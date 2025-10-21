import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { withCache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

/**
 * Mendapatkan daftar berita
 * Query parameters:
 * - published: boolean (filter berita yang sudah dipublish)
 * - kategoriId: string (filter berdasarkan kategori)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const kategoriId = searchParams.get('kategoriId')
    const limitParam = searchParams.get('limit')
    
    // Set default limit to 5 for prefetch, max 50
    const limit = Math.min(Math.max(parseInt(limitParam || '5', 10) || 5, 1), 50)

    const where: any = {}
    
    if (published === 'true') {
      where.published = true
    }
    
    if (kategoriId && kategoriId !== 'semua') {
      where.kategoriId = kategoriId
    }

    const berita = await db.berita.findMany({
      where,
      include: {
        kategori: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(berita)
  } catch (error) {
    console.error('Error fetching berita:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil berita' },
      { status: 500 }
    )
  }
}

/**
 * Membuat berita baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judul, isi, gambar, kategoriId, published = false } = body

    if (!judul || !isi || !kategoriId) {
      return NextResponse.json(
        { error: 'Judul, isi, dan kategoriId wajib diisi' },
        { status: 400 }
      )
    }

    const berita = await db.berita.create({
      data: {
        judul,
        isi,
        gambar,
        kategoriId,
        published
      },
      include: {
        kategori: true
      }
    })

    // Invalidate cache when new berita is created
    invalidateCachePattern('/api/berita')

    return NextResponse.json(berita, { status: 201 })
  } catch (error) {
    console.error('Error creating berita:', error)
    return NextResponse.json(
      { error: 'Gagal membuat berita' },
      { status: 500 }
    )
  }
}
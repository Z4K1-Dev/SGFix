import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { cache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

/**
 * Mendapatkan daftar pengaduan
 * Query parameters:
 * - limit: number (default 5, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    
    // Set default limit to 5 for prefetch, max 50
    const limit = Math.min(Math.max(parseInt(limitParam || '5', 10) || 5, 1), 50)

    const pengaduan = await db.pengaduan.findMany({
      include: {
        balasan: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json(pengaduan)
  } catch (error) {
    console.error('Error fetching pengaduan:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pengaduan' },
      { status: 500 }
    )
  }
}

/**
 * Membuat pengaduan baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judul, keterangan, foto, latitude, longitude } = body

    if (!judul || !keterangan) {
      return NextResponse.json(
        { error: 'Judul dan keterangan wajib diisi' },
        { status: 400 }
      )
    }

    const pengaduan = await db.pengaduan.create({
      data: {
        judul,
        keterangan,
        foto,
        latitude,
        longitude
      }
    })

    // Buat notifikasi untuk admin
    await db.notifikasi.create({
      data: {
        judul: 'Pengaduan Baru',
        pesan: `Pengaduan "${judul}" telah dibuat oleh masyarakat`,
        tipe: 'PENGADUAN_BARU',
        untukAdmin: true,
        pengaduanId: pengaduan.id
      }
    })


    // Invalidate cache when new pengaduan is created
    invalidateCachePattern('/api/pengaduan')

    return NextResponse.json(pengaduan, { status: 201 })
  } catch (error) {
    console.error('Error creating pengaduan:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengaduan' },
      { status: 500 }
    )
  }
}
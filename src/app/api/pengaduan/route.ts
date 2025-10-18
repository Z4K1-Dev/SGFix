import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { cache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

/**
 * Mendapatkan daftar pengaduan
 */
export async function GET() {
  try {
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
      }
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
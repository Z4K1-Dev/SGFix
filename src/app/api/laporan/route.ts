import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/socket-utils'
import { withCache, generateCacheKey, invalidateCachePattern } from '@/lib/cache'

/**
 * Mendapatkan daftar laporan
 */
export async function GET() {
  try {
    const cacheKey = generateCacheKey('/api/laporan')
    
    return withCache(cacheKey, async () => {
      const laporan = await db.laporan.findMany({
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

      return NextResponse.json(laporan)
    }, 1 * 60 * 1000) // 1 minute cache for reports
  } catch (error) {
    console.error('Error fetching laporan:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil laporan' },
      { status: 500 }
    )
  }
}

/**
 * Membuat laporan baru
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

    const laporan = await db.laporan.create({
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
        judul: 'Laporan Baru',
        pesan: `Laporan "${judul}" telah dibuat oleh masyarakat`,
        tipe: 'LAPORAN_BARU',
        untukAdmin: true,
        laporanId: laporan.id
      }
    })

    // Kirim notifikasi realtime ke admin
    await notifyAdmin({
      judul: 'Laporan Baru',
      pesan: `Laporan "${judul}" telah dibuat oleh masyarakat`,
      tipe: 'LAPORAN_BARU',
      laporanId: laporan.id
    })

    // Invalidate cache when new laporan is created
    invalidateCachePattern('/api/laporan')

    return NextResponse.json(laporan, { status: 201 })
  } catch (error) {
    console.error('Error creating laporan:', error)
    return NextResponse.json(
      { error: 'Gagal membuat laporan' },
      { status: 500 }
    )
  }
}
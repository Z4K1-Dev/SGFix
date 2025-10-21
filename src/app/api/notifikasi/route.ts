import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan daftar notifikasi
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const untukAdmin = searchParams.get('untukAdmin')
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    const page = Math.max(parseInt(pageParam || '1', 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(limitParam || '20', 10) || 20, 1), 100)
    const skip = (page - 1) * limit

    const where: any = {}
    if (untukAdmin !== null) {
      where.untukAdmin = untukAdmin === 'true'
    }

    const notifikasi = await db.notifikasi.findMany({
      where,
      include: {
        berita: { select: { judul: true } },
        pengaduan: { select: { judul: true } },
        balasan: { select: { isi: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return NextResponse.json(notifikasi)
  } catch (error) {
    console.error('Error fetching notifikasi:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil notifikasi' },
      { status: 500 }
    )
  }
}

/**
 * Membuat notifikasi baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { judul, pesan, tipe, untukAdmin = true } = body

    if (!judul || !pesan || !tipe) {
      return NextResponse.json(
        { error: 'Judul, pesan, dan tipe wajib diisi' },
        { status: 400 }
      )
    }

    // Validasi tipe notifikasi
    const validTypes = ['BERITA_BARU', 'BERITA_UPDATE', 'PENGADUAN_BARU', 'PENGADUAN_UPDATE', 'PENGADUAN_BALASAN', 'LAYANAN_BARU', 'LAYANAN_UPDATE', 'LAYANAN_BALASAN', 'INFO', 'BARU', 'UPDATE']
    if (!validTypes.includes(tipe)) {
      return NextResponse.json(
        { error: 'Tipe notifikasi tidak valid' },
        { status: 400 }
      )
    }

    const notifikasi = await db.notifikasi.create({
      data: {
        judul,
        pesan,
        tipe: typeof tipe === 'string' ? tipe as any : 'INFO',
        untukAdmin,
        dibaca: false
      }
    })

    return NextResponse.json(notifikasi, { status: 201 })
  } catch (error) {
    console.error('Error creating notifikasi:', error)
    return NextResponse.json(
      { error: 'Gagal membuat notifikasi' },
      { status: 500 }
    )
  }
}

/**
 * Menandai notifikasi sebagai dibaca
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'IDs notifikasi wajib diisi' },
        { status: 400 }
      )
    }

    await db.notifikasi.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        dibaca: true
      }
    })

    return NextResponse.json({ message: 'Notifikasi ditandai sebagai dibaca' })
  } catch (error) {
    console.error('Error updating notifikasi:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui notifikasi' },
      { status: 500 }
    )
  }
}
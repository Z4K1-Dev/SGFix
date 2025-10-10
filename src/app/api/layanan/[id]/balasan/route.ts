import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findFirst({
      where: {
        id: params.id
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const balasan = await db.balasanLayanan.findMany({
      where: {
        layananId: params.id
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await db.balasanLayanan.count({
      where: {
        layananId: params.id
      }
    })

    return NextResponse.json({
      data: balasan,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching balasan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findFirst({
      where: {
        id: params.id
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    const body = await request.json()
    const { pesan } = body

    if (!pesan || !pesan.trim()) {
      return NextResponse.json(
        { error: 'Pesan wajib diisi' },
        { status: 400 }
      )
    }

    // Create balasan - untuk demo, tidak perlu userId
    const balasan = await db.balasanLayanan.create({
      data: {
        layananId: params.id,
        isi: pesan.trim(),
        dariAdmin: false
      }
    })

    // Create notification - untuk demo, tidak perlu userId
    await db.notifikasi.create({
      data: {
        judul: `Balasan terkirim untuk ${layanan.judul}`,
        pesan: `Balasan Anda telah terkirim dan akan diproses oleh admin`,
        tipe: 'LAYANAN_BALASAN' as any,
        layananId: params.id
      }
    })

    return NextResponse.json({
      message: 'Balasan berhasil terkirim',
      data: balasan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating balasan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
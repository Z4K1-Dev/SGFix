import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { JenisLayanan, StatusLayanan } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Build-time check to prevent static generation
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jenis = searchParams.get('jenis')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    // Build where clause - untuk demo, tampilkan semua data tanpa auth
    const where: any = {}

    if (status && status !== 'SEMUA') {
      where.status = status as StatusLayanan
    }

    if (jenis && jenis !== 'SEMUA') {
      where.jenisLayanan = jenis as JenisLayanan
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { namaLengkap: { contains: search, mode: 'insensitive' } },
        { nik: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Check if db.layanan exists
    if (!db.layanan) {
      console.error('db.layanan is not defined. Database might not be connected properly.')
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    // Get total count
    const total = await db.layanan.count({ where })

    // Get layanan with pagination - untuk demo, tidak perlu include user
    const layanan = await db.layanan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            balasan: true
          }
        }
      }
    })

    // Check for unread admin replies - untuk demo, tidak perlu filter user
    const layananWithStats = await Promise.all(
      layanan.map(async (item) => {
        const unreadUserReplies = await db.balasanLayanan.count({
          where: {
            layananId: item.id,
            dariAdmin: false
          }
        })

        return {
          ...item,
          unreadUserReplies
        }
      })
    )

    return NextResponse.json({
      data: layananWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admin layanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { JenisLayanan, StatusLayanan } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jenis = searchParams.get('jenis')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    // Build where clause
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
        { nik: { contains: search, mode: 'insensitive' } },
        { user: { nama: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count
    const total = await db.layanan.count({ where })

    // Get layanan with pagination
    const layanan = await db.layanan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        },
        _count: {
          select: {
            balasan: true
          }
        }
      }
    })

    // Check for unread admin replies
    const layananWithStats = await Promise.all(
      layanan.map(async (item) => {
        const unreadUserReplies = await db.balasanLayanan.count({
          where: {
            layananId: item.id,
            isFromAdmin: false,
            isRead: false
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
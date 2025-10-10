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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jenis = searchParams.get('jenis')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      userId: user.id
    }

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

    // Get total count
    const total = await db.layanan.count({ where })

    // Get layanan with pagination
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

    // Check for unread replies
    const layananWithUnread = await Promise.all(
      layanan.map(async (item) => {
        const unreadCount = await db.balasanLayanan.count({
          where: {
            layananId: item.id,
            isFromAdmin: true,
            isRead: false
          }
        })

        return {
          ...item,
          hasUnreadReplies: unreadCount > 0
        }
      })
    )

    return NextResponse.json({
      data: layananWithUnread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching layanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      judul,
      jenisLayanan,
      namaLengkap,
      nik,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      agama,
      pekerjaan,
      statusPerkawinan,
      kewarganegaraan,
      alamat,
      rt,
      rw,
      kelurahan,
      kecamatan,
      kabupatenKota,
      provinsi,
      kodePos,
      noTelepon,
      email,
      dataSpesifik,
      dokumen
    } = body

    // Validate required fields
    if (!judul || !jenisLayanan || !namaLengkap || !nik || !alamat || !noTelepon || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate NIK format
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      return NextResponse.json(
        { error: 'Invalid NIK format' },
        { status: 400 }
      )
    }

    // Check if NIK already exists for active applications
    const existingLayanan = await db.layanan.findFirst({
      where: {
        nik,
        status: {
          in: ['BARU', 'DIPROSES', 'DIVERIFIKASI', 'DISETUJUI']
        }
      }
    })

    if (existingLayanan) {
      return NextResponse.json(
        { error: 'Pengajuan dengan NIK ini sudah ada dan sedang diproses' },
        { status: 400 }
      )
    }

    // Create layanan
    const layanan = await db.layanan.create({
      data: {
        userId: user.id,
        judul,
        jenisLayanan: jenisLayanan as JenisLayanan,
        status: StatusLayanan.BARU,
        namaLengkap,
        nik,
        tempatLahir,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        jenisKelamin,
        agama,
        pekerjaan,
        statusPerkawinan,
        kewarganegaraan,
        alamat,
        rt,
        rw,
        kelurahan,
        kecamatan,
        kabupatenKota,
        provinsi,
        kodePos,
        noTelepon,
        email,
        formData: dataSpesifik ? JSON.stringify(dataSpesifik) : '{}',
        dokumen: dokumen ? JSON.stringify(dokumen) : '{}'
      }
    })

    // Create notification
    await db.notifikasi.create({
      data: {
        userId: user.id,
        judul: `Layanan ${judul} berhasil diajukan`,
        pesan: `Pengajuan layanan ${jenisLayanan} Anda telah diterima dengan nomor: ${layanan.id}`,
        tipe: 'LAYANAN_BARU',
        layananId: layanan.id
      }
    })

    return NextResponse.json({
      message: 'Layanan berhasil diajukan',
      data: layanan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating layanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
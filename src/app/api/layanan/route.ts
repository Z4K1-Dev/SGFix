import { db } from '@/lib/db'
import { JenisLayanan, StatusLayanan } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jenis = searchParams.get('jenis')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    const search = searchParams.get('search')

    // Build where clause - untuk demo, tampilkan semua data
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

    // Check for unread replies - untuk demo, tidak perlu filter user
    const layananWithUnread = await Promise.all(
      layanan.map(async (item) => {
        const unreadCount = await db.balasanLayanan.count({
          where: {
            layananId: item.id,
            dariAdmin: true
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
    const body = await request.json()
    const {
      judul,
      jenisLayanan,
      namaLengkap,
      nik,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      rt,
      rw,
      kelurahan,
      kecamatan,
      kabupaten,
      provinsi,
      kodePos,
      telepon,
      email,
      dataSpesifik,
      dokumen
    } = body

    // Validate required fields
    if (!judul || !jenisLayanan || !namaLengkap || !nik || !alamat || !telepon || !email) {
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
          in: [StatusLayanan.DITERIMA, StatusLayanan.DITOLAK, StatusLayanan.DIPROSES, StatusLayanan.DIVERIFIKASI]
        }
      }
    })

    if (existingLayanan) {
      return NextResponse.json(
        { error: 'Pengajuan dengan NIK ini sudah ada dan sedang diproses' },
        { status: 400 }
      )
    }

    // Create layanan - untuk demo, tidak perlu userId
    const layanan = await db.layanan.create({
      data: {
        judul,
        jenisLayanan: jenisLayanan as JenisLayanan,
        status: StatusLayanan.DITERIMA,
        namaLengkap,
        nik,
        tempatLahir,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : new Date(),
        jenisKelamin,
        alamat,
        rt,
        rw,
        kelurahan,
        kecamatan,
        kabupaten,
        provinsi,
        kodePos,
        telepon,
        email,
        formData: dataSpesifik ? JSON.stringify(dataSpesifik) : '{}',
        dokumen: dokumen ? JSON.stringify(dokumen) : '{}'
      }
    })

    // Create notification - untuk demo, tidak perlu userId
    await db.notifikasi.create({
      data: {
        judul: `Layanan ${judul} berhasil diajukan`,
        pesan: `Pengajuan layanan ${jenisLayanan} Anda telah diterima dengan nomor: ${layanan.id}`,
        tipe: 'LAYANAN_BARU' as any,
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
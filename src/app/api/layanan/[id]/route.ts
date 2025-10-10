import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Untuk demo, tidak perlu auth - tampilkan semua layanan
    const layanan = await db.layanan.findFirst({
      where: {
        id: params.id
      },
      include: {
        balasan: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            balasan: true
          }
        }
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    // Mark admin replies as read - untuk demo, tidak perlu marking
    // await db.balasanLayanan.updateMany({
    //   where: {
    //     layananId: params.id,
    //     isFromAdmin: true,
    //     isRead: false
    //   },
    //   data: {
    //     isRead: true
    //   }
    // })

    return NextResponse.json({ data: layanan })
  } catch (error) {
    console.error('Error fetching layanan detail:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Untuk demo, tidak perlu auth - cari layanan berdasarkan ID saja
    const layanan = await db.layanan.findFirst({
      where: {
        id: params.id
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
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
      telepon,
      email
    } = body

    // Only allow updates for certain statuses
    if (!['BARU', 'DIPROSES'].includes(layanan.status)) {
      return NextResponse.json(
        { error: 'Cannot update layanan in current status' },
        { status: 400 }
      )
    }

    const updatedLayanan = await db.layanan.update({
      where: { id: params.id },
      data: {
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
        telepon,
        email,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Layanan berhasil diperbarui',
      data: updatedLayanan
    })
  } catch (error) {
    console.error('Error updating layanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Untuk demo, tidak perlu auth - cari layanan berdasarkan ID saja
    const layanan = await db.layanan.findFirst({
      where: {
        id: params.id
      }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    // Only allow deletion for certain statuses
    if (!['BARU', 'DITOLAK'].includes(layanan.status)) {
      return NextResponse.json(
        { error: 'Cannot delete layanan in current status' },
        { status: 400 }
      )
    }

    // Delete related balasan first
    await db.balasanLayanan.deleteMany({
      where: { layananId: params.id }
    })

    // Delete related notifications
    await db.notifikasi.deleteMany({
      where: { layananId: params.id }
    })

    // Delete layanan
    await db.layanan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Layanan berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting layanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { StatusLayanan } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Untuk demo, tidak perlu auth - tampilkan semua layanan
    const layanan = await db.layanan.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({ data: layanan })
  } catch (error) {
    console.error('Error fetching admin layanan detail:', error)
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
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findUnique({
      where: { id: params.id }
    })

    if (!layanan) {
      return NextResponse.json({ error: 'Layanan not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, catatan, alasanPenolakan, estimasiSelesai } = body

    if (!status || !Object.values(StatusLayanan).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Validate status transitions
    const validTransitions: Record<StatusLayanan, StatusLayanan[]> = {
      [StatusLayanan.BARU]: [StatusLayanan.DIPROSES, StatusLayanan.DITOLAK],
      [StatusLayanan.DIPROSES]: [StatusLayanan.DITAMPAH, StatusLayanan.DITOLAK],
      [StatusLayanan.DITAMPAH]: [StatusLayanan.DIKERJAKAN, StatusLayanan.DITOLAK],
      [StatusLayanan.DIKERJAKAN]: [StatusLayanan.SELESAI, StatusLayanan.DITOLAK],
      [StatusLayanan.SELESAI]: [],
      [StatusLayanan.DITOLAK]: [StatusLayanan.BARU] // Allow resubmission
    }

    if (!validTransitions[layanan.status].includes(status as StatusLayanan)) {
      return NextResponse.json(
        { error: 'Invalid status transition' },
        { status: 400 }
      )
    }

    // If rejecting, require reason
    if (status === StatusLayanan.DITOLAK && !alasanPenolakan) {
      return NextResponse.json(
        { error: 'Alasan penolakan wajib diisi' },
        { status: 400 }
      )
    }

    const updatedLayanan = await db.layanan.update({
      where: { id: params.id },
      data: {
        status: status as StatusLayanan,
        keterangan: catatan || alasanPenolakan || null,
        updatedAt: new Date()
      }
    })

    // Create notification - untuk demo, tidak perlu userId
    let notifikasiTitle = ''
    let notifikasiMessage = ''
    let notifikasiType = ''

    switch (status) {
      case StatusLayanan.DIPROSES:
        notifikasiTitle = `Layanan ${layanan.judul} sedang diproses`
        notifikasiMessage = `Pengajuan layanan Anda sedang dalam proses verifikasi`
        notifikasiType = 'LAYANAN_PROSES'
        break
      case StatusLayanan.DITAMPAH:
        notifikasiTitle = `Layanan ${layanan.judul} ditahan`
        notifikasiMessage = `Pengajuan layanan Anda ditahan sementara`
        notifikasiType = 'LAYANAN_DITAMPAH'
        break
      case StatusLayanan.DIKERJAKAN:
        notifikasiTitle = `Layanan ${layanan.judul} sedang dikerjakan`
        notifikasiMessage = `Pengajuan layanan Anda sedang diproses`
        notifikasiType = 'LAYANAN_DIKERJAKAN'
        break
      case StatusLayanan.SELESAI:
        notifikasiTitle = `Layanan ${layanan.judul} selesai`
        notifikasiMessage = `Layanan Anda telah selesai diproses dan dapat diambil`
        notifikasiType = 'LAYANAN_SELESAI'
        break
      case StatusLayanan.DITOLAK:
        notifikasiTitle = `Layanan ${layanan.judul} ditolak`
        notifikasiMessage = `Pengajuan layanan Anda ditolak. Alasan: ${alasanPenolakan}`
        notifikasiType = 'LAYANAN_DITOLAK'
        break
    }

    // Create notification - untuk demo, tidak perlu userId
    // await db.notifikasi.create({
    //   data: {
    //     judul: notifikasiTitle,
    //     pesan: notifikasiMessage,
    //     tipe: notifikasiType as any,
    //     untukAdmin: false,
    //     layananId: params.id
    //   }
    // })

    return NextResponse.json({
      message: 'Status layanan berhasil diperbarui',
      data: updatedLayanan
    })
  } catch (error) {
    console.error('Error updating admin layanan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
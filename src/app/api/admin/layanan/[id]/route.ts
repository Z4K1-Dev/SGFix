import { db } from '@/lib/db'
import { StatusLayanan } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Build-time check to prevent static generation
export const fetchCache = 'force-no-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Untuk demo, tidak perlu auth - tampilkan semua layanan
    const layanan = await db.layanan.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Untuk demo, tidak perlu auth - verifikasi layanan exists
    const layanan = await db.layanan.findUnique({
      where: { id }
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
      [StatusLayanan.DITERIMA]: [StatusLayanan.DIPROSES, StatusLayanan.DITOLAK],
      [StatusLayanan.DIPROSES]: [StatusLayanan.DIVERIFIKASI, StatusLayanan.DITOLAK],
      [StatusLayanan.DIVERIFIKASI]: [StatusLayanan.SELESAI, StatusLayanan.DITOLAK],
      [StatusLayanan.SELESAI]: [],
      [StatusLayanan.DITOLAK]: [StatusLayanan.DITERIMA] // Allow resubmission
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
      where: { id },
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
      case StatusLayanan.DITERIMA:
        notifikasiTitle = `Layanan ${layanan.judul} diterima`
        notifikasiMessage = `Pengajuan layanan Anda telah diterima dan akan diproses`
        notifikasiType = 'LAYANAN_DITERIMA'
        break
      case StatusLayanan.DIPROSES:
        notifikasiTitle = `Layanan ${layanan.judul} diproses`
        notifikasiMessage = `Pengajuan layanan Anda sedang dalam proses`
        notifikasiType = 'LAYANAN_DIPROSES'
        break
      case StatusLayanan.DIVERIFIKASI:
        notifikasiTitle = `Layanan ${layanan.judul} diverifikasi`
        notifikasiMessage = `Pengajuan layanan Anda sedang diverifikasi`
        notifikasiType = 'LAYANAN_DIVERIFIKASI'
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
    await db.notifikasi.create({
      data: {
        judul: notifikasiTitle,
        pesan: notifikasiMessage,
        tipe: notifikasiType as any,
        untukAdmin: false,
        layananId: id
      }
    })

    // Emit realtime notification to user
    const io = (globalThis as any).__io
    if (io) {
      io.to('user').emit('layanan-status-changed', {
        layanan: layanan.judul,
        status: status,
        layananId: id,
        ts: Date.now()
      })
    }

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
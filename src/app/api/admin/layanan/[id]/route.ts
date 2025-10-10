import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { StatusLayanan } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const layanan = await db.layanan.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            noTelepon: true
          }
        },
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
      [StatusLayanan.DIPROSES]: [StatusLayanan.DIVERIFIKASI, StatusLayanan.DITOLAK],
      [StatusLayanan.DIVERIFIKASI]: [StatusLayanan.DISETUJUI, StatusLayanan.DITOLAK],
      [StatusLayanan.DISETUJUI]: [StatusLayanan.SELESAI],
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
        catatan,
        alasanPenolakan: status === StatusLayanan.DITOLAK ? alasanPenolakan : null,
        estimasiSelesai,
        updatedAt: new Date()
      }
    })

    // Create notification for user
    let notifikasiTitle = ''
    let notifikasiMessage = ''
    let notifikasiType = ''

    switch (status) {
      case StatusLayanan.DIPROSES:
        notifikasiTitle = `Layanan ${layanan.judul} sedang diproses`
        notifikasiMessage = `Pengajuan layanan Anda sedang dalam proses verifikasi`
        notifikasiType = 'LAYANAN_PROSES'
        break
      case StatusLayanan.DIVERIFIKASI:
        notifikasiTitle = `Layanan ${layanan.judul} sedang diverifikasi`
        notifikasiMessage = `Data Anda sedang diverifikasi oleh petugas`
        notifikasiType = 'LAYANAN_VERIFIKASI'
        break
      case StatusLayanan.DISETUJUI:
        notifikasiTitle = `Layanan ${layanan.judul} disetujui`
        notifikasiMessage = `Pengajuan layanan Anda telah disetujui`
        notifikasiType = 'LAYANAN_DISETUJUI'
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

    await db.notifikasi.create({
      data: {
        userId: layanan.userId,
        judul: notifikasiTitle,
        pesan: notifikasiMessage,
        tipe: notifikasiType,
        layananId: params.id
      }
    })

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
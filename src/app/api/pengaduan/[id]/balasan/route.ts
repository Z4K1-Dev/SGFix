import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Menambahkan balasan pada pengaduan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isi, dariAdmin = false } = body

    if (!isi) {
      return NextResponse.json(
        { error: 'Isi balasan wajib diisi' },
        { status: 400 }
      )
    }

    // Ambil data pengaduan untuk notifikasi
    const pengaduan = await db.pengaduan.findUnique({
      where: { id }
    })

    if (!pengaduan) {
      return NextResponse.json(
        { error: 'Pengaduan tidak ditemukan' },
        { status: 404 }
      )
    }

    const balasan = await db.balasan.create({
      data: {
        pengaduanId: id,
        isi,
        dariAdmin
      }
    })

    // Buat notifikasi
    if (dariAdmin) {
      // Notifikasi ke user
      await db.notifikasi.create({
        data: {
          judul: 'Balasan dari Admin',
          pesan: `Admin telah membalas pengaduan "${pengaduan.judul}"`,
          tipe: 'PENGADUAN_BALASAN',
          untukAdmin: false,
          pengaduanId: id,
          balasanId: balasan.id
        }
      })

      // Emit realtime notification to user
      const io = (globalThis as any).__io
      if (io) {
        io.to('user').emit('chat-reply', {
          pesan: `Admin telah membalas pengaduan "${pengaduan.judul}"`,
          pengaduanId: id,
          ts: Date.now()
        })
      }

    } else {
      // Notifikasi ke admin
      await db.notifikasi.create({
        data: {
          judul: 'Balasan Baru dari Masyarakat',
          pesan: `Ada balasan baru pada pengaduan "${pengaduan.judul}"`,
          tipe: 'PENGADUAN_BALASAN',
          untukAdmin: true,
          pengaduanId: id,
          balasanId: balasan.id
        }
      })

      // Emit realtime notification to admin
      const io = (globalThis as any).__io
      if (io) {
        io.to('admin').emit('chat-reply', {
          pesan: `Ada balasan baru pada pengaduan "${pengaduan.judul}"`,
          pengaduanId: id,
          ts: Date.now()
        })
      }

    }

    return NextResponse.json(balasan, { status: 201 })
  } catch (error) {
    console.error('Error creating balasan:', error)
    return NextResponse.json(
      { error: 'Gagal membuat balasan' },
      { status: 500 }
    )
  }
}
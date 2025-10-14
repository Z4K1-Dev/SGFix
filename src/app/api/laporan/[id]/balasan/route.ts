import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Menambahkan balasan pada laporan
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

    // Ambil data laporan untuk notifikasi
    const laporan = await db.laporan.findUnique({
      where: { id }
    })

    if (!laporan) {
      return NextResponse.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 }
      )
    }

    const balasan = await db.balasan.create({
      data: {
        laporanId: id,
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
          pesan: `Admin telah membalas laporan "${laporan.judul}"`,
          tipe: 'LAPORAN_BALASAN',
          untukAdmin: false,
          laporanId: id,
          balasanId: balasan.id
        }
      })

      // Emit realtime notification to user
      const io = (globalThis as any).__io
      if (io) {
        io.to('user').emit('chat-reply', {
          pesan: `Admin telah membalas laporan "${laporan.judul}"`,
          laporanId: id,
          ts: Date.now()
        })
      }

    } else {
      // Notifikasi ke admin
      await db.notifikasi.create({
        data: {
          judul: 'Balasan Baru dari Masyarakat',
          pesan: `Ada balasan baru pada laporan "${laporan.judul}"`,
          tipe: 'LAPORAN_BALASAN',
          untukAdmin: true,
          laporanId: id,
          balasanId: balasan.id
        }
      })

      // Emit realtime notification to admin
      const io = (globalThis as any).__io
      if (io) {
        io.to('admin').emit('chat-reply', {
          pesan: `Ada balasan baru pada laporan "${laporan.judul}"`,
          laporanId: id,
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
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan kategori berdasarkan ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const kategori = await db.kategori.findUnique({
      where: {
        id: id
      }
    })

    if (!kategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error fetching kategori:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil kategori' },
      { status: 500 }
    )
  }
}

/**
 * Memperbarui kategori
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nama, deskripsi } = body

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah kategori ada
    const existingKategori = await db.kategori.findUnique({
      where: { id: id }
    })

    if (!existingKategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    const kategori = await db.kategori.update({
      where: {
        id: id
      },
      data: {
        nama,
        deskripsi
      }
    })

    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error updating kategori:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori' },
      { status: 500 }
    )
  }
}

/**
 * Menghapus kategori
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Cek apakah kategori ada
    const existingKategori = await db.kategori.findUnique({
      where: { id: id }
    })

    if (!existingKategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah kategori digunakan oleh berita
    const beritaCount = await db.berita.count({
      where: {
        kategoriId: id
      }
    })

    if (beritaCount > 0) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus kategori karena digunakan oleh ${beritaCount} berita` },
        { status: 400 }
      )
    }

    await db.kategori.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ message: 'Kategori berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting kategori:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    )
  }
}
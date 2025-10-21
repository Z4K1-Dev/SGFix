import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const berita = await db.berita.findUnique({
      where: {
        id: id
      },
      include: {
        kategori: true
      }
    })

    if (!berita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(berita)
  } catch (error) {
    console.error('Error fetching berita detail:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
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
    const body = await request.json()
    
    const { judul, isi, gambar, kategoriId, published } = body

    // Validasi input
    if (!judul || !isi || !kategoriId) {
      return NextResponse.json(
        { error: 'Judul, isi, dan kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Periksa apakah berita ada
    const existingBerita = await db.berita.findUnique({
      where: { id }
    })

    if (!existingBerita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

    // Periksa apakah kategori ada
    const kategori = await db.kategori.findUnique({
      where: { id: kategoriId }
    })

    if (!kategori) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update berita
    const updatedBerita = await db.berita.update({
      where: { id },
      data: {
        judul,
        isi,
        gambar: gambar || null,
        kategoriId,
        published
      },
      include: {
        kategori: true
      }
    })

    return NextResponse.json(updatedBerita)
  } catch (error) {
    console.error('Error updating berita:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Periksa apakah berita ada
    const existingBerita = await db.berita.findUnique({
      where: { id }
    })

    if (!existingBerita) {
      return NextResponse.json(
        { error: 'Berita tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hapus berita
    await db.berita.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Berita berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting berita:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
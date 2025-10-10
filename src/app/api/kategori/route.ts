import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Mendapatkan daftar kategori
 */
export async function GET() {
  try {
    const kategori = await db.kategori.findMany({
      orderBy: {
        nama: 'asc'
      }
    })

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
 * Membuat kategori baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, deskripsi } = body

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    const kategori = await db.kategori.create({
      data: {
        nama,
        deskripsi
      }
    })

    return NextResponse.json(kategori, { status: 201 })
  } catch (error) {
    console.error('Error creating kategori:', error)
    return NextResponse.json(
      { error: 'Gagal membuat kategori' },
      { status: 500 }
    )
  }
}
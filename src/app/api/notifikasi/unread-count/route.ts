import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const untukAdmin = searchParams.get('untukAdmin')

    const where: any = { dibaca: false }
    if (untukAdmin !== null) {
      where.untukAdmin = untukAdmin === 'true'
    }

    const unread = await db.notifikasi.count({ where })
    return NextResponse.json({ unread })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json({ error: 'Gagal mengambil jumlah notifikasi belum dibaca' }, { status: 500 })
  }
}


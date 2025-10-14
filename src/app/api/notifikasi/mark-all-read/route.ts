import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as any
    const untukAdmin: boolean | undefined = typeof body.untukAdmin === 'boolean' ? body.untukAdmin : undefined

    const where: any = {}
    if (typeof untukAdmin === 'boolean') {
      where.untukAdmin = untukAdmin
    }

    await db.notifikasi.updateMany({ where, data: { dibaca: true } })
    return NextResponse.json({ message: 'Semua notifikasi ditandai sebagai dibaca' })
  } catch (error) {
    console.error('Error mark all read:', error)
    return NextResponse.json({ error: 'Gagal menandai semua notifikasi' }, { status: 500 })
  }
}


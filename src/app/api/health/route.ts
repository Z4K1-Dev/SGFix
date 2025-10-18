import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`
    
    // Check if tables exist
    const tables = await db.$queryRaw`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ('Layanan', 'BalasanLayanan', 'Kategori', 'Berita', 'Pengaduan', 'Balasan')
    `
    
    // Check Prisma models
    const models = {
      layanan: !!db.layanan,
      balasanLayanan: !!db.balasanLayanan,
      kategori: !!db.kategori,
      berita: !!db.berita,
      pengaduan: !!db.pengaduan,
      balasan: !!db.balasan
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      tables,
      models,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
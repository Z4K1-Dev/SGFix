import { NextResponse } from 'next/server'
import { seedData } from '@/lib/seed'

/**
 * Seed data default untuk aplikasi
 */
export async function POST() {
  try {
    await seedData()
    return NextResponse.json({ message: 'Data seeded successfully' })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Gagal melakukan seed data' },
      { status: 500 }
    )
  }
}
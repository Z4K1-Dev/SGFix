import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const pesanan = await db.pesanan.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(pesanan);
  } catch (error) {
    console.error('Error updating pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pesanan' },
      { status: 500 }
    );
  }
}
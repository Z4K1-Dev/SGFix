import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const pesanan = await db.pesanan.findMany({
      include: {
        produk: {
          include: {
            kategori: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(pesanan);
  } catch (error) {
    console.error('Error fetching pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { produkId, jumlah, total, nama, nomorWA, pesan } = body;

    const pesanan = await db.pesanan.create({
      data: {
        produkId,
        jumlah: jumlah || 1,
        total,
        nama,
        nomorWA,
        pesan,
        status: 'BARU'
      }
    });

    return NextResponse.json(pesanan, { status: 201 });
  } catch (error) {
    console.error('Error creating pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    );
  }
}
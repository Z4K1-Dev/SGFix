import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {  
  const data = [];

  try {
    return NextResponse.json({
      success: true,
      data: data,
      total: data.length
    });
  } catch (error) {
    console.error('Error fetching aktivitas:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data aktivitas' },
      { status: 500 }
    );
  }
}  

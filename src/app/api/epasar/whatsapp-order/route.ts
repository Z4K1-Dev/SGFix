import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ZAI } from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity, customerInfo } = await request.json();

    // Validasi input
    if (!productId || !quantity || !customerInfo) {
      return NextResponse.json(
        { error: 'Data pesanan tidak lengkap' },
        { status: 400 }
      );
    }

    // Ambil data produk
    const produk = await db.produk.findUnique({
      where: { id: productId },
      include: { kategori: true }
    });

    if (!produk) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Generate pesan WhatsApp
    const pesanWhatsApp = generateWhatsAppMessage(produk, quantity, customerInfo);

    // Generate QR Code untuk WhatsApp
    const qrCodeUrl = generateWhatsAppQR(pesanWhatsApp);

    // Simpan pesanan ke database
    const pesanan = await db.pesanan.create({
      data: {
        produkId: productId,
        jumlah: quantity,
        totalHarga: produk.harga * quantity,
        namaPelanggan: customerInfo.nama,
        teleponPelanggan: customerInfo.telepon,
        alamatPengiriman: customerInfo.alamat,
        catatan: customerInfo.catatan,
        status: 'MENUNGGU_PEMBAYARAN'
      }
    });

    return NextResponse.json({
      success: true,
      pesanan,
      whatsappUrl: `https://wa.me/628123456789?text=${encodeURIComponent(pesanWhatsApp)}`,
      qrCodeUrl,
      pesanWhatsApp
    });

  } catch (error) {
    console.error('WhatsApp order error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses pesanan' },
      { status: 500 }
    );
  }
}

function generateWhatsAppMessage(produk: any, quantity: number, customerInfo: any) {
  const totalHarga = produk.harga * quantity;
  
  return `🛒 *PESANAN BARU - SMARTGOV E-PASAR*

📦 *Detail Produk:*
• Nama: ${produk.nama}
• Kategori: ${produk.kategori.nama}
• Harga: Rp ${produk.harga.toLocaleString('id-ID')}
• Jumlah: ${quantity}
• Total: Rp ${totalHarga.toLocaleString('id-ID')}

👤 *Data Pelanggan:*
• Nama: ${customerInfo.nama}
• Telepon: ${customerInfo.telepon}
• Alamat: ${customerInfo.alamat}

📝 *Catatan:*
${customerInfo.catatan || 'Tidak ada'}

🚚 *Status:* Menunggu konfirmasi pembayaran

Terima kasih telah berbelanja di SmartGov e-Pasar!`;
}

function generateWhatsAppQR(message: string) {
  // Generate QR Code URL (gunakan API eksternal atau library)
  const whatsappUrl = `https://wa.me/628123456789?text=${encodeURIComponent(message)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}`;
}
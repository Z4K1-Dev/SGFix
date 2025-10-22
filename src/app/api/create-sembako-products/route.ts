import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if Sembako category exists
    let sembakoCategory = await db.kategoriProduk.findFirst({
      where: { nama: 'Sembako' }
    });

    // Create Sembako category if it doesn't exist
    if (!sembakoCategory) {
      sembakoCategory = await db.kategoriProduk.create({
        data: {
          nama: 'Sembako',
          deskripsi: 'Kategori produk kebutuhan pokok sehari-hari',
          icon: '🛒'
        }
      });
    }

    // Define the 3 dummy products
    const products = [
      {
        judul: 'Beras Premium Kualitas Terbaik',
        deskripsi: 'Beras premium pilihan dengan kualitas terbaik, pulen, wangi, dan tidak mudah hancur. Cocok untuk kebutuhan sehari-hari dan acara spesial. Dikemas secara higienis untuk menjaga kualitas.',
        harga: 15000,
        stok: 100,
        kategoriId: sembakoCategory.id,
        gambar: JSON.stringify(['/images/produk/beras-premium.jpg']),
        status: 'ACTIVE',
        dariAdmin: true
      },
      {
        judul: 'Minyak Goreng Botolan',
        deskripsi: 'Minyak goreng berkualitas tinggi, jernih, dan tidak berbau. Mengandung vitamin E yang baik untuk kesehatan. Kemasan botol yang praktis dan mudah digunakan.',
        harga: 25000,
        stok: 50,
        kategoriId: sembakoCategory.id,
        gambar: JSON.stringify(['/images/produk/minyak-goreng.jpg']),
        status: 'ACTIVE',
        dariAdmin: true
      },
      {
        judul: 'Gula Pasir Premium',
        deskripsi: 'Gula pasir premium dengan kristal yang sempurna, putih bersih, dan mudah larut. Cocok untuk minuman, masakan, dan kue. Dikemas dalam kemasan yang praktis dan higienis.',
        harga: 18000,
        stok: 75,
        kategoriId: sembakoCategory.id,
        gambar: JSON.stringify(['/images/produk/gula-pasir.jpg']),
        status: 'ACTIVE',
        dariAdmin: true
      }
    ];

    // Create the products
    const createdProducts = await db.produk.createMany({
      data: products,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully created Sembako category and 3 dummy products',
      categoryId: sembakoCategory.id,
      productsCreated: createdProducts.count,
      products: products.map(p => ({
        ...p,
        kategoriId: sembakoCategory.id
      }))
    });

  } catch (error) {
    console.error('Error creating Sembako products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
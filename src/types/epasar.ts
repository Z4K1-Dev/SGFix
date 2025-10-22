// Types for e-Pasar system

export interface Produk {
  id: string;
  judul: string;
  deskripsi: string;
  harga: number;
  stok: number;
  kategoriId: string;
  gambar: string[];
  status: string;
  dariAdmin: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  kategori: {
    id: string;
    nama: string;
    deskripsi: string;
    icon?: string;
  };
}

export interface KategoriProduk {
  id: string;
  nama: string;
  deskripsi: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}
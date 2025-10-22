'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  QrCode, 
  Copy, 
  Check,
  Truck,
  Shield,
  Clock
} from 'lucide-react';
import { Produk } from '@/types/epasar';
import { toast } from 'sonner';

interface OrderModalProps {
  produk: Produk | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerInfo {
  nama: string;
  telepon: string;
  alamat: string;
  catatan: string;
}

interface WhatsAppOrderData {
  success: boolean;
  pesanan: any;
  whatsappUrl: string;
  qrCodeUrl: string;
  pesanWhatsApp: string;
}

export default function OrderModal({ produk, isOpen, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    nama: '',
    telepon: '',
    alamat: '',
    catatan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderData, setOrderData] = useState<WhatsAppOrderData | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setQuantity(1);
    setCustomerInfo({
      nama: '',
      telepon: '',
      alamat: '',
      catatan: ''
    });
    setOrderData(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!produk) return;

    // Validasi
    if (!customerInfo.nama || !customerInfo.telepon || !customerInfo.alamat) {
      toast.error('Mohon lengkapi data pelanggan');
      return;
    }

    if (quantity > produk.stok) {
      toast.error('Jumlah pesanan melebihi stok tersedia');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/epasar/whatsapp-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: produk.id,
          quantity,
          customerInfo
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderData(data);
        toast.success('Pesanan berhasil dibuat!');
      } else {
        toast.error(data.error || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Terjadi kesalahan saat membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Pesan berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Gagal menyalin pesan');
    }
  };

  const openWhatsApp = () => {
    if (orderData?.whatsappUrl) {
      window.open(orderData.whatsappUrl, '_blank');
    }
  };

  const totalPrice = produk ? produk.harga * quantity : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Form Pemesanan Produk
          </DialogTitle>
          <DialogDescription>
            Isi data diri Anda untuk melanjutkan pemesanan
          </DialogDescription>
        </DialogHeader>

        {!orderData ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Detail Produk */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Detail Produk</h3>
              <div className="flex gap-4">
                {produk?.gambar && (
                  <img
                    src={produk.gambar[0]}
                    alt={produk.nama}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{produk?.nama}</h4>
                  <p className="text-sm text-gray-600">{produk?.kategori}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-green-600">
                      Rp {produk?.harga.toLocaleString('id-ID')}
                    </span>
                    <Badge variant={produk?.stok > 0 ? 'default' : 'destructive'}>
                      Stok: {produk?.stok}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Jumlah Pesanan */}
            <div>
              <Label htmlFor="quantity">Jumlah Pesanan</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={produk?.stok}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(produk?.stok || 1, quantity + 1))}
                  disabled={quantity >= (produk?.stok || 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <Separator />

            {/* Data Pelanggan */}
            <div className="space-y-4">
              <h3 className="font-semibold">Data Pelanggan</h3>
              
              <div>
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  value={customerInfo.nama}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <Label htmlFor="telepon">Nomor Telepon *</Label>
                <Input
                  id="telepon"
                  type="tel"
                  value={customerInfo.telepon}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, telepon: e.target.value }))}
                  placeholder="Masukkan nomor telepon"
                  required
                />
              </div>

              <div>
                <Label htmlFor="alamat">Alamat Pengiriman *</Label>
                <Textarea
                  id="alamat"
                  value={customerInfo.alamat}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, alamat: e.target.value }))}
                  placeholder="Masukkan alamat lengkap pengiriman"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={customerInfo.catatan}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Catatan khusus untuk pesanan Anda"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Total Harga */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Harga:</span>
                <span className="text-xl font-bold text-green-600">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !produk || produk.stok === 0}
              >
                {isSubmitting ? 'Memproses...' : 'Lanjut ke WhatsApp'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* WhatsApp Order Confirmation */
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-600">
                Pesanan Berhasil Dibuat!
              </h3>
              <p className="text-gray-600 mt-2">
                Nomor pesanan: #{orderData.pesanan.id}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Kirim Pesan WhatsApp
              </h4>
              <p className="text-sm text-gray-700 mb-4">
                Klik tombol di bawah untuk mengirim pesan pemesanan melalui WhatsApp
              </p>
              
              <div className="flex gap-2">
                <Button onClick={openWhatsApp} className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Buka WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(orderData.pesanWhatsApp)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                Scan QR Code
              </h4>
              <img
                src={orderData.qrCodeUrl}
                alt="WhatsApp QR Code"
                className="mx-auto border rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                Scan QR code untuk buka WhatsApp
              </p>
            </div>

            {/* Pesan Preview */}
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
              <h4 className="font-semibold mb-2">Preview Pesan:</h4>
              <pre className="text-xs whitespace-pre-wrap text-gray-700">
                {orderData.pesanWhatsApp}
              </pre>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Pembayaran Aman</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                <span>Pengiriman Cepat</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Selesai
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
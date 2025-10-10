import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, FileX } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileX className="text-muted-foreground" size={32} />
          </div>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">
            Halaman tidak ditemukan
          </p>
          <p className="text-muted-foreground text-sm">
            Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.
          </p>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2" size={16} />
              Kembali ke Beranda
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
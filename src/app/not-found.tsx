import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary">404</CardTitle>
          <CardDescription className="text-lg">
            Halaman tidak ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak tersedia.
          </p>
          <div className="space-x-2">
            <Button asChild>
              <Link href="/">Beranda</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
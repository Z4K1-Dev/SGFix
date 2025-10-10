'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-destructive" size={24} />
          </div>
          <CardTitle className="text-xl">Terjadi Kesalahan!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
          </p>
          {error && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg text-left">
              <p className="font-medium mb-1">Detail Error:</p>
              <p className="font-mono">{error.message}</p>
            </div>
          )}
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2" size={16} />
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
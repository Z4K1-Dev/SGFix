'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { Suspense } from 'react'

interface Berita {
  id: string
  judul: string
  isi: string
  gambar?: string
  published: boolean
  kategori: {
    id: string
    nama: string
  }
  createdAt: string
}

interface BeritaCardProps {
  item: Berita
  onClick: (id: string) => void
}

// Loading skeleton component
const BeritaCardSkeleton = () => (
  <Card className="border-0 shadow-sm bg-card">
    <CardHeader className="pb-3">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
      </div>
    </CardContent>
  </Card>
)

function BeritaCardContent({ item, onClick }: BeritaCardProps) {
  return (
    <Card className="border-0 shadow-sm bg-card active:shadow-none transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-foreground line-clamp-2">{item.judul}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {item.kategori.nama}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.isi}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full active:shadow-none transition-all duration-200" 
          onClick={() => onClick(item.id)}
        >
          Baca Selengkapnya
        </Button>
      </CardContent>
    </Card>
  )
}

export default function BeritaCard(props: BeritaCardProps) {
  return (
    <Suspense fallback={<BeritaCardSkeleton />}>
      <BeritaCardContent {...props} />
    </Suspense>
  )
}
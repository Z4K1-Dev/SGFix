"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MessageSquare,
  Info
} from 'lucide-react'

interface DocTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  articleContent: React.ReactNode
  articleData: {
    id: string
    judul: string
    isi: string
    author?: string
    createdAt: string
    updatedAt: string
    views?: number
    likes?: number
    comments?: number
    kategori: {
      nama: string
    }
  }
  isLiked: boolean
  isBookmarked: boolean
  onLike: () => void
  onShare: () => void
  onBookmark: () => void
  formatDate: (dateString: string) => string
}

export function DocTabs({
  activeTab,
  onTabChange,
  articleContent,
  articleData,
  isLiked,
  isBookmarked,
  onLike,
  onShare,
  onBookmark,
  formatDate
}: DocTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artikel" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>Artikel</span>
          </TabsTrigger>
          <TabsTrigger value="komentar" className="flex items-center gap-2">
            <MessageCircle size={16} />
            <span>Komentar</span>
          </TabsTrigger>
          <TabsTrigger value="informasi" className="flex items-center gap-2">
            <Info size={16} />
            <span>Informasi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artikel" className="mt-4">
          <div className="prose prose-sm max-w-none">
            {articleContent}
          </div>

          {/* Engagement Buttons */}
          <div className="flex items-center justify-around mt-6 p-4 bg-muted rounded-xl">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLike}
              className="flex flex-col items-center gap-1"
            >
              <Heart className={isLiked ? 'fill-current text-red-500' : ''} size={20} />
              <span className="text-xs">{articleData.likes || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex flex-col items-center gap-1"
              onClick={() => onTabChange('komentar')}
            >
              <MessageCircle size={20} />
              <span className="text-xs">{articleData.comments || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShare}
              className="flex flex-col items-center gap-1"
            >
              <Share2 size={20} />
              <span className="text-xs">Bagikan</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBookmark}
              className="flex flex-col items-center gap-1"
            >
              <Bookmark className={isBookmarked ? 'fill-current text-primary' : ''} size={20} />
              <span className="text-xs">Simpan</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="komentar" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Belum ada komentar</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Jadilah yang pertama memberikan komentar pada artikel ini.
                </p>
                <Button size="sm">
                  Tulis Komentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="informasi" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Detail Artikel</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kategori</span>
                  <Badge variant="outline">{articleData.kategori.nama}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Penulis</span>
                  <span className="text-sm font-medium">{articleData.author || 'Anonim'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diterbitkan</span>
                  <span className="text-sm font-medium">{formatDate(articleData.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Diperbarui</span>
                  <span className="text-sm font-medium">{formatDate(articleData.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dibaca</span>
                  <span className="text-sm font-medium">{articleData.views || 0} kali</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Disukai</span>
                  <span className="text-sm font-medium">{articleData.likes || 0} kali</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Bagikan Artikel</h3>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onShare}
                    className="flex-1"
                  >
                    <Share2 size={16} className="mr-2" />
                    Bagikan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onBookmark}
                    className="flex-1"
                  >
                    <Bookmark size={16} className="mr-2" />
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
  )
}
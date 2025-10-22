/**
 * Media Cache Tab Component
 * Priority #2: Media cache management with MIME type control
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Trash2, 
  Download,
  Upload,
  Settings,
  HardDrive,
  Ban,
  CheckCircle
} from 'lucide-react'
import { useCacheRules, useClientCacheStats } from '@/hooks/client-cache/useClientCache'

interface MediaTypeConfig {
  type: string
  extensions: string[]
  maxSize: string
  ttl: string
  allowed: boolean
  icon: React.ReactNode
  description: string
}

export function MediaCacheTab() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const { rules, loading: rulesLoading, updateRules } = useCacheRules()
  const { stats, loading: statsLoading } = useClientCacheStats()

  // Media type configurations
  const mediaTypes: MediaTypeConfig[] = [
    {
      type: 'image/jpeg',
      extensions: ['jpg', 'jpeg'],
      maxSize: '5MB',
      ttl: '7 days',
      allowed: true,
      icon: <Image className="h-4 w-4" />,
      description: 'JPEG images'
    },
    {
      type: 'image/png',
      extensions: ['png'],
      maxSize: '5MB',
      ttl: '7 days',
      allowed: true,
      icon: <Image className="h-4 w-4" />,
      description: 'PNG images'
    },
    {
      type: 'image/webp',
      extensions: ['webp'],
      maxSize: '5MB',
      ttl: '7 days',
      allowed: true,
      icon: <Image className="h-4 w-4" />,
      description: 'WebP images'
    },
    {
      type: 'image/svg+xml',
      extensions: ['svg'],
      maxSize: '5MB',
      ttl: '7 days',
      allowed: true,
      icon: <Image className="h-4 w-4" />,
      description: 'SVG vector images'
    },
    {
      type: 'image/gif',
      extensions: ['gif'],
      maxSize: '5MB',
      ttl: '7 days',
      allowed: true,
      icon: <Image className="h-4 w-4" />,
      description: 'GIF animations'
    },
    {
      type: 'video/mp4',
      extensions: ['mp4'],
      maxSize: 'Blocked',
      ttl: 'No cache',
      allowed: false,
      icon: <Video className="h-4 w-4" />,
      description: 'MP4 videos (streaming)'
    },
    {
      type: 'video/webm',
      extensions: ['webm'],
      maxSize: 'Blocked',
      ttl: 'No cache',
      allowed: false,
      icon: <Video className="h-4 w-4" />,
      description: 'WebM videos (streaming)'
    },
    {
      type: 'audio/mpeg',
      extensions: ['mp3'],
      maxSize: 'Blocked',
      ttl: 'No cache',
      allowed: false,
      icon: <Music className="h-4 w-4" />,
      description: 'MP3 audio (streaming)'
    }
  ]

  const handleToggleMediaType = async (type: string, allowed: boolean) => {
    try {
      // This would update the cache rules
      // For now, we'll just log the change
      console.log(`Toggling ${type} to ${allowed}`)
      // await updateRules({ ... })
    } catch (error) {
      console.error('Failed to update media type rules:', error)
    }
  }

  const handleClearMediaCache = async (type?: string) => {
    try {
      const response = await fetch('/api/client-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'clear-by-type',
          mimeType: type
        })
      })
      
      if (response.ok) {
        console.log(`Cleared cache for ${type || 'all media'}`)
      }
    } catch (error) {
      console.error('Failed to clear media cache:', error)
    }
  }

  const toggleTypeSelection = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const allowedTypes = mediaTypes.filter(t => t.allowed)
  const blockedTypes = mediaTypes.filter(t => !t.allowed)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Types</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              {allowedTypes.length} allowed, {blockedTypes.length} blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 MB</div>
            <p className="text-xs text-muted-foreground">
              Media files only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Media cache hits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">46%</div>
            <p className="text-xs text-muted-foreground">
              Of media cache limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Media Cache Storage</CardTitle>
          <CardDescription>
            Current storage usage for media files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used: 2.3 MB</span>
                <span>Total: 5 MB</span>
              </div>
              <Progress value={46} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Images: 2.1 MB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>SVG: 0.1 MB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>GIF: 0.1 MB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Free: 2.7 MB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allowed Media Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Allowed Media Types
          </CardTitle>
          <CardDescription>
            Media types that are cached with size limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allowedTypes.map((mediaType, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded">
                    {mediaType.icon}
                  </div>
                  <div>
                    <div className="font-medium">{mediaType.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {mediaType.extensions.join(', ')} • Max: {mediaType.maxSize} • TTL: {mediaType.ttl}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={mediaType.allowed}
                    onCheckedChange={(checked) => handleToggleMediaType(mediaType.type, checked)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearMediaCache(mediaType.type)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Media Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Blocked Media Types
          </CardTitle>
          <CardDescription>
            Media types that are not cached (streaming content)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blockedTypes.map((mediaType, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded">
                    {mediaType.icon}
                  </div>
                  <div>
                    <div className="font-medium">{mediaType.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {mediaType.extensions.join(', ')} • {mediaType.maxSize} • {mediaType.ttl}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Blocked</Badge>
                  <Switch
                    checked={mediaType.allowed}
                    onCheckedChange={(checked) => handleToggleMediaType(mediaType.type, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your media cache with these actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Prefetch Images
            </Button>
            
            <Button variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Image Cache
            </Button>
            
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Optimize Storage
            </Button>
            
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Media Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
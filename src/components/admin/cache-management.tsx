'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiCacheTab } from '@/components/client-cache/ApiCacheTab'
import { MediaCacheTab } from '@/components/client-cache/MediaCacheTab'
import { RulesTab } from '@/components/client-cache/RulesTab'
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Settings, 
  Search, 
  Tag, 
  Clock, 
  HardDrive, 
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Filter,
  Server,
  Monitor,
  Globe
} from 'lucide-react'

interface CacheStats {
  size: number
  maxItems: number
  hitRate: number
  missRate: number
  memoryUsage: string
  keys: string[]
  tags: string[]
  expiredItems: number
  lastCleanup: number
  totalHits: number
  totalMisses: number
}

interface CacheDetails {
  key: string
  size: string
  ttl: string
  accessCount: number
  lastAccessed: string
  tags: string[]
  expired: boolean
}

interface CachePreset {
  name: string
  ttl: number
  maxItems?: number
  tags?: string[]
  description: string
}

export default function CacheManagement() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [details, setDetails] = useState<CacheDetails[]>([])
  const [presets, setPresets] = useState<CachePreset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteAction, setDeleteAction] = useState<string>('all')
  const [deletePattern, setDeletePattern] = useState('')
  const [deleteTag, setDeleteTag] = useState('')
  const [deleteKey, setDeleteKey] = useState('')
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false)
  const [setFormData, setSetFormData] = useState({
    key: '',
    data: '',
    ttl: '',
    tags: ''
  })

  useEffect(() => {
    fetchStats()
    fetchPresets()
    
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache?action=stats')
      if (response.ok) {
        const result = await response.json()
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error)
      toast.error('Gagal memuat statistik cache')
    }
  }

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cache?action=details')
      if (response.ok) {
        const result = await response.json()
        setDetails(result.data)
      }
    } catch (error) {
      console.error('Error fetching cache details:', error)
      toast.error('Gagal memuat detail cache')
    } finally {
      setLoading(false)
    }
  }

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/cache?action=presets')
      if (response.ok) {
        const result = await response.json()
        setPresets(result.data)
      }
    } catch (error) {
      console.error('Error fetching presets:', error)
    }
  }

  const handleDelete = async () => {
    try {
      let url = '/api/cache?action=' + deleteAction
      
      if (deleteAction === 'key' && deleteKey) {
        url += `&key=${encodeURIComponent(deleteKey)}`
      } else if (deleteAction === 'pattern' && deletePattern) {
        url += `&pattern=${encodeURIComponent(deletePattern)}`
      } else if (deleteAction === 'tag' && deleteTag) {
        url += `&tag=${encodeURIComponent(deleteTag)}`
      }

      const response = await fetch(url, { method: 'DELETE' })
      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setIsDeleteDialogOpen(false)
        fetchStats()
        fetchDetails()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus cache')
      }
    } catch (error) {
      console.error('Error deleting cache:', error)
      toast.error('Terjadi kesalahan saat menghapus cache')
    }
  }

  const handleSet = async () => {
    try {
      const ttl = setFormData.ttl ? parseInt(setFormData.ttl) * 1000 : undefined
      const tags = setFormData.tags ? setFormData.tags.split(',').map(t => t.trim()) : undefined
      const data = setFormData.data ? JSON.parse(setFormData.data) : {}

      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set',
          key: setFormData.key,
          data,
          ttl,
          tags
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setIsSetDialogOpen(false)
        setSetFormData({ key: '', data: '', ttl: '', tags: '' })
        fetchStats()
        fetchDetails()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan cache')
      }
    } catch (error) {
      console.error('Error setting cache:', error)
      toast.error('Terjadi kesalahan saat menyimpan cache')
    }
  }

  const handleApplyPreset = async (presetName: string) => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preset',
          preset: presetName
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menerapkan preset')
      }
    } catch (error) {
      console.error('Error applying preset:', error)
      toast.error('Terjadi kesalahan saat menerapkan preset')
    }
  }

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchStats()
        fetchDetails()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membersihkan cache')
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error)
      toast.error('Terjadi kesalahan saat membersihkan cache')
    }
  }

  const filteredDetails = details.filter(item => {
    const matchesSearch = item.key.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === 'all' || item.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(details.flatMap(item => item.tags)))

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin mr-2" />
        Memuat statistik cache...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="text-blue-600" />
            Cache Management
          </h2>
          <p className="text-muted-foreground">
            Kelola dan monitor sistem cache untuk optimasi performa aplikasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCleanup} variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Cleanup Expired
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cache
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus Cache</DialogTitle>
                <DialogDescription>
                  Pilih jenis cache yang ingin dihapus
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Aksi</Label>
                  <Select value={deleteAction} onValueChange={setDeleteAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Hapus Semua</SelectItem>
                      <SelectItem value="expired">Hapus Expired</SelectItem>
                      <SelectItem value="key">Hapus by Key</SelectItem>
                      <SelectItem value="pattern">Hapus by Pattern</SelectItem>
                      <SelectItem value="tag">Hapus by Tag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {deleteAction === 'key' && (
                  <div>
                    <Label>Key</Label>
                    <Input
                      value={deleteKey}
                      onChange={(e) => setDeleteKey(e.target.value)}
                      placeholder="Masukkan key"
                    />
                  </div>
                )}
                
                {deleteAction === 'pattern' && (
                  <div>
                    <Label>Pattern</Label>
                    <Input
                      value={deletePattern}
                      onChange={(e) => setDeletePattern(e.target.value)}
                      placeholder="Masukkan pattern (gunakan * untuk wildcard)"
                    />
                  </div>
                )}
                
                {deleteAction === 'tag' && (
                  <div>
                    <Label>Tag</Label>
                    <Input
                      value={deleteTag}
                      onChange={(e) => setDeleteTag(e.target.value)}
                      placeholder="Masukkan tag"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.size}</div>
            <p className="text-xs text-muted-foreground">
              Max: {stats.maxItems} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHits} hits / {stats.totalMisses} misses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memoryUsage}</div>
            <p className="text-xs text-muted-foreground">
              {stats.expiredItems} expired items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tags.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats.keys.length} unique keys
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="server-overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="server-overview" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Server
          </TabsTrigger>
          <TabsTrigger value="server-details">Server Details</TabsTrigger>
          <TabsTrigger value="server-presets">Server Presets</TabsTrigger>
          <TabsTrigger value="server-tools">Server Tools</TabsTrigger>
          <TabsTrigger value="client-api" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Client
          </TabsTrigger>
          <TabsTrigger value="client-media">Media Cache</TabsTrigger>
          <TabsTrigger value="client-rules">Cache Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="server-overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Cache Hit Rate</span>
                  <Badge variant={stats.hitRate > 70 ? "default" : "destructive"}>
                    {stats.hitRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cache Miss Rate</span>
                  <Badge variant={stats.missRate < 30 ? "default" : "destructive"}>
                    {stats.missRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Memory Efficiency</span>
                  <Badge variant="secondary">
                    {((stats.size / stats.maxItems) * 100).toFixed(1)}% used
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Cleanup</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(stats.lastCleanup).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsSetDialogOpen(true)} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Set Cache Item
                </Button>
                <Button 
                  onClick={handleCleanup} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Cleanup Expired
                </Button>
                <Button 
                  onClick={fetchStats} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Stats
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="server-details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Details</CardTitle>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search cache keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={fetchDetails} variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="animate-spin mr-2" />
                  Loading...
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Last Accessed</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDetails.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{item.key}</TableCell>
                          <TableCell>{item.size}</TableCell>
                          <TableCell>{item.ttl}</TableCell>
                          <TableCell>{item.accessCount}</TableCell>
                          <TableCell className="text-sm">{item.lastAccessed}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {item.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.expired ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredDetails.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No cache items found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server-presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card key={preset.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{preset.name}</span>
                    <Button
                      onClick={() => handleApplyPreset(preset.name)}
                      size="sm"
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {preset.description}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div>TTL: {(preset.ttl / 1000 / 60).toFixed(0)} minutes</div>
                    {preset.maxItems && <div>Max Items: {preset.maxItems}</div>}
                    {preset.tags && (
                      <div className="flex gap-1">
                        {preset.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="server-tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Set Cache Item */}
            <Card>
              <CardHeader>
                <CardTitle>Set Cache Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Key</Label>
                  <Input
                    value={setFormData.key}
                    onChange={(e) => setSetFormData({ ...setFormData, key: e.target.value })}
                    placeholder="cache:key:name"
                  />
                </div>
                <div>
                  <Label>Data (JSON)</Label>
                  <Textarea
                    value={setFormData.data}
                    onChange={(e) => setSetFormData({ ...setFormData, data: e.target.value })}
                    placeholder='{"example": "data"}'
                    rows={4}
                  />
                </div>
                <div>
                  <Label>TTL (seconds)</Label>
                  <Input
                    value={setFormData.ttl}
                    onChange={(e) => setSetFormData({ ...setFormData, ttl: e.target.value })}
                    placeholder="3600"
                  />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={setFormData.tags}
                    onChange={(e) => setSetFormData({ ...setFormData, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <Button onClick={handleSet} className="w-full">
                  Set Cache
                </Button>
              </CardContent>
            </Card>

            {/* Cache Utilities */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Utilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleCleanup} className="w-full justify-start" variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cleanup Expired Items
                </Button>
                <Button onClick={fetchStats} className="w-full justify-start" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Statistics
                </Button>
                <Button onClick={fetchDetails} className="w-full justify-start" variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Load Cache Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Cache Tabs */}
        <TabsContent value="client-api" className="space-y-4">
          <ApiCacheTab />
        </TabsContent>

        <TabsContent value="client-media" className="space-y-4">
          <MediaCacheTab />
        </TabsContent>

        <TabsContent value="client-rules" className="space-y-4">
          <RulesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
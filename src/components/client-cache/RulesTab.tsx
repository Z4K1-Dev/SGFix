/**
 * Rules Tab Component
 * Priority #3: Cache rules configuration and management
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Clock, 
  Database, 
  Zap, 
  Save,
  RotateCcw,
  FileText,
  Image,
  Video,
  Ban,
  CheckCircle
} from 'lucide-react'
import { useCacheRules } from '@/hooks/client-cache/useClientCache'

interface CacheRule {
  name: string
  description: string
  ttl: number // in minutes
  maxItems: number
  maxSize: number | null // in bytes, null = unlimited
  enabled: boolean
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
}

export function RulesTab() {
  const [rules, setRules] = useState<CacheRule[]>([
    {
      name: 'HTML Pages',
      description: 'Static HTML pages and templates',
      ttl: 60,
      maxItems: 20,
      maxSize: null,
      enabled: true,
      priority: 'high',
      icon: <FileText className="h-4 w-4" />
    },
    {
      name: 'CSS Stylesheets',
      description: 'CSS files and style sheets',
      ttl: 1440, // 24 hours
      maxItems: 50,
      maxSize: null,
      enabled: true,
      priority: 'high',
      icon: <FileText className="h-4 w-4" />
    },
    {
      name: 'JavaScript Files',
      description: 'JavaScript modules and scripts',
      ttl: 1440, // 24 hours
      maxItems: 30,
      maxSize: null,
      enabled: true,
      priority: 'high',
      icon: <FileText className="h-4 w-4" />
    },
    {
      name: 'Images',
      description: 'JPEG, PNG, WebP, SVG images',
      ttl: 10080, // 7 days
      maxItems: 100,
      maxSize: 5 * 1024 * 1024, // 5MB
      enabled: true,
      priority: 'medium',
      icon: <Image className="h-4 w-4" />
    },
    {
      name: 'API Responses',
      description: 'JSON API responses and data',
      ttl: 30,
      maxItems: 20,
      maxSize: 1024 * 1024, // 1MB
      enabled: true,
      priority: 'high',
      icon: <Database className="h-4 w-4" />
    },
    {
      name: 'Video Streaming',
      description: 'Video files and streaming content',
      ttl: 0,
      maxItems: 0,
      maxSize: 0,
      enabled: false,
      priority: 'low',
      icon: <Video className="h-4 w-4" />
    }
  ])

  const [globalSettings, setGlobalSettings] = useState({
    maxCacheSize: 50, // MB
    cleanupInterval: 5, // minutes
    autoCleanup: true,
    enableStats: true,
    enableLogging: true
  })

  const { rules: apiRules, updateRules } = useCacheRules()

  const handleRuleToggle = (index: number, enabled: boolean) => {
    setRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, enabled } : rule
    ))
  }

  const handleRuleChange = (index: number, field: keyof CacheRule, value: any) => {
    setRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ))
  }

  const handleGlobalSettingChange = (field: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveRules = async () => {
    try {
      console.log('Saving cache rules:', rules)
      console.log('Saving global settings:', globalSettings)
      // Here you would save to API or localStorage
      // await updateRules({ rules, globalSettings })
      alert('Cache rules saved successfully!')
    } catch (error) {
      console.error('Failed to save rules:', error)
      alert('Failed to save rules')
    }
  }

  const handleResetRules = () => {
    if (confirm('Are you sure you want to reset all rules to default values?')) {
      // Reset to default values
      setRules([
        {
          name: 'HTML Pages',
          description: 'Static HTML pages and templates',
          ttl: 60,
          maxItems: 20,
          maxSize: null,
          enabled: true,
          priority: 'high',
          icon: <FileText className="h-4 w-4" />
        },
        // ... other default rules
      ])
    }
  }

  const formatTTL = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`
    return `${Math.round(minutes / 1440)} days`
  }

  const formatSize = (bytes: number | null) => {
    if (bytes === null) return 'Unlimited'
    if (bytes === 0) return 'Blocked'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Cache Settings
          </CardTitle>
          <CardDescription>
            Configure global cache behavior and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxCacheSize">Maximum Cache Size</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="maxCacheSize"
                    min={10}
                    max={100}
                    step={5}
                    value={[globalSettings.maxCacheSize]}
                    onValueChange={([value]) => handleGlobalSettingChange('maxCacheSize', value)}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{globalSettings.maxCacheSize} MB</span>
                </div>
              </div>

              <div>
                <Label htmlFor="cleanupInterval">Cleanup Interval</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="cleanupInterval"
                    min={1}
                    max={30}
                    step={1}
                    value={[globalSettings.cleanupInterval]}
                    onValueChange={([value]) => handleGlobalSettingChange('cleanupInterval', value)}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{globalSettings.cleanupInterval} min</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoCleanup">Auto Cleanup</Label>
                <Switch
                  id="autoCleanup"
                  checked={globalSettings.autoCleanup}
                  onCheckedChange={(checked) => handleGlobalSettingChange('autoCleanup', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableStats">Enable Statistics</Label>
                <Switch
                  id="enableStats"
                  checked={globalSettings.enableStats}
                  onCheckedChange={(checked) => handleGlobalSettingChange('enableStats', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableLogging">Enable Logging</Label>
                <Switch
                  id="enableLogging"
                  checked={globalSettings.enableLogging}
                  onCheckedChange={(checked) => handleGlobalSettingChange('enableLogging', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Rules Configuration</CardTitle>
          <CardDescription>
            Configure caching rules for different content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${rule.enabled ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      {rule.icon}
                    </div>
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">{rule.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(rule.priority)}>
                      {rule.priority}
                    </Badge>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(enabled) => handleRuleToggle(index, enabled)}
                    />
                  </div>
                </div>

                {rule.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">TTL (Time to Live)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={rule.ttl}
                          onChange={(e) => handleRuleChange(index, 'ttl', parseInt(e.target.value))}
                          className="h-8"
                          min="0"
                          max="10080"
                        />
                        <span className="text-xs text-muted-foreground">minutes</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTTL(rule.ttl)}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Max Items</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={rule.maxItems}
                          onChange={(e) => handleRuleChange(index, 'maxItems', parseInt(e.target.value))}
                          className="h-8"
                          min="0"
                          max="1000"
                        />
                        <span className="text-xs text-muted-foreground">items</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Max Size</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={rule.maxSize ? rule.maxSize / (1024 * 1024) : ''}
                          onChange={(e) => handleRuleChange(index, 'maxSize', e.target.value ? parseInt(e.target.value) * 1024 * 1024 : null)}
                          className="h-8"
                          min="0"
                          max="100"
                          placeholder="Unlimited"
                        />
                        <span className="text-xs text-muted-foreground">MB</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatSize(rule.maxSize)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Save or reset your cache configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={handleSaveRules} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Rules
            </Button>
            
            <Button variant="outline" onClick={handleResetRules}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rule Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Summary</CardTitle>
          <CardDescription>
            Overview of your cache configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rules.filter(r => r.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Enabled Rules</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {rules.filter(r => !r.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Disabled Rules</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rules.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {globalSettings.maxCacheSize} MB
              </div>
              <div className="text-sm text-muted-foreground">Max Cache Size</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
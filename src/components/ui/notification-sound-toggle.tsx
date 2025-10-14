'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface NotificationSoundToggleProps {
  soundEnabled: boolean
  onToggle: () => void
 onTestSound: () => void
}

export function NotificationSoundToggle({
  soundEnabled,
  onToggle,
  onTestSound
}: NotificationSoundToggleProps) {
  const handleTestSound = () => {
    console.log('Test sound button clicked');
    console.log('Calling onTestSound function');
    onTestSound();
    console.log('onTestSound function called');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="notification-sound" className="text-sm font-medium">
            Aktifkan Sound
          </Label>
          <p className="text-sm text-muted-foreground">
            Putar sound saat notifikasi baru diterima
          </p>
        </div>
        <Switch
          id="notification-sound"
          checked={soundEnabled}
          onCheckedChange={onToggle}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="test-sound" className="text-sm font-medium">
            Test Sound
          </Label>
          <p className="text-sm text-muted-foreground">
            Test sound notifikasi
          </p>
        </div>
        <Button
          id="test-sound"
          size="sm"
          variant="outline"
          onClick={handleTestSound}
        >
          Test
        </Button>
      </div>
    </div>
  )
}
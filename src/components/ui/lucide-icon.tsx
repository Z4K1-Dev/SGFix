'use client'

import * as Icons from 'lucide-react'

interface LucideIconProps {
  name: string
  className?: string
  size?: number
}

export function LucideIcon({ name, className = '', size = 20 }: LucideIconProps) {
  // Type assertion untuk mengakses icon dari lucide-react
  const IconComponent = (Icons as any)[name]

  if (!IconComponent) {
    // Fallback jika icon tidak ditemukan
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <span className="text-muted-foreground">?</span>
      </div>
    )
  }

  return <IconComponent className={className} size={size} />
}
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1)
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleItems.startIndex * itemHeight

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.items.map((item, index) => (
            <div
              key={visibleItems.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simpler version for mobile with better performance
interface MobileVirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  threshold?: number
  className?: string
}

export function MobileVirtualList<T>({
  items,
  renderItem,
  threshold = 10,
  className
}: MobileVirtualListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: threshold })
  const observerRef = useRef<IntersectionObserver | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            
            setVisibleRange(prev => {
              const newStart = Math.max(0, index - 5)
              const newEnd = Math.min(items.length - 1, index + 5)
              
              if (newStart < prev.start || newEnd > prev.end) {
                return { start: newStart, end: newEnd }
              }
              return prev
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    const currentObserver = observerRef.current
    const container = containerRef.current

    // Observe all items
    const items = container.querySelectorAll('[data-index]')
    items.forEach(item => currentObserver.observe(item))

    return () => {
      currentObserver.disconnect()
    }
  }, [items.length])

  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1)

  return (
    <div ref={containerRef} className={cn('space-y-4', className)}>
      {visibleItems.map((item, index) => (
        <div
          key={visibleRange.start + index}
          data-index={visibleRange.start + index}
        >
          {renderItem(item, visibleRange.start + index)}
        </div>
      ))}
    </div>
  )
}
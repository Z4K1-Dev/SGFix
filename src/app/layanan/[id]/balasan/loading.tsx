"use client"

import { MobileLayout } from '@/components/layout/mobile-layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <MobileLayout title="Balasan Layanan" activeTab="layanan">
      <div className="container mx-auto py-8 px-4 max-w-[412px]">
        {/* Header section (judul + badge status + jenis + count) */}
        <div className="mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Card wrapper to mirror page layout */}
        <div className="bg-card rounded-xl border border-border shadow-sm h-[600px] flex flex-col">
          {/* CardHeader skeleton */}
          <div className="p-6 border-b border-border">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* CardContent skeleton */}
          <div className="flex-1 flex flex-col p-6 pt-4">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted/40">
                      <Skeleton className="h-4 w-56 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="h-px bg-border" />

            {/* Message input */}
            <div className="pt-4 space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-20 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Info box skeleton below card */}
        <div className="mt-6 rounded-lg p-4 border border-blue-200 bg-blue-50">
          <div className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

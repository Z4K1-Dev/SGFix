import { Skeleton } from '@/components/ui/skeleton'

export function BeritaSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex gap-3">
        <Skeleton className="w-20 h-20 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LaporanSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex gap-3">
        <Skeleton className="w-20 h-20 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-12 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function SliderSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl shadow-sm">
      <div className="relative h-48 bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="w-2 h-2 rounded-full" />
        ))}
      </div>
    </div>
  )
}
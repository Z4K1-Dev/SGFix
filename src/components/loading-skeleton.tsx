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

export function PengaduanSkeleton() {
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

export function LayananSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full ml-3" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export function JenisLayananSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Kategori 1 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <div className="h-px bg-border flex-1" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kategori 2 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <div className="h-px bg-border flex-1" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((index) => (
            <div key={index} className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
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
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

export function StatusTrackerSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="mb-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Skeleton className="h-10 w-full rounded-lg" />
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

export function AdminTableSkeleton() {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BeritaDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <Skeleton className="h-8 w-3/4 mb-3" />
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PengaduanDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="p-6 border-b border-border">
          <Skeleton className="h-8 w-3/4 mb-3" />
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="space-y-4">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

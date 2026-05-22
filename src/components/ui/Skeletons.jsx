import React from 'react'

function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border border-white/70 bg-white/72 p-4 dark:border-white/10 dark:bg-white/[0.055]">
            <SkeletonBlock className="h-11 w-11" />
            <SkeletonBlock className="mt-5 h-8 w-28" />
            <SkeletonBlock className="mt-2 h-4 w-36" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <SkeletonBlock key={item} className="h-14 w-full" />
      ))}
    </div>
  )
}

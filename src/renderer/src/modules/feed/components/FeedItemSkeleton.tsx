import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export const FeedItemSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 p-4 border-b border-border">
      {/* Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Meta Line: Source + Time */}
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-1" />

        {/* Summary Lines */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Thumbnail */}
      <Skeleton className="shrink-0 w-20 h-20 rounded-lg" />
    </div>
  )
}

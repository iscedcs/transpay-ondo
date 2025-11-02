"use client";

import { cn } from "@/lib/utils";

export default function AgencyListSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-6 px-4 animate-pulse", className)}>
      {/* Page header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/30 rounded" />
          <div className="h-4 w-72 bg-muted/20 rounded" />
        </div>
        <div className="h-10 w-28 bg-muted/30 rounded-md" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-muted/30 rounded" />
              <div className="h-4 w-4 bg-muted/30 rounded" />
            </div>
            <div className="h-6 w-16 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-card rounded-lg border border-white/10">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="h-5 w-32 bg-muted/30 rounded" />
          <div className="h-8 w-20 bg-muted/30 rounded" />
        </div>

        <div className="divide-y divide-white/10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-3">
              <div className="flex-1 grid grid-cols-4 gap-6">
                <div className="h-4 bg-muted/20 rounded w-3/4" />
                <div className="h-4 bg-muted/20 rounded w-2/3" />
                <div className="h-4 bg-muted/20 rounded w-1/2" />
                <div className="h-4 bg-muted/20 rounded w-1/3" />
              </div>
              <div className="h-4 w-6 bg-muted/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

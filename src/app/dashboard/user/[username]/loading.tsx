import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="flex flex-col w-full">
      {/* Cover Image Skeleton */}
      <Skeleton className="h-48 md:h-64 w-full rounded-b-lg" />

      {/* Profile Info Skeleton */}
      <div className="px-4 md:px-8 -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-white" />

          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="flex mt-4 md:mt-0 space-x-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>

            <Skeleton className="mt-2 h-4 w-full max-w-md" />

            <div className="flex mt-4 space-x-6">
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-10 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="px-4 md:px-8 mt-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-20" />
        </div>

        {/* Grid Posts Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DiscoverLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2 mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-4 mb-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full sm:w-[120px]" />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 flex-shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Card className="border-none shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-[200px] w-full rounded-md" />
                    <div className="flex space-x-4 pt-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-8 w-full mt-3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

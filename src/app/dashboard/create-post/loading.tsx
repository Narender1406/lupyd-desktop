import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CreatePostLoading() {
  return (
    <DashboardLayout>
      <div className="container max-w-6xl px-4 py-6 mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm mb-6">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-32 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <div className="flex gap-2 mb-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm mb-6">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="aspect-video w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm mb-6">
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-10" />
                  </div>
                  <Skeleton className="h-0.5 w-full" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-3" />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="hidden lg:block">
            <div>
              <Card className="border-none shadow-sm mb-6">
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-6 w-40 mb-2" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Skeleton className="h-10 w-full mb-4" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

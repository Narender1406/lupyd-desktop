import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SubscriptionLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-full w-48 mx-auto mb-6"></div>
            <div className="h-16 bg-white/20 rounded w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-white/20 rounded w-80 mx-auto mb-8"></div>
            <div className="h-12 bg-white/20 rounded-full w-64 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Skeleton */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="bg-white shadow-xl animate-pulse">
              <CardHeader className="text-center pb-4">
                <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-24 mx-auto"></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded mt-0.5"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="text-center animate-pulse">
              <CardHeader>
                <div className="h-12 w-12 bg-gray-200 rounded mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

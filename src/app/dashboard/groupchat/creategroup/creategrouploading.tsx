export default function CreateGroupLoading() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b p-4">
          <div className="flex items-center max-w-4xl mx-auto">
            <div className="w-6 h-6 bg-gray-200 rounded mr-3 animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-full h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
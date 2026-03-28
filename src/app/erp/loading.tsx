import { FileText, Eye, TrendingUp } from "lucide-react";

export default function ERPLoading() {
  return (
    <div className="space-y-10 py-6 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-gray-100 rounded-md" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-2.5 rounded-xl w-10 h-10" />
              <div className="w-4 h-4 bg-gray-100 rounded" />
            </div>
            <div className="h-10 w-16 bg-gray-200 rounded-lg mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-96">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="h-6 w-48 bg-gray-200 rounded" />
            </div>
            <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-gray-50 rounded-xl" />
                ))}
            </div>
        </div>
        <div className="bg-gray-100 rounded-3xl p-8 h-96" />
      </div>
    </div>
  );
}

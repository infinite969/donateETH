export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-8 bg-gray-700 rounded w-1/4 mb-1" />
      <div className="h-3 bg-gray-700 rounded w-1/5 mb-4" />
      <div className="h-24 bg-gray-700 rounded" />
    </div>
  );
}

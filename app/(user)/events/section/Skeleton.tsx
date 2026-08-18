export default function SkeletonCompany() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[2fr_1fr] gap-12 animate-pulse">
      <div className="space-y-6">
        <div className="bg-gray-100 p-5 rounded-2xl space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>

        <div className="bg-gray-100 p-5 rounded-2xl space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        <div className="bg-gray-100 p-5 rounded-2xl space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        <div className="bg-gray-100 p-5 rounded-2xl space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-64 bg-gray-200 rounded-2xl"></div>

        <div className="bg-gray-100 p-5 rounded-2xl space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  );
}

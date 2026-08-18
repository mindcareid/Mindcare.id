function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200  rounded-lg ${className}`} />
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-3 mb-3">
      {/* Hero utama */}
      <div className="bg-gray-200  animate-pulse rounded-2xl min-h-80" />
      {/* Side stack */}
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200  animate-pulse rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100  p-5 space-y-3"
        >
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-3 w-5/6" />
          <Shimmer className="h-3 w-4/6" />
          <div className="pt-3 border-t border-gray-100 ">
            <Shimmer className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white  rounded-2xl border border-gray-100  p-5 space-y-3">
        <Shimmer className="h-3 w-24" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-1 flex-1" />
            <Shimmer className="h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="bg-white  rounded-2xl border border-gray-100  p-5 space-y-3">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-9 w-full rounded-xl" />
        <Shimmer className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

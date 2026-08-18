function EventCardSkeletonItem() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video overflow-hidden animate-pulse bg-gray-200">
        <div className="absolute top-3 right-3 h-6 w-16 rounded-full bg-gray-300" />
      </div>

      <div className="p-5 flex flex-col flex-1 min-h-10">
        <div className="mb-4 min-h-10">
          <div className="h-5 w-4/5 rounded bg-gray-300 animate-pulse" />
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-36 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-20 rounded bg-gray-300 animate-pulse" />
          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="mt-auto pt-4 border-t">
          <div className="h-10.5 w-full rounded-lg bg-gray-300 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
export { EventCardSkeletonItem };

export default function EventCardSkeleton({ count = 9 }: { count?: number }) {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <EventCardSkeletonItem key={index} />
        ))}
      </div>
    </section>
  );
}

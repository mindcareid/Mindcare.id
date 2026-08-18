export default function PartnerDetailSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {/* Breadcrumb */}
      <div className="mb-8 flex gap-2">
        <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-gray-200" />

            <div className="space-y-3">
              <div className="h-7 w-60 animate-pulse rounded bg-gray-200" />

              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
            </div>
          </div>

          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-10 animate-pulse rounded-full bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Carousel */}
        <div className="mt-12">
          <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                <div className="aspect-video animate-pulse bg-gray-200" />

                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />

                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
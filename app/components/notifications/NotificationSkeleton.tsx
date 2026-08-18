"use client";

interface NotificationSkeletonProps {
  rows?: number;
}

export default function NotificationSkeleton({
  rows = 5,
}: NotificationSkeletonProps) {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse px-4 py-4"
        >
          <div className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-white/10" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-white/10" />

              <div className="h-3 w-full rounded bg-white/5" />

              <div className="h-3 w-4/5 rounded bg-white/5" />

              <div className="h-2 w-20 rounded bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
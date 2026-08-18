export function CompanySkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-36 md:h-48 rounded-2xl bg-gray-200" />
      <div className="px-4 md:px-6 pb-6 pt-14">
        <div className="h-6 w-48 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded-lg mb-4" />
        <div className="h-4 w-full bg-gray-100 rounded-lg" />
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

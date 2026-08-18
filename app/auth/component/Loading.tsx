export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200" />

        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <p className="text-sm text-gray-500 tracking-wide">
        Checking your session...
      </p>
    </div>
  );
}

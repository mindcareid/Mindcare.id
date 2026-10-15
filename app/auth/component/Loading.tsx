export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-purple-600 animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground tracking-wide">
        Checking your session...
      </p>
    </div>
  );
}

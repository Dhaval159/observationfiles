export default function LoadingPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="border-border border-t-foreground h-8 w-8 animate-spin rounded-full border-2" />
        <p className="text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}

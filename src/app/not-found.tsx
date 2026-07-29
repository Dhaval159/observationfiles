import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <p className="text-foreground mb-4 text-6xl font-bold">404</p>
        <h1 className="text-foreground mb-2 text-2xl font-semibold">Page Not Found</h1>
        <p className="text-muted mb-8 text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-foreground text-background inline-flex h-9 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

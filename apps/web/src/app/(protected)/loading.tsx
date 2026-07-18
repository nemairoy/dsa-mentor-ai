export default function ProtectedLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-7 w-32 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-72 rounded-xl border border-border bg-card p-3 shadow-sm">
            <div className="h-5 w-40 animate-pulse rounded-full bg-muted" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 6 }).map((__, row) => (
                <div key={row} className="h-4 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

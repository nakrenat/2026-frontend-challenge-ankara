export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800 p-4 animate-pulse">
      <div className="h-4 w-1/2 rounded bg-slate-700" />
      <div className="h-3 w-3/4 rounded bg-slate-700" />
      <div className="h-3 w-1/3 rounded bg-slate-700" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

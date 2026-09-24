export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-xl bg-[var(--bg-muted)]" />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[var(--bg-muted)]" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-[var(--bg-muted)]" />
    </div>
  );
}

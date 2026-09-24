import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--bg-elev)] p-10 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Meeting not found</h1>
      <p className="mt-2 text-[var(--muted)]">That recording is not in the demo workspace.</p>
      <Link href="/meetings" className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline">
        Back to meetings
      </Link>
    </div>
  );
}

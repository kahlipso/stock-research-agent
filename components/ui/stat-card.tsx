export function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="panel p-4"><dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-2 text-xl font-semibold">{value}</dd>{note && <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>}</div>;
}

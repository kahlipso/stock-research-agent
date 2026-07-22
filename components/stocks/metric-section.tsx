export function MetricSection({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return <section className="panel p-5"><h2 className="text-lg font-bold">{title}</h2><dl className="mt-4 divide-y divide-[var(--border)]">{rows.map((row) => <div key={row.label} className="flex items-center justify-between gap-4 py-3"><dt className="text-sm text-[var(--muted)]">{row.label}</dt><dd className="text-right font-medium">{row.value}</dd></div>)}</dl></section>;
}

export function MockBanner({ source, retrievedAt }: { source: string; retrievedAt: string }) {
  return <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
    <strong>Mock data:</strong> Values are fictionalized for product development and must not be used as current market facts. <span className="muted">Source: {source} · Fixed dataset timestamp: {new Date(retrievedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</span>
  </div>;
}

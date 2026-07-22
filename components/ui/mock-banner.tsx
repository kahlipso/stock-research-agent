export function DataBanner({ source, retrievedAt, isMock }: { source: string; retrievedAt: string; isMock: boolean }) {
  return <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${isMock ? "border-amber-500/40 bg-amber-500/10" : "border-blue-500/30 bg-blue-500/5"}`}>
    <strong>{isMock ? "Mock data:" : "External market data:"}</strong> {isMock
      ? "Values are fictionalized for product development and must not be used as current market facts."
      : "Values come from an unofficial Yahoo Finance integration and may be delayed, incomplete, or unavailable."} <span className="muted">Source: {source} · Retrieved: {new Date(retrievedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</span>
  </div>;
}

export const MockBanner = DataBanner;

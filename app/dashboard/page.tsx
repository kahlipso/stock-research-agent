import { SystematicRankingTable } from "@/components/dashboard/systematic-ranking-table";
import { databaseConfigured } from "@/lib/database/prisma";
import { rankings, systemStatus } from "@/lib/database/research";
import { MODEL_V0 } from "@/lib/research/config";

export const dynamic = "force-dynamic";
const defaultQuery = { page: 1, pageSize: 25 };

export default async function DashboardPage() {
  const dbReady = databaseConfigured();
  const unavailableStatus = { status: "DATABASE_UNAVAILABLE", migrationPending: true, model: null, latestRun: null, latestScore: null, universe: null };
  const unavailableResult: Awaited<ReturnType<typeof rankings>> = { rows: [], total: 0, model: null };
  let status: Awaited<ReturnType<typeof systemStatus>> | typeof unavailableStatus = unavailableStatus;
  let result: Awaited<ReturnType<typeof rankings>> = unavailableResult;
  if (dbReady) {
    try { [status, result] = await Promise.all([systemStatus(), rankings(defaultQuery)]); }
    catch { status = unavailableStatus; result = unavailableResult; }
  }
  const rows = result.rows;
  const averageConfidence = rows.length ? rows.reduce((sum, row) => sum + (row.confidence ?? 0), 0) / rows.length : 0;
  const summary = [
    ["Eligible universe", String(status.universe ? result.total : 0)], ["Securities scored", String(result.total)],
    ["Candidates", String(rows.filter((row) => row.band === "CANDIDATE").length)], ["Average confidence", rows.length ? `${averageConfidence.toFixed(0)} / 100` : "—"],
    ["Latest ingestion", status.latestRun?.completedAt?.toISOString() ?? "Not completed"], ["Latest calculation", status.latestScore?.calculatedAt.toISOString() ?? "Not calculated"],
  ];
  return <main className="mx-auto max-w-[1700px] space-y-5 px-4 py-8 sm:px-6">
    <header><p className="text-sm font-semibold text-[var(--accent)]">SYSTEMATIC EQUITY RESEARCH</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Systematic Equity Research</h1><dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm muted"><div><dt className="inline font-medium text-[var(--foreground)]">Model: </dt><dd className="inline">{status.model?.modelKey ?? MODEL_V0.modelKey} {status.model?.version ?? "pending"}</dd></div><div><dt className="inline font-medium text-[var(--foreground)]">Target horizon: </dt><dd className="inline">{MODEL_V0.horizon}</dd></div><div><dt className="inline font-medium text-[var(--foreground)]">Universe: </dt><dd className="inline">{status.universe?.name ?? "Not initialized"}</dd></div><div><dt className="inline font-medium text-[var(--foreground)]">Data as of: </dt><dd className="inline">{status.latestScore?.dataAsOf.toISOString() ?? "Unavailable"}</dd></div><div><dt className="inline font-medium text-[var(--foreground)]">Scores calculated: </dt><dd className="inline">{status.latestScore?.calculatedAt.toISOString() ?? "Unavailable"}</dd></div></dl></header>
    <div role="status" className={`rounded-xl border p-4 text-sm ${rows.length ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"}`}><strong>{rows.length ? "Stored real-data rankings" : "Institutional model migration pending"}.</strong> {rows.length ? "Only non-mock, point-in-time factor snapshots are shown." : "No production ranking is displayed until real ingestion and factor calculation complete. Fixture rankings are blocked here."}</div>
    <section aria-label="Research system summary" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">{summary.map(([label, value]) => <div key={label} className="panel p-3"><p className="text-xs muted">{label}</p><p className="mt-1 truncate text-sm font-semibold" title={value}>{value}</p></div>)}</section>
    <SystematicRankingTable initialRows={rows} />
  </main>;
}

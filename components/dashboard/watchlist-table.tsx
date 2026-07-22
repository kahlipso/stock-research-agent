"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCurrency, formatDate, formatPercent, formatPercentPoints, formatSignedCurrency } from "@/lib/formatting";
import { DEFAULT_RESEARCH_SORT, filterAndRank, scoreLabel } from "@/lib/ranking/watchlist";
import type { ScoreBreakdown } from "@/lib/scoring";
import type { MarketStatus } from "@/lib/data-providers";
import { APP_NAME } from "@/lib/config/app";

export type WatchlistRow = {
  ticker: string; name: string; sector: string; currentPrice: number | null; previousClose: number | null;
  dailyChangeAmount: number | null; dailyChangePercent: number | null; marketStatus: MarketStatus;
  priceTimestamp: string; dataType: "MOCK" | "DELAYED" | "LIVE"; isMock: boolean; source: string;
  marketCap: number | null; revenueGrowth: number | null; fcfMargin: number | null;
  forwardPE: number | null; distanceHigh: number | null; totalScore: number; growthScore: number;
  profitabilityScore: number; balanceSheetScore: number; valuationScore: number;
  priceTrendScore: number; dataCompletenessScore: number; scoreBreakdown: ScoreBreakdown;
  updatedAt: string; missing: string[];
};
type SortKey = "currentPrice" | "dailyChangePercent" | "marketCap" | "revenueGrowth" | "fcfMargin" | "forwardPE" | "distanceHigh" | "totalScore" | "growthScore" | "valuationScore" | "updatedAt";
type ActiveSort = typeof DEFAULT_RESEARCH_SORT | SortKey;

const sortableHeaders: Array<[string, SortKey]> = [
  ["Score", "totalScore"], ["Price", "currentPrice"], ["Today", "dailyChangePercent"],
  ["Growth", "growthScore"], ["Valuation", "valuationScore"], ["Updated", "updatedAt"],
];
const marketLabel = (status: MarketStatus) => status.toLowerCase().replace("_", " ").replace(/^./, (value) => value.toUpperCase());
const movementClass = (value: number | null) => value === null || value === 0 ? "muted" : value > 0 ? "positive" : "negative";

export function WatchlistTable({ initialRows, databaseReady }: { initialRows: WatchlistRow[]; databaseReady: boolean }) {
  const [rows, setRows] = useState(initialRows); const [query, setQuery] = useState(""); const [sector, setSector] = useState("");
  const [minimum, setMinimum] = useState(0); const [sort, setSort] = useState<ActiveSort>(DEFAULT_RESEARCH_SORT); const [ascending, setAscending] = useState(false);
  const [ticker, setTicker] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const sectors = [...new Set(rows.map((row) => row.sector))].sort();
  const matches = (row: WatchlistRow) => `${row.ticker} ${row.name}`.toLowerCase().includes(query.toLowerCase()) && (!sector || row.sector === sector) && row.totalScore >= minimum;
  const filtered = rows.filter(matches);
  const visible = sort === DEFAULT_RESEARCH_SORT
    ? filterAndRank(rows, matches)
    : [...filtered].sort((a, b) => {
      const av = a[sort]; const bv = b[sort];
      if (av === null) return 1; if (bv === null) return -1;
      const difference = typeof av === "string" ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
      return difference * (ascending ? 1 : -1) || a.ticker.localeCompare(b.ticker);
    }).map((row, index) => ({ ...row, rank: index + 1 }));
  const chooseSort = (key: SortKey) => { if (sort === key) setAscending((value) => !value); else { setSort(key); setAscending(false); } };
  const resetSort = () => { setSort(DEFAULT_RESEARCH_SORT); setAscending(false); };

  async function mutate(method: "POST" | "DELETE", symbol: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/watchlist", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker: symbol }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? "Request failed");
      if (method === "DELETE") setRows((current) => current.filter((row) => row.ticker !== symbol));
      else { setMessage(`${symbol} was added. Reload to retrieve its mock research row.`); setTicker(""); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "The request failed."); } finally { setBusy(false); }
  }

  return <div className="space-y-4">
    <div className="panel grid gap-3 p-4 md:grid-cols-4">
      <label className="text-sm">Search ticker or company<input className="focus-ring mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="NVDA or NVIDIA" /></label>
      <label className="text-sm">Sector<select className="focus-ring mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2" value={sector} onChange={(event) => setSector(event.target.value)}><option value="">All sectors</option>{sectors.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="text-sm">Minimum score<input type="number" min="0" max="100" className="focus-ring mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" value={minimum} onChange={(event) => setMinimum(Number(event.target.value))} /></label>
      <form onSubmit={(event) => { event.preventDefault(); void mutate("POST", ticker.toUpperCase()); }}><label className="text-sm">Add ticker<div className="mt-1 flex gap-2"><input required pattern="[A-Za-z][A-Za-z.\-]{0,9}" className="focus-ring min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 uppercase" value={ticker} onChange={(event) => setTicker(event.target.value)} placeholder="Ticker" /><button disabled={busy || !databaseReady} className="focus-ring rounded-lg bg-blue-600 px-4 text-white disabled:cursor-not-allowed disabled:opacity-50">Add</button></div></label></form>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm muted">{sort === DEFAULT_RESEARCH_SORT ? "Ordered by research score, completeness, growth, then ticker." : `Manual sorting active: ${sort}.`}</p><button onClick={resetSort} disabled={sort === DEFAULT_RESEARCH_SORT} className="focus-ring rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm disabled:opacity-40">Reset sorting</button></div>
    {!databaseReady && <p className="text-sm warning">Watchlist changes are disabled until PostgreSQL is configured and seeded.</p>}
    {message && <p role="alert" className="text-sm">{message}</p>}
    <div className="panel overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-left text-sm"><caption className="sr-only">Stocks ranked by deterministic research score</caption><thead><tr className="border-b border-[var(--border)]">
      <th className="p-3">Rank</th><th className="p-3">Ticker</th><th className="p-3">Company</th>{sortableHeaders.map(([label, key]) => <th key={key} className="p-3"><button className="focus-ring rounded text-left hover:text-[var(--accent)]" onClick={() => chooseSort(key)} aria-label={`Sort by ${label}`}>{label}{sort === key ? (ascending ? " ↑" : " ↓") : ""}</button></th>)}<th className="p-3">Inspect</th>
    </tr></thead><tbody>{visible.map((row) => <tr key={row.ticker} className="border-b border-[var(--border)] align-top last:border-0">
      <td className="p-3 font-semibold">{row.rank}</td>
      <td className="p-3 font-bold"><Link className="focus-ring rounded text-[var(--accent)] hover:underline" href={`/stocks/${row.ticker}`}>{row.ticker}</Link><span className={`mt-1 block w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold ${row.isMock ? "bg-amber-500/15 warning" : "bg-blue-500/10 text-[var(--accent)]"}`}>{row.isMock ? "MOCK SCORE" : `${row.dataType} SCORE`}</span></td>
      <td className="p-3"><span className="font-medium">{row.name}</span><span className="mt-1 block text-xs muted">{row.sector}</span></td>
      <td className="p-3"><strong>{row.totalScore.toFixed(1)}/100</strong><span className="mt-1 block max-w-36 text-xs muted">{scoreLabel(row.totalScore)}</span></td>
      <td className="p-3"><strong>{formatCurrency(row.currentPrice)}</strong><span className="mt-1 block text-xs muted">Previous close {formatCurrency(row.previousClose)}</span><span className="block text-xs muted">{marketLabel(row.marketStatus)} · {row.dataType.toLowerCase()}</span></td>
      <td className={`p-3 font-medium ${movementClass(row.dailyChangeAmount)}`}>{formatSignedCurrency(row.dailyChangeAmount)}<span className="block">({formatPercentPoints(row.dailyChangePercent, true)}) today</span></td>
      <td className="p-3"><strong>{row.growthScore.toFixed(1)}/25</strong><span className="block text-xs muted">Revenue {formatPercent(row.revenueGrowth)}</span></td>
      <td className="p-3"><strong>{row.valuationScore.toFixed(1)}/20</strong><span className="block text-xs muted">Forward P/E {row.forwardPE?.toFixed(1) ?? "Missing"}</span></td>
      <td className="p-3 text-xs">{formatDate(row.updatedAt)}<span className="mt-1 block muted">Price: {formatDate(row.priceTimestamp)}</span></td>
      <td className="p-3"><details className="min-w-52"><summary className="focus-ring cursor-pointer rounded font-medium text-[var(--accent)]">Score breakdown</summary><dl className="mt-2 space-y-1 text-xs">{[
        ["Growth", row.growthScore, 25], ["Profitability & cash flow", row.profitabilityScore, 20],
        ["Balance-sheet strength", row.balanceSheetScore, 15], ["Valuation", row.valuationScore, 20],
        ["Price trend", row.priceTrendScore, 10], ["Data completeness", row.dataCompletenessScore, 10],
      ].map(([label, value, maximum]) => <div key={String(label)} className="flex justify-between gap-3"><dt>{label}</dt><dd>{Number(value).toFixed(1)}/{maximum}</dd></div>)}</dl><p className="mt-2 text-xs muted">{row.scoreBreakdown.disclaimer}</p>{row.missing.length > 0 && <p className="mt-2 text-xs warning"><strong>Missing:</strong> {row.missing.join(", ")}</p>}<Link href={`/stocks/${row.ticker}`} className="focus-ring mt-3 inline-block rounded border border-[var(--border)] px-2 py-1">Full details</Link></details><button disabled={busy || !databaseReady} onClick={() => void mutate("DELETE", row.ticker)} className="focus-ring mt-3 rounded text-xs negative disabled:opacity-40" aria-label={`Remove ${row.ticker}`}>Remove</button></td>
    </tr>)}</tbody></table>{visible.length === 0 && <div className="p-10 text-center muted">No companies in {APP_NAME} match these filters.</div>}</div>
  </div>;
}

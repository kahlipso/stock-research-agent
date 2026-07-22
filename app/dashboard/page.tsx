import { WatchlistTable, type WatchlistRow } from "@/components/dashboard/watchlist-table";
import { DataBanner } from "@/components/ui/mock-banner";
import { APP_NAME } from "@/lib/config/app";
import { getStockResearchData } from "@/lib/data-providers";
import { MOCK_COMPANIES, MOCK_META } from "@/lib/data-providers/mock-data";
import { databaseConfigured } from "@/lib/database/prisma";
import { listWatchlistTickers } from "@/lib/database/watchlist";
import { rankByResearchScore } from "@/lib/ranking/watchlist";
import { scoreStock } from "@/lib/scoring/from-stock";

export const dynamic = "force-dynamic";

async function buildWatchlistRow(ticker: string): Promise<WatchlistRow> {
  const data = await getStockResearchData(ticker);
  const latest = data.financials[0]; const prior = data.financials[1]; const score = scoreStock(data);
  return {
    ticker, name: data.profile.name, sector: data.profile.sector,
    currentPrice: data.market.currentPrice, previousClose: data.market.previousClose,
    dailyChangeAmount: data.market.dailyChangeAmount, dailyChangePercent: data.market.dailyChangePercent,
    marketStatus: data.market.marketStatus, priceTimestamp: data.market.priceTimestamp,
    dataType: data.market.dataType, isMock: data.market.isMock, source: data.market.source,
    marketCap: data.market.marketCap,
    revenueGrowth: latest?.revenueGrowth ?? (latest?.revenue && prior?.revenue ? latest.revenue / prior.revenue - 1 : null),
    fcfMargin: latest?.freeCashFlow && latest?.revenue ? latest.freeCashFlow / latest.revenue : null,
    forwardPE: data.valuation.forwardPE,
    distanceHigh: data.market.currentPrice && data.market.fiftyTwoWeekHigh ? data.market.currentPrice / data.market.fiftyTwoWeekHigh - 1 : null,
    totalScore: score.totalScore, growthScore: score.categories.growth.score,
    profitabilityScore: score.categories.profitability.score, balanceSheetScore: score.categories.balanceSheet.score,
    valuationScore: score.categories.valuation.score, priceTrendScore: score.categories.priceTrend.score,
    dataCompletenessScore: score.categories.dataCompleteness.score, scoreBreakdown: score,
    updatedAt: data.market.retrievedAt, missing: score.missingFields,
  };
}

export default async function DashboardPage() {
  let tickers = MOCK_COMPANIES.map((item) => item.ticker);
  const dbReady = databaseConfigured();
  if (dbReady) {
    try { const stored = await listWatchlistTickers(); if (stored.length) tickers = stored; }
    catch { /* Provider data can still render when the watchlist database is temporarily unavailable. */ }
  }

  const rows: WatchlistRow[] = []; const failures: string[] = [];
  for (let index = 0; index < tickers.length; index += 3) {
    const batch = tickers.slice(index, index + 3);
    const results = await Promise.allSettled(batch.map(buildWatchlistRow));
    results.forEach((result, resultIndex) => {
      if (result.status === "fulfilled") rows.push(result.value);
      else failures.push(batch[resultIndex]);
    });
  }

  const rankedRows = rankByResearchScore(rows);
  const average = rankedRows.length ? rankedRows.reduce((sum, row) => sum + row.totalScore, 0) / rankedRows.length : 0;
  const latestUpdate = rankedRows.reduce((latest, row) => row.updatedAt > latest ? row.updatedAt : latest, rankedRows[0]?.updatedAt ?? MOCK_META.retrievedAt);
  const summary = [
    { label: "Stocks tracked", value: String(rankedRows.length) },
    { label: "Highest ranked under current research metrics", value: rankedRows[0]?.ticker ?? "None" },
    { label: "Average research score", value: average.toFixed(1) },
    { label: "Scoring at least 80", value: String(rankedRows.filter((row) => row.totalScore >= 80).length) },
    { label: "Incomplete data", value: String(rankedRows.filter((row) => row.missing.length > 0).length) },
    { label: "Last dashboard update", value: `${new Date(latestUpdate).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "short", timeStyle: "short" })} UTC` },
  ];

  return <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-8 sm:px-6">
    <div><p className="text-sm font-semibold text-[var(--accent)]">PERSONAL RESEARCH WORKSPACE</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{APP_NAME}</h1><p className="mt-2 max-w-3xl text-[var(--muted)]">Compare companies with transparent deterministic scores. Scores organize research and do not predict future returns.</p></div>
    <DataBanner source={rankedRows[0]?.source ?? MOCK_META.source} retrievedAt={latestUpdate} isMock={rankedRows[0]?.isMock ?? true} />
    {failures.length > 0 && <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"><strong>Some external data was unavailable:</strong> {failures.join(", ")}. These companies were omitted rather than filled with mock values.</div>}
    <section aria-label="Dashboard summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{summary.map((item) => <div key={item.label} className="panel p-4"><p className="text-xs text-[var(--muted)]">{item.label}</p><p className="mt-1 font-semibold">{item.value}</p></div>)}</section>
    <WatchlistTable initialRows={rankedRows} databaseReady={dbReady} />
  </main>;
}

import { notFound } from "next/navigation";
import { PriceChart } from "@/components/charts/price-chart";
import { MetricSection } from "@/components/stocks/metric-section";
import { ResearchSections } from "@/components/stocks/research-sections";
import { ScoreBreakdown } from "@/components/stocks/score-breakdown";
import { DataBanner } from "@/components/ui/mock-banner";
import { StatCard } from "@/components/ui/stat-card";
import { getStockResearchData, PRICE_RANGES, type PriceRange } from "@/lib/data-providers";
import { marketDataProvider } from "@/lib/data-providers";
import { formatCurrency, formatDate, formatNumber, formatPercent, formatPercentPoints, formatSignedCurrency } from "@/lib/formatting";
import { scoreStock } from "@/lib/scoring/from-stock";
import { tickerSchema } from "@/lib/validation/watchlist";

export default async function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  const parsed = tickerSchema.safeParse((await params).ticker); if (!parsed.success) notFound();
  let data; try { data = await getStockResearchData(parsed.data); } catch { notFound(); }
  const histories = Object.fromEntries(await Promise.all(PRICE_RANGES.map(async (range) => [range, await marketDataProvider.getPriceHistory(parsed.data, range)]))) as Record<PriceRange, Awaited<ReturnType<typeof marketDataProvider.getPriceHistory>>>;
  const score = scoreStock(data); const latest = data.financials[0]; const prior = data.financials[1]; const oldest = data.financials[3];
  const revenueGrowth = latest?.revenueGrowth ?? (latest?.revenue && prior?.revenue ? latest.revenue / prior.revenue - 1 : null);
  const cagr = latest?.revenue && oldest?.revenue ? Math.pow(latest.revenue / oldest.revenue, 1 / 3) - 1 : null;
  const netCash = latest?.cash != null && latest?.debt != null ? latest.cash - latest.debt : null;
  const debtFcf = latest?.debt != null && latest?.freeCashFlow ? latest.debt / latest.freeCashFlow : null;
  const distanceHigh = data.market.currentPrice && data.market.fiftyTwoWeekHigh ? data.market.currentPrice / data.market.fiftyTwoWeekHigh - 1 : null;
  const movementClass = data.market.dailyChangeAmount === null || data.market.dailyChangeAmount === 0 ? "muted" : data.market.dailyChangeAmount > 0 ? "positive" : "negative";
  return <main className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 sm:px-6">
    <DataBanner source={data.profile.source} retrievedAt={data.profile.retrievedAt} isMock={data.profile.isMock} />
    <section><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--accent)]">{data.profile.sector} · {data.profile.industry}</p><h1 className="mt-1 text-3xl font-bold">{data.profile.name} <span className="muted">({data.profile.ticker})</span></h1><p className="mt-3 max-w-3xl text-sm leading-6 muted">{data.profile.description}</p></div><div className="text-right"><p className="text-3xl font-bold">{formatCurrency(data.market.currentPrice)}</p><p className={`font-medium ${movementClass}`}>{formatSignedCurrency(data.market.dailyChangeAmount)} ({formatPercentPoints(data.market.dailyChangePercent, true)}) today</p><p className="mt-1 text-xs muted">Previous close {formatCurrency(data.market.previousClose)} · {data.market.marketStatus.toLowerCase().replace("_", " ")} · {data.market.dataType.toLowerCase()}</p><p className="text-xs muted">Price timestamp {formatDate(data.market.priceTimestamp)}</p></div></div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Market capitalization" value={formatCurrency(data.market.marketCap, true)} /><StatCard label="Research score" value={`${score.totalScore.toFixed(1)} / 100`} note="Not a return prediction" /><StatCard label="Last data update" value={formatDate(data.market.retrievedAt)} /><StatCard label="Data source" value="Mock dataset" note={data.market.source} /></dl>
    </section>
    <section className="panel p-5"><h2 className="mb-5 text-xl font-bold">Price performance</h2><PriceChart histories={histories} ma50={data.market.fiftyDayMovingAverage} ma200={data.market.twoHundredDayMovingAverage} previousClose={data.market.previousClose} marketStatus={data.market.marketStatus} /><dl className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><StatCard label="50-day average" value={formatCurrency(data.market.fiftyDayMovingAverage)} /><StatCard label="200-day average" value={formatCurrency(data.market.twoHundredDayMovingAverage)} /><StatCard label="52-week high" value={formatCurrency(data.market.fiftyTwoWeekHigh)} /><StatCard label="52-week low" value={formatCurrency(data.market.fiftyTwoWeekLow)} /><StatCard label="From 52W high" value={formatPercent(distanceHigh)} /><StatCard label="Volume" value={formatNumber(data.market.volume)} /></dl></section>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <MetricSection title="Growth" rows={[{ label: "Revenue", value: formatCurrency(latest?.revenue ?? null, true) }, { label: "YoY revenue growth", value: formatPercent(revenueGrowth) }, { label: "Three-year revenue CAGR", value: formatPercent(cagr) }, { label: "Earnings growth", value: formatPercent(latest?.earningsGrowth ?? null) }, { label: "Free cash flow", value: formatCurrency(latest?.freeCashFlow ?? null, true) }, { label: "Free-cash-flow growth", value: formatPercent(latest?.freeCashFlowGrowth ?? null) }]} />
      <MetricSection title="Profitability" rows={[{ label: "Gross margin", value: formatPercent(latest?.grossMargin ?? null) }, { label: "Operating margin", value: formatPercent(latest?.operatingMargin ?? null) }, { label: "Net margin", value: formatPercent(latest?.netMargin ?? null) }, { label: "Free-cash-flow margin", value: formatPercent(latest?.freeCashFlow && latest?.revenue ? latest.freeCashFlow / latest.revenue : null) }, { label: "Return on invested capital", value: formatPercent(latest?.returnOnInvestedCapital ?? null) }]} />
      <MetricSection title="Balance sheet" rows={[{ label: "Cash", value: formatCurrency(latest?.cash ?? null, true) }, { label: "Total debt", value: formatCurrency(latest?.debt ?? null, true) }, { label: netCash != null && netCash >= 0 ? "Net cash" : "Net debt", value: formatCurrency(netCash != null ? Math.abs(netCash) : null, true) }, { label: "Current ratio", value: latest?.currentRatio != null ? `${latest.currentRatio.toFixed(2)}x` : "Missing" }, { label: "Debt / free cash flow", value: debtFcf != null ? `${debtFcf.toFixed(2)}x` : "Missing" }]} />
      <MetricSection title="Valuation" rows={[{ label: "Trailing P/E", value: data.valuation.trailingPE != null ? `${data.valuation.trailingPE.toFixed(1)}x` : "Missing" }, { label: "Forward P/E", value: data.valuation.forwardPE != null ? `${data.valuation.forwardPE.toFixed(1)}x` : "Missing" }, { label: "Price-to-sales", value: data.valuation.priceToSales != null ? `${data.valuation.priceToSales.toFixed(1)}x` : "Missing" }, { label: "Price-to-free-cash-flow", value: data.valuation.priceToFreeCashFlow != null ? `${data.valuation.priceToFreeCashFlow.toFixed(1)}x` : "Missing" }, { label: "EV / EBITDA", value: data.valuation.evToEbitda != null ? `${data.valuation.evToEbitda.toFixed(1)}x` : "Missing" }]} />
    </div>
    <ScoreBreakdown score={score} /><ResearchSections />
  </main>;
}

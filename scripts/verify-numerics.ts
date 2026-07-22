/** Read-only independent reconciliation against stored source data. */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ticker = (process.argv[2] ?? "AMD").trim().toUpperCase();
const tolerance = 1e-8;
const n = (value: { toString(): string } | bigint | null | undefined) => value == null ? null : Number(value.toString());
const ratio = (left: number | null, right: number | null) => left == null || right == null || Math.abs(right) <= 1e-9 ? null : left / right;
const growth = (current: number | null, prior: number | null) => current == null || prior == null || prior <= 0 || current < 0 ? null : current / prior - 1;
const cagr = (current: number | null, prior: number | null, years: number) => current == null || prior == null || current <= 0 || prior <= 0 ? null : Math.pow(current / prior, 1 / years) - 1;
const priceReturn = (prices: number[], endOffset: number, startOffset: number) => prices.at(-(endOffset + 1))! / prices.at(-(startOffset + 1))! - 1;
const returns = (prices: number[]) => prices.slice(1).map((price, index) => price / prices[index] - 1);
const deviation = (values: number[]) => { const mean = values.reduce((a, b) => a + b, 0) / values.length; return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)); };
const drawdown = (prices: number[]) => { let peak = prices[0], minimum = 0; for (const price of prices) { peak = Math.max(peak, price); minimum = Math.min(minimum, price / peak - 1); } return minimum; };

async function main() {
  const company = await prisma.company.findUniqueOrThrow({ where: { ticker }, select: { id: true } });
  const latestScore = await prisma.factorScoreSnapshot.findFirstOrThrow({ where: { companyId: company.id, isMock: false }, orderBy: [{ asOfDate: "desc" }, { calculatedAt: "desc" }], select: { asOfDate: true, alphaScore: true, qualityScore: true, growthScore: true, valueScore: true, momentumScore: true } });
  const [facts, bars, market, stored, risk] = await Promise.all([
    prisma.financialFact.findMany({ where: { companyId: company.id, isMock: false, publishedAt: { lte: latestScore.asOfDate }, retrievedAt: { lte: latestScore.asOfDate } }, select: { metricKey: true, value: true, periodEnd: true, periodType: true, publishedAt: true, retrievedAt: true } }),
    prisma.priceBar.findMany({ where: { companyId: company.id, isMock: false, interval: "1d", timestamp: { lte: latestScore.asOfDate }, retrievedAt: { lte: latestScore.asOfDate } }, orderBy: { timestamp: "desc" }, take: 800, select: { timestamp: true, adjustedClose: true, close: true } }).then((rows) => rows.reverse()),
    prisma.marketSnapshot.findFirst({ where: { companyId: company.id, timestamp: { lte: latestScore.asOfDate } }, orderBy: { timestamp: "desc" }, select: { marketCap: true } }),
    prisma.featureSnapshot.findMany({ where: { companyId: company.id, asOfDate: latestScore.asOfDate }, select: { featureKey: true, value: true } }),
    prisma.riskMetricSnapshot.findUnique({ where: { companyId_asOfDate_modelVersion: { companyId: company.id, asOfDate: latestScore.asOfDate, modelVersion: "1.0.0" } }, select: { volatility60d: true, maximumDrawdown: true } }),
  ]);
  const series = (key: string, periodType: "ANNUAL" | "INSTANT") => { const byPeriod = new Map<number, typeof facts[number]>(); for (const fact of facts.filter((item) => item.metricKey === key && item.periodType === periodType)) { const period = fact.periodEnd.getTime(), existing = byPeriod.get(period); if (!existing || fact.publishedAt > existing.publishedAt || (fact.publishedAt.getTime() === existing.publishedAt.getTime() && fact.retrievedAt > existing.retrievedAt)) byPeriod.set(period, fact); } return [...byPeriod.values()].sort((a, b) => b.periodEnd.getTime() - a.periodEnd.getTime()).map((fact) => n(fact.value)!); };
  const revenue = series("revenue", "ANNUAL"), gross = series("gross_profit", "ANNUAL"), net = series("net_income", "ANNUAL"), assets = series("assets", "INSTANT"), ocf = series("operating_cash_flow", "ANNUAL"), capex = series("capital_expenditure", "ANNUAL");
  const prices = bars.map((bar) => n(bar.adjustedClose ?? bar.close)!), fcf = ocf[0] == null || capex[0] == null ? null : ocf[0] - Math.abs(capex[0]), marketCap = n(market?.marketCap), averageAssets = assets.length >= 2 ? (assets[0] + assets[1]) / 2 : null;
  const independent: Record<string, number | null> = {
    gross_margin: ratio(gross[0] ?? null, revenue[0] ?? null), roa: ratio(net[0] ?? null, averageAssets),
    revenue_growth_1y: growth(revenue[0] ?? null, revenue[1] ?? null), revenue_cagr_3y: cagr(revenue[0] ?? null, revenue[3] ?? null, 3),
    earnings_yield: marketCap && net[0] > 0 ? net[0] / marketCap : null, fcf_yield: marketCap && fcf != null ? fcf / marketCap : null,
    return_1m: prices.length >= 22 ? priceReturn(prices, 0, 21) : null, return_3m: prices.length >= 64 ? priceReturn(prices, 0, 63) : null, momentum_12_1: prices.length >= 253 ? priceReturn(prices, 21, 252) : null,
    volatility_60d: prices.length >= 61 ? deviation(returns(prices.slice(-61))) * Math.sqrt(252) : null, maximum_drawdown: prices.length ? drawdown(prices.slice(-252)) : null,
  };
  const storedByKey = new Map<string, number | null>(stored.map((feature) => [feature.featureKey, n(feature.value)]));
  storedByKey.set("volatility_60d", n(risk?.volatility60d)); storedByKey.set("maximum_drawdown", n(risk?.maximumDrawdown));
  const rows = Object.entries(independent).map(([metric, calculated]) => {
    const storedValue = storedByKey.get(metric) ?? null;
    const absoluteDifference = typeof calculated === "number" && typeof storedValue === "number" ? Math.abs(calculated - storedValue) : null;
    const relativeDifference = absoluteDifference == null || typeof calculated !== "number" || calculated === 0 ? null : absoluteDifference / Math.abs(calculated);
    return { metric, storedValue, independentlyCalculated: calculated, absoluteDifference, relativeDifference, tolerance, result: calculated == null && storedValue == null ? "PASS" : absoluteDifference != null && absoluteDifference <= tolerance ? "PASS" : "FAIL" };
  });
  const factors = { quality: n(latestScore.qualityScore), growth: n(latestScore.growthScore), value: n(latestScore.valueScore), momentum: n(latestScore.momentumScore) }, independentAlpha = factors.quality == null || factors.growth == null || factors.value == null || factors.momentum == null ? null : factors.quality * .30 + factors.growth * .25 + factors.value * .20 + factors.momentum * .25;
  console.log(JSON.stringify({ ticker, asOfDate: latestScore.asOfDate, rows, alpha: { stored: n(latestScore.alphaScore), independentlyCalculated: independentAlpha, absoluteDifference: independentAlpha == null ? null : Math.abs(independentAlpha - n(latestScore.alphaScore)!) } }, null, 2));
}

main().finally(() => prisma.$disconnect());

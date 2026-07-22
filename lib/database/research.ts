import { prisma } from "./prisma";
import type { z } from "zod";
import type { rankingsQuerySchema } from "@/lib/validation/research";
type Query = z.infer<typeof rankingsQuerySchema>;
const number = (value: { toNumber(): number } | null) => value?.toNumber() ?? null;

export async function latestModel() { return prisma.factorModelVersion.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }); }
export async function systemStatus() {
  const [model, latestIngestionRun, latestRun, latestScore, universe] = await Promise.all([
    latestModel(), prisma.dataIngestionRun.findFirst({ orderBy: { startedAt: "desc" } }), prisma.modelCalculationRun.findFirst({ orderBy: { startedAt: "desc" }, include: { modelVersion: true } }),
    prisma.factorScoreSnapshot.findFirst({ where: { isMock: false }, orderBy: { calculatedAt: "desc" } }),
    prisma.investmentUniverse.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return { model, latestIngestionRun, latestRun, latestScore, universe, migrationPending: !latestScore, status: !latestScore ? "NO_MODEL_SCORES" : latestRun?.status !== "COMPLETED" ? "STALE_LAST_KNOWN_VALID" : "CURRENT" };
}
export async function rankings(query: Query) {
  const model = await latestModel(); if (!model) return { rows: [], total: 0, model: null };
  const officialRun = await prisma.modelCalculationRun.findFirst({ where: { modelVersionId: model.id, status: "COMPLETED" }, orderBy: { asOfDate: "desc" }, select: { asOfDate: true } });
  const latest = officialRun ?? await prisma.factorScoreSnapshot.findFirst({ where: { modelVersionId: model.id, isMock: false }, orderBy: { asOfDate: "desc" }, select: { asOfDate: true } });
  if (!latest) return { rows: [], total: 0, model };
  const where = { modelVersionId: model.id, asOfDate: latest.asOfDate, isMock: false, alphaScore: { not: null, gte: query.minAlpha }, confidenceScore: { gte: query.minConfidence }, candidateBand: query.band,
    company: { sector: query.sector, industry: query.industry, ...(query.watchlist ? { watchlistItem: query.watchlist === "true" ? { isNot: null } : null } : {}) },
    riskScore: query.risk ? { not: null } : undefined, liquidityScore: query.liquidity ? { not: null } : undefined };
  const [items, total] = await Promise.all([prisma.factorScoreSnapshot.findMany({ where, include: { company: { include: { watchlistItem: true, analyses: { orderBy: { generatedAt: "desc" }, take: 1 } } }, modelVersion: true }, orderBy: [{ alphaScore: "desc" }, { confidenceScore: "desc" }, { liquidityScore: "desc" }, { company: { ticker: "asc" } }], skip: (query.page - 1) * query.pageSize, take: query.pageSize }), prisma.factorScoreSnapshot.count({ where })]);
  return { total, model, asOfDate: latest.asOfDate.toISOString(), rows: items.map((item, index) => ({ rank: (query.page - 1) * query.pageSize + index + 1, ticker: item.company.ticker, company: item.company.name, sector: item.company.sector, industry: item.company.industry, watchlist: Boolean(item.company.watchlistItem), alpha: number(item.alphaScore), quality: number(item.qualityScore), value: number(item.valueScore), growth: number(item.growthScore), momentum: number(item.momentumScore), confidence: number(item.confidenceScore), risk: number(item.riskScore), liquidity: number(item.liquidityScore), industryPercentile: number(item.industryPercentile), universePercentile: number(item.universePercentile), band: item.candidateBand, calculatedAt: item.calculatedAt.toISOString(), dataAsOf: item.dataAsOf.toISOString(), priceAsOf: item.priceAsOf?.toISOString() ?? null, warnings: item.warnings, contributions: item.factorContributions, analysis: item.company.analyses[0] ? { summary: item.company.analyses[0].summary, generatedAt: item.company.analyses[0].generatedAt.toISOString(), dataAsOf: item.company.analyses[0].dataAsOf.toISOString(), stale: Boolean(item.company.analyses[0].staleAt && item.company.analyses[0].staleAt <= new Date()) } : null })) };
}

export async function stockResearch(ticker: string) {
  const company = await prisma.company.findUnique({ where: { ticker }, include: { watchlistItem: true, universeMemberships: { where: { effectiveTo: null }, include: { universe: true } }, priceBars: { where: { isMock: false }, orderBy: { timestamp: "desc" }, take: 400 }, filings: { where: { isMock: false }, orderBy: { acceptedAt: "desc" }, take: 1 }, factorScores: { where: { isMock: false }, orderBy: { asOfDate: "desc" }, take: 31, include: { modelVersion: true } }, normalizedFeatures: { orderBy: { asOfDate: "desc" }, take: 100 }, featureSnapshots: { orderBy: { asOfDate: "desc" }, take: 100 }, analyses: { orderBy: { generatedAt: "desc" }, take: 1 } } });
  return company;
}

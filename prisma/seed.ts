import { PrismaClient } from "@prisma/client";
import { MOCK_COMPANIES } from "../lib/data-providers/mock-data";
import { DEFAULT_UNIVERSE_RULES, MODEL_V0, MODEL_V1_INACTIVE } from "../lib/research/config";

const prisma = new PrismaClient();
async function main() {
  const universe = await prisma.investmentUniverse.upsert({ where: { name: "Liquid U.S. Research Universe" }, update: { modelKey: MODEL_V0.modelKey, ruleVersion: DEFAULT_UNIVERSE_RULES.version, rules: DEFAULT_UNIVERSE_RULES }, create: { name: "Liquid U.S. Research Universe", description: "Configurable liquid U.S.-listed equities and ADRs. Initial members mirror the development watchlist pending security-master ingestion.", modelKey: MODEL_V0.modelKey, ruleVersion: DEFAULT_UNIVERSE_RULES.version, rules: DEFAULT_UNIVERSE_RULES } });
  await prisma.factorModelVersion.upsert({ where: { modelKey_version: { modelKey: MODEL_V0.modelKey, version: MODEL_V0.version } }, update: { active: true, weights: MODEL_V0.weights, configuration: { minimumFactorCompleteness: MODEL_V0.minimumFactorCompleteness } }, create: { modelKey: MODEL_V0.modelKey, version: MODEL_V0.version, name: MODEL_V0.name, horizon: MODEL_V0.horizon, weights: MODEL_V0.weights, configuration: { minimumFactorCompleteness: MODEL_V0.minimumFactorCompleteness }, active: true } });
  await prisma.factorModelVersion.upsert({ where: { modelKey_version: { modelKey: MODEL_V1_INACTIVE.modelKey, version: MODEL_V1_INACTIVE.version } }, update: { active: false }, create: { modelKey: MODEL_V1_INACTIVE.modelKey, version: MODEL_V1_INACTIVE.version, name: "Multifactor model with earnings revisions (inactive)", horizon: MODEL_V0.horizon, weights: MODEL_V1_INACTIVE.weights, configuration: { activationRequirement: "Dependable point-in-time revisions provider" }, active: false } });
  const allowFixtures = process.env.NODE_ENV !== "production" && process.env.ALLOW_MOCK_DATA === "true";
  if (allowFixtures) for (const item of MOCK_COMPANIES) {
    const company = await prisma.company.upsert({
      where: { ticker: item.ticker },
      update: { name: item.name, sector: item.sector, industry: item.industry, description: item.description },
      create: { ticker: item.ticker, name: item.name, sector: item.sector, industry: item.industry, description: item.description },
    });
    await prisma.watchlistItem.upsert({ where: { companyId: company.id }, update: {}, create: { companyId: company.id, status: "RESEARCHING" } });
  }
  const existingCompanies = await prisma.company.findMany({ where: { active: true }, select: { id: true } });
  for (const company of existingCompanies) { const membership = await prisma.universeMembership.findFirst({ where: { universeId: universe.id, companyId: company.id, effectiveTo: null } }); if (!membership) await prisma.universeMembership.create({ data: { universeId: universe.id, companyId: company.id, effectiveFrom: new Date("2026-07-22T00:00:00.000Z"), source: "EXISTING_SECURITY_MASTER", retrievedAt: new Date() } }); }
}
main().finally(() => prisma.$disconnect());

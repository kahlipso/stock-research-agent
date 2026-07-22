import { prisma } from "./prisma";
import { marketDataProvider } from "@/lib/data-providers/mock-provider";

export async function listWatchlistTickers() {
  const items = await prisma.watchlistItem.findMany({ include: { company: true }, orderBy: { addedAt: "asc" } });
  return items.map((item: { company: { ticker: string } }) => item.company.ticker);
}

export async function addWatchlistTicker(ticker: string) {
  const profile = await marketDataProvider.getCompanyProfile(ticker);
  const company = await prisma.company.upsert({
    where: { ticker: profile.ticker },
    update: { name: profile.name, sector: profile.sector, industry: profile.industry, description: profile.description },
    create: { ticker: profile.ticker, name: profile.name, sector: profile.sector, industry: profile.industry, description: profile.description },
  });
  return prisma.watchlistItem.upsert({ where: { companyId: company.id }, update: {}, create: { companyId: company.id } });
}

export async function removeWatchlistTicker(ticker: string) {
  const company = await prisma.company.findUnique({ where: { ticker } });
  if (!company) return false;
  const deleted = await prisma.watchlistItem.deleteMany({ where: { companyId: company.id } });
  return deleted.count > 0;
}

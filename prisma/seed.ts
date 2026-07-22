import { PrismaClient } from "@prisma/client";
import { MOCK_COMPANIES } from "../lib/data-providers/mock-data";

const prisma = new PrismaClient();
async function main() {
  for (const item of MOCK_COMPANIES) {
    const company = await prisma.company.upsert({
      where: { ticker: item.ticker },
      update: { name: item.name, sector: item.sector, industry: item.industry, description: item.description },
      create: { ticker: item.ticker, name: item.name, sector: item.sector, industry: item.industry, description: item.description },
    });
    await prisma.watchlistItem.upsert({ where: { companyId: company.id }, update: {}, create: { companyId: company.id, status: "RESEARCHING" } });
  }
}
main().finally(() => prisma.$disconnect());

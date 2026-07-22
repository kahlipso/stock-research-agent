import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { buildFundamentalFeatures, comparableSeries, type ResearchFact } from "../lib/research/engine";

const fact=(metricKey:string,value:number,periodEnd:string,periodType:string,publishedAt:string,retrievedAt=publishedAt):ResearchFact=>({metricKey,value:new Prisma.Decimal(value),periodStart:null,periodEnd:new Date(periodEnd),periodType,publishedAt:new Date(publishedAt),retrievedAt:new Date(retrievedAt),provider:"TEST",isRestated:false});

describe("point-in-time fundamental alignment",()=>{
  it("does not mix a newer quarter into annual growth",()=>{const facts=[fact("revenue",30,"2026-03-31","QUARTERLY","2026-05-01"),fact("revenue",120,"2025-12-31","ANNUAL","2026-02-01"),fact("revenue",100,"2024-12-31","ANNUAL","2025-02-01")];expect(buildFundamentalFeatures(facts,null).revenue_growth_1y.value).toBeCloseTo(.2)});
  it("chooses the latest available vintage for the same period",()=>{const facts=[fact("revenue",100,"2025-12-31","ANNUAL","2026-01-01"),fact("revenue",110,"2025-12-31","ANNUAL","2026-02-01")];expect(Number(comparableSeries(facts,"revenue")[0].value)).toBe(110)});
  it("uses average assets for ROA",()=>{const facts=[fact("net_income",20,"2025-12-31","ANNUAL","2026-02-01"),fact("assets",220,"2025-12-31","INSTANT","2026-02-01"),fact("assets",180,"2024-12-31","INSTANT","2025-02-01")];expect(buildFundamentalFeatures(facts,null).roa.value).toBeCloseTo(.1)});
});

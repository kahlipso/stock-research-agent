import { z } from "zod";
export const rankingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25),
  sector: z.string().max(100).optional(), industry: z.string().max(150).optional(), minAlpha: z.coerce.number().min(0).max(100).optional(),
  minConfidence: z.coerce.number().min(0).max(100).optional(), risk: z.string().max(30).optional(), liquidity: z.string().max(30).optional(), band: z.string().max(30).optional(), watchlist: z.enum(["true", "false"]).optional(),
}).strict();


import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { getStockResearchData } from "@/lib/data-providers";
import { scoreStock } from "@/lib/scoring/from-stock";
import { tickerSchema } from "@/lib/validation/watchlist";

export async function GET(_request: Request, context: { params: Promise<{ ticker: string }> }) {
  const parsed = tickerSchema.safeParse((await context.params).ticker);
  if (!parsed.success) return apiError("INVALID_TICKER", "Enter a valid ticker symbol.", 400);
  try {
    const stock = await getStockResearchData(parsed.data);
    return NextResponse.json({ data: { ...stock, score: scoreStock(stock) } });
  } catch { return apiError("STOCK_NOT_FOUND", "No mock dataset is available for this ticker.", 404); }
}

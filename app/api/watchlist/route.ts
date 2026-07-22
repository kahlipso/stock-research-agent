import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MOCK_COMPANIES } from "@/lib/data-providers/mock-data";
import { apiError } from "@/lib/api-response";
import { databaseConfigured } from "@/lib/database/prisma";
import { addWatchlistTicker, listWatchlistTickers, removeWatchlistTicker } from "@/lib/database/watchlist";
import { addWatchlistSchema, removeWatchlistSchema } from "@/lib/validation/watchlist";

const unavailable = () => apiError("DATABASE_REQUIRED", "Configure DATABASE_URL and run the migration to change the watchlist.", 503);

export async function GET() {
  try {
    if (!databaseConfigured()) return NextResponse.json({ data: MOCK_COMPANIES.map((item) => item.ticker), isMock: true });
    return NextResponse.json({ data: await listWatchlistTickers(), isMock: false });
  } catch { return apiError("WATCHLIST_READ_FAILED", "The watchlist could not be loaded.", 500); }
}
export async function POST(request: Request) {
  if (!databaseConfigured()) return unavailable();
  try {
    const { ticker } = addWatchlistSchema.parse(await request.json());
    await addWatchlistTicker(ticker);
    return NextResponse.json({ data: { ticker } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return apiError("INVALID_INPUT", "The request is invalid.", 400, error.flatten().fieldErrors);
    if (error instanceof SyntaxError) return apiError("INVALID_JSON", "The request body must be valid JSON.", 400);
    return apiError("WATCHLIST_ADD_FAILED", "The ticker could not be added or has no mock profile.", 500);
  }
}
export async function DELETE(request: Request) {
  if (!databaseConfigured()) return unavailable();
  try {
    const { ticker } = removeWatchlistSchema.parse(await request.json());
    const removed = await removeWatchlistTicker(ticker);
    if (!removed) return apiError("NOT_FOUND", "The ticker is not in the watchlist.", 404);
    return NextResponse.json({ data: { ticker } });
  } catch (error) {
    if (error instanceof ZodError) return apiError("INVALID_INPUT", "The request is invalid.", 400, error.flatten().fieldErrors);
    if (error instanceof SyntaxError) return apiError("INVALID_JSON", "The request body must be valid JSON.", 400);
    return apiError("WATCHLIST_DELETE_FAILED", "The ticker could not be removed.", 500);
  }
}

import { z } from "zod";

export const tickerSchema = z.string().trim().toUpperCase().regex(/^[A-Z][A-Z.-]{0,9}$/, "Enter a valid ticker symbol");
export const addWatchlistSchema = z.object({ ticker: tickerSchema }).strict();
export const removeWatchlistSchema = z.object({ ticker: tickerSchema }).strict();

import { z } from "zod";
const timestamp = z.string().datetime();
export const lineageSchema = z.object({ provider: z.string().min(1), sourceIdentifier: z.string().nullable(), retrievedAt: timestamp, effectiveAt: timestamp.nullable(), publishedAt: timestamp.nullable(), isMock: z.boolean() });
const positive = z.number().finite().positive();
export const priceBarRecordSchema = lineageSchema.extend({ ticker: z.string().min(1), timestamp, interval: z.literal("1d"), open: positive, high: positive, low: positive, close: positive, adjustedClose: positive.nullable(), volume: z.number().finite().nonnegative().nullable() }).superRefine((bar, context) => {
  if (bar.high < Math.max(bar.open, bar.close) || bar.low > Math.min(bar.open, bar.close) || bar.high < bar.low) context.addIssue({ code: "custom", message: "Invalid OHLC price ordering" });
});
export const financialFactRecordSchema = lineageSchema.extend({ ticker: z.string().min(1), accessionNumber: z.string().nullable(), metricKey: z.string().min(1), value: z.string().regex(/^-?\d+(\.\d+)?$/), unit: z.string().min(1), periodStart: timestamp.nullable(), periodEnd: timestamp, fiscalYear: z.number().int().nullable(), fiscalQuarter: z.string().nullable(), periodType: z.enum(["ANNUAL", "QUARTERLY", "INSTANT"]), isRestated: z.boolean() });


export type DailyChange = { dailyChangeAmount: number | null; dailyChangePercent: number | null };

export function calculateDailyChange(currentPrice: number | null, previousClose: number | null): DailyChange {
  if (currentPrice === null || previousClose === null || !Number.isFinite(currentPrice) || !Number.isFinite(previousClose)) {
    return { dailyChangeAmount: null, dailyChangePercent: null };
  }
  const dailyChangeAmount = Math.round((currentPrice - previousClose) * 100) / 100;
  const dailyChangePercent = previousClose !== 0
    ? Math.round(((currentPrice - previousClose) / previousClose) * 100 * 100) / 100
    : null;
  return { dailyChangeAmount, dailyChangePercent };
}

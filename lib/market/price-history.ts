import type { PricePoint } from "@/lib/data-providers/types";

export function normalizePriceHistory(points: PricePoint[]): PricePoint[] {
  const unique = new Map<string, PricePoint>();
  for (const point of points) {
    if (!point.timestamp || !Number.isFinite(point.price)) continue;
    const time = Date.parse(point.timestamp);
    if (!Number.isFinite(time)) continue;
    unique.set(new Date(time).toISOString(), { ...point, timestamp: new Date(time).toISOString() });
  }
  return [...unique.values()].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

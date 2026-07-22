"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketStatus, PricePoint, PriceRange } from "@/lib/data-providers";
import { PRICE_RANGES } from "@/lib/data-providers";
import { normalizePriceHistory } from "@/lib/market/price-history";

type Props = {
  histories: Record<PriceRange, PricePoint[]>;
  ma50: number | null;
  ma200: number | null;
  previousClose: number | null;
  marketStatus: MarketStatus;
};

const tickLabel = (timestamp: string, intraday: boolean) => new Intl.DateTimeFormat("en-US", intraday
  ? { hour: "numeric", minute: "2-digit", timeZone: "UTC" }
  : { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(timestamp));

export function PriceChart({ histories, ma50, ma200, previousClose, marketStatus }: Props) {
  const [range, setRange] = useState<PriceRange>("1Y");
  const data = normalizePriceHistory(histories[range]);
  const intraday = range === "1D";
  return <div><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2" aria-label="Price chart range">{PRICE_RANGES.map((item) => <button key={item} onClick={() => setRange(item)} aria-pressed={range === item} className={`focus-ring rounded-lg px-3 py-1.5 text-sm ${range === item ? "bg-blue-600 text-white" : "border border-[var(--border)]"}`}>{item}</button>)}</div><span className="text-sm muted">Market status: {marketStatus.toLowerCase().replace("_", " ")}</span></div>
    <div className="h-[360px] w-full" role="img" aria-label={`${range} mock price chart rendered with straight line segments`}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 8 }}><CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" opacity={.45} /><XAxis dataKey="timestamp" minTickGap={40} tick={{ fontSize: 11 }} tickFormatter={(value) => tickLabel(String(value), intraday)} /><YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} width={58} /><Tooltip contentStyle={{ background: "var(--panel)", borderColor: "var(--border)", borderRadius: 8 }} labelFormatter={(value) => new Date(String(value)).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC"} formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]} />
      <Line type="linear" dataKey="price" name="Price" stroke="var(--accent)" dot={false} strokeWidth={1.75} isAnimationActive={false} connectNulls={false} />
      {intraday && previousClose !== null && <ReferenceLine y={previousClose} stroke="var(--muted)" strokeDasharray="5 4" label={{ value: `Previous close $${previousClose.toFixed(2)}`, position: "insideTopLeft", fill: "var(--muted)", fontSize: 11 }} />}
      {!intraday && ma50 !== null && <ReferenceLine y={ma50} stroke="#d97706" strokeDasharray="5 4" label={{ value: "50-day MA", fill: "#d97706", fontSize: 11 }} />}
      {!intraday && ma200 !== null && <ReferenceLine y={ma200} stroke="#7c3aed" strokeDasharray="5 4" label={{ value: "200-day MA", fill: "#7c3aed", fontSize: 11 }} />}
    </LineChart></ResponsiveContainer></div>
    <p className="mt-2 text-xs text-[var(--muted)]">Mock observations are plotted chronologically with straight point-to-point segments. No smoothing, interpolation, or animation is applied.</p></div>;
}

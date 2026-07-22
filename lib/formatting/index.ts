const valid = (value: number | null | undefined): value is number => value != null && Number.isFinite(value);
export const formatCurrency = (value: number | null, compact = false) => valid(value)
  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: compact ? 1 : 2, notation: compact ? "compact" : "standard" }).format(value)
  : "Missing";
export const formatNumber = (value: number | null, suffix = "") => valid(value) ? `${value.toFixed(1)}${suffix}` : "Missing";
export const formatPercent = (value: number | null, signed = false) => valid(value)
  ? new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1, signDisplay: signed ? "always" : "auto" }).format(value)
  : "Missing";
export const formatPercentPoints = (value: number | null, signed = false) => valid(value)
  ? `${signed && value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  : "Missing";
export const formatSignedCurrency = (value: number | null) => valid(value)
  ? `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`
  : "Missing";
export const formatDate = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));

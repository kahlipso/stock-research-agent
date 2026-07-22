const returns = (prices: number[]) => prices.slice(1).flatMap((price, index) => prices[index] > 0 ? [price / prices[index] - 1] : []);
const standardDeviation = (values: number[]) => {
  if (values.length < 2) return null; const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
};
export const annualizedVolatility = (prices: number[]) => { const value = standardDeviation(returns(prices)); return value == null ? null : value * Math.sqrt(252); };
export const maximumDrawdown = (prices: number[]) => {
  if (!prices.length) return null; let peak = prices[0]; let drawdown = 0;
  prices.forEach((price) => { peak = Math.max(peak, price); drawdown = Math.min(drawdown, price / peak - 1); }); return drawdown;
};
export function riskClassification(volatility: number | null) { if (volatility == null) return "INSUFFICIENT_DATA"; if (volatility < .20) return "LOW"; if (volatility < .35) return "MODERATE"; if (volatility < .55) return "HIGH"; return "VERY_HIGH"; }


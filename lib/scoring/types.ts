export type ScoreInput = {
  revenueGrowth: number | null; threeYearRevenueCagr: number | null; earningsGrowth: number | null;
  grossMargin: number | null; operatingMargin: number | null; freeCashFlowMargin: number | null;
  cash: number | null; debt: number | null; freeCashFlow: number | null; currentRatio: number | null;
  forwardPE: number | null; priceToSales: number | null; priceToFreeCashFlow: number | null;
  price: number | null; fiftyDayMovingAverage: number | null; twoHundredDayMovingAverage: number | null;
  fiftyTwoWeekHigh: number | null;
};
export type MetricScore = { label: string; score: number | null; maximum: number; explanation: string };
export type CategoryScore = { score: number; maximum: number; explanation: string; metrics: MetricScore[] };
export type ScoreBreakdown = {
  totalScore: number; maximum: 100; categories: {
    growth: CategoryScore; profitability: CategoryScore; balanceSheet: CategoryScore;
    valuation: CategoryScore; priceTrend: CategoryScore; dataCompleteness: CategoryScore;
  }; missingFields: string[]; disclaimer: string; calculatedAt: string;
};

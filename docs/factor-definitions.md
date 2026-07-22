# Factor definitions

All values are null when inputs/history are unavailable. Financial facts may be used only after publication and retrieval.

| Name / key | Definition and formula | Inputs | Direction | Applicability / history | Source and limitations |
|---|---|---|---|---|---|
| Gross profitability / `gross_profitability` | Gross profit / assets | gross profit, assets | Higher | Non-financials | SEC; asset-period alignment required |
| Margins / `gross_margin`, `operating_margin`, `net_margin`, `fcf_margin` | respective profit or cash flow / revenue | income/cash-flow facts | Higher | Applicable industries | SEC; FCF = OCF − capex |
| ROA / `roa` | net income / average assets | net income, assets | Higher | All | Approximation |
| Cash conversion / `ocf_to_net_income` | OCF / net income | OCF, net income | Higher | All | Null for zero denominator |
| Accruals / `accruals_ratio` | (net income − OCF) / average assets | income, OCF, assets | Lower | All | Period alignment required |
| Leverage / `net_debt_to_ebitda` | (debt − cash) / EBITDA | debt, cash, EBITDA | Lower | Non-financials | Null for nonpositive EBITDA |
| Interest coverage / `interest_coverage` | EBIT / interest expense | EBIT, interest | Higher | Non-financials | Null for nonpositive expense |
| Dilution / `share_dilution_1y` | shares(t)/shares(t−1) − 1 | diluted shares | Lower | All / 1 year | Split-adjustment required |
| Earnings yield / `earnings_yield` | net income / market cap | TTM income, market cap | Higher | Applicability rules | Negative values retained |
| FCF yield / `fcf_yield` | FCF / market cap | OCF, capex, market cap | Higher | All | TTM alignment required |
| EBIT-to-EV / `ebit_to_ev` | EBIT / enterprise value | EBIT, debt, cash, market cap | Higher | Non-financials | Null for nonpositive EV |
| Sales-to-EV / `sales_to_ev` | revenue / enterprise value | revenue, EV | Higher | Non-financials | Industry-specific interpretation |
| Book-to-market / `book_to_market` | common equity / market cap | equity, market cap | Higher | Where meaningful | Not universal |
| Growth / `revenue_growth_1y`, `eps_growth_1y`, `fcf_growth_1y` | current / abs(prior) − sign(prior) | matched periods | Higher | 1 year | Negative bases explicitly signed |
| CAGR / `revenue_cagr_3y`, `eps_cagr_3y` | (current/base)^(1/3) − 1 | annual facts | Higher | 3 years, positive bases | Null for nonpositive bases |
| Margin change / `*_margin_change` | current margin − prior margin | matched facts | Higher | 1 year | Percentage-point change |
| 12−1 / `momentum_12_1` | adjusted close(t−21)/close(t−252) − 1 | adjusted daily closes | Higher | 252 sessions | No future adjustments |
| 6−1 / `momentum_6_1` | adjusted close(t−21)/close(t−126) − 1 | adjusted daily closes | Higher | 126 sessions | No interpolation |
| Returns / `return_3m`, `return_1m` | close(t)/close(t−N) − 1 | adjusted closes | Higher | 63/21 sessions | Missing bars remain missing |
| Reversal / `short_term_reversal` | five-session return | adjusted closes | Lower | 5 sessions | Penalty input |

Revision feature keys are reserved but unavailable until a dependable point-in-time estimates provider is configured. ROIC, stability, shareholder yield, relative valuation, acceleration, volatility-adjusted momentum, benchmark-relative return, moving-average/high distance, and volume trend have schema/configuration support but their calculators remain deferred.

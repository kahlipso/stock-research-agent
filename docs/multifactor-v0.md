# MULTIFACTOR_V0

Version `1.0.0` is a long-only cross-sectional research ranking for an approximately 1–3 month horizon, calculated daily and intended for weekly review. Alpha is `0.30 × Quality + 0.25 × Growth + 0.20 × Value + 0.25 × Momentum`, on 0–100 scales. Overall weighted coverage must be at least 70%, and each factor must pass its own threshold. Full feature weights live in validated configuration in `lib/research/config.ts` and are seeded verbatim.

Alpha is neither a profit probability, expected return, target nor recommendation. Bands: top 10% Candidate; next 10% Hold range; 20th–70th percentile Neutral; bottom 30% Weak signal; otherwise Ineligible or Insufficient data.

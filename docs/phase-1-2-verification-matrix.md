# Phase 1–2 verification matrix

Verified 2026-07-22. “Live” means `stock-research-agent-ten.vercel.app`; “repository” means the corrected but not yet deployed working tree. PASS is used only for directly inspected/tested behavior.

## Phase 1

| Requirement | Status | Evidence / files or endpoints | Tests performed | Defect / fix | Remaining risk |
|---|---|---|---|---|---|
| Security master | PARTIAL | `Company`, provider profile mapping, `scripts/research.ts`; live all 15 metadata records null | Read-only DB inspection | Added metadata ingestion command | Yahoo is not an authoritative security master; not run live |
| Universe membership | FAIL | `UniverseMembership`; `/api/universe` says 15-stock development watchlist | Schema/API/DB inspection | Eligibility is now enforced in calculations | No historical constituent source; survivorship bias |
| Real price data | PARTIAL | 4,110 live Yahoo `PriceBar`s; data-audit API | AMD/NVDA stable API and DB checks | Production provider now fails closed | Unofficial delayed feed; no SLA/licence |
| Adjusted price data | PARTIAL | `adjustedClose`, Yahoo provider, charts | Formula/source inspection | Latest-bar query fixed | Adjustment vintage cannot be reconstructed |
| Corporate actions | NOT IMPLEMENTED | `CorporateAction` table has zero live rows; no ingestion | Repo-wide search and DB count | None | Splits/dividends/symbol changes unverified |
| Real fundamentals | FAIL | SEC facts/filings are real; `engine.ts` initially mixed periods | DB and independent AMD/NVDA checks | Comparable annual series and null-safe formulas added | Must reingest/recalculate; SEC taxonomy/restatement policy incomplete |
| Filing timestamps | PARTIAL | `Filing.acceptedAt`; facts use filing date | Schema/provider inspection | Availability filters retained | Companyfacts not linked reliably to acceptance timestamp |
| Point-in-time integrity | FAIL | Feature queries, memberships, model versions, snapshots | PIT unit tests plus DB inspection | Future-data filtering strengthened; run-linked scores added | No historical universe, action vintages, effective-dated model; snapshots not fully atomic |
| Provider lineage | PARTIAL | `PriceBar`, `FinancialFact`, data-audit | Schema/API inspection | Added market-snapshot lineage fields | Legacy rows become `UNKNOWN_LEGACY`; security-master lineage incomplete |
| Ingestion idempotency | PARTIAL | natural keys/upserts/`skipDuplicates` | Code and constraints inspected | No destructive production rerun | Fundamental attempted count and filing linking remain weak |
| Ingestion observability | PARTIAL | 7 live ingestion runs; stale RUNNING row | DB inspection | Existing run logs retained | No lease/heartbeat/stale-run recovery |
| Mock-data safeguards | PARTIAL | provider selection, `.env.example`, UI code | Repo-wide mock/synthetic search | Production now rejects missing provider; example disables mocks | Public fixture watchlist path remains; fix not deployed |
| Chart correctness | PARTIAL | Recharts source; desktop/mobile screenshots | Repeat requests and browser-engine rendering | Uses stored ordered adjusted bars | Source timestamp absent; limited history; mobile overflow |
| Production configuration | FAIL | Vercel live, scripts, routes | Build and live-route tests | Heavy calculation routes return 409; postinstall generates Prisma | No scheduler/durable worker; migration not deployed |

## Phase 2

| Requirement | Status | Evidence / files or endpoints | Tests performed | Defect / fix | Remaining risk |
|---|---|---|---|---|---|
| Feature registry | PARTIAL | `lib/research/features.ts` | Registry/test inspection | 5-session reversal corrected | Applicability and missing policy incomplete |
| Quality factor | FAIL | engine/formulas and live snapshots | AMD gross margin/ROA failed | Annual comparable facts and average denominators added | Live values invalid until recomputed |
| Growth factor | FAIL | engine/live snapshots | AMD/NVDA growth checks failed | Annual series selection added | Irregular periods/restatements need stronger handling |
| Value factor | FAIL | engine/market snapshots | AMD/NVDA yield checks failed | Unknown EBITDA/debt no longer fabricated; lineage required | Live values invalid; no point-in-time shares/actions |
| Momentum factor | PARTIAL | adjusted bars/features | AMD/NVDA 1m, 3m, 12–1 passed | 5-session reversal fixed; latest 800 bars fixed | Claimed benchmark/sector features absent |
| Normalization | PARTIAL | `normalization.ts`, engine | controlled existing fixtures; 60-test suite | Input restricted to eligible IDs | Production universe too small; rerun not performed |
| Peer fallback | PARTIAL | normalization records peer level | small-group fixture inspection | Existing behavior retained | All live rows effectively universe fallback |
| Model versioning | PARTIAL | `FactorModelVersion`, run/snapshot schema | schema/API inspection | Score linked to run | Compiled config can diverge; activation not effective-dated |
| Alpha calculation | PASS | `/api/rankings`, contributions, `scoring.ts` | AMD/NVDA independent weighted sums | No formula change | Correct arithmetic over invalid inputs is not trustworthy alpha |
| Confidence independence | PARTIAL | confidence separate from score | code/unit inspection | Fresher input scoring added | Formula remains coarse; no comprehensive paired fixture |
| Risk independence | PARTIAL | `risk.ts`, risk snapshots | AMD/NVDA volatility and drawdown passed | Benchmark aligned by date | Missing-bar/idiosyncratic metrics absent |
| Liquidity and eligibility | PARTIAL | engine/liquidity snapshots | code/DB inspection | market cap/country/type/history/liquidity enforced; alpha null if ineligible | Not deployed/recalculated |
| Historical snapshots | FAIL | only 30 scores, two same-day records/security | DB/run inspection | Completed-run linkage and fail-closed ranking added | Features/normalization still overwrite same-date records; no history |
| Contribution reconciliation | PARTIAL | live contribution API | AMD/NVDA alpha recomputation passed | None | Underlying factor values invalid |
| Ranking bands | PARTIAL | rankings API/UI/model | live order and source inspection | Ineligible rows excluded after fix | UI band vocabulary still inconsistent |
| Dashboard integration | PARTIAL | `/dashboard` desktop/mobile | HTTP and headless-Chrome checks | completed-run-only backend | Missing alpha change/industry percentile; mobile overflow |
| Stock-page integration | PARTIAL | `/stocks/AMD`, `/stocks/NVDA` | browser/API checks | completed-run scoping; BigInt serialization fix | Peer/benchmark gaps; live generic AMD API still 503 |
| API correctness | PARTIAL | all listed APIs/admin routes | validation, status, auth checks | BigInt fixed; partial snapshots blocked | Fixes not live; large payloads/contracts |
| Security | PARTIAL | auth/env/client build | 8 admin POSTs returned 401; client assets scanned | production mocks fail closed; heavy routes disabled | No rate limiting; public watchlist writes/provider calls |
| Performance | PARTIAL | live timings and payload sizes | dashboard ~1.6s; rankings ~0.33s; factor API ~79 KB | request-time model work disabled | No query-count instrumentation; broad payloads |
| Test coverage | PARTIAL | Vitest suite and numerical script | 60/60 tests passed; build passed | PIT/regression/numerical tests added | No integration DB, browser automation, or corporate-action tests |

The matrix is intentionally conservative: repository fixes do not change a live status until migrated, deployed, ingested, recalculated, and reverified.

# Phase 1–2 production-readiness verification — initial findings

Date: 2026-07-22 (America/Los_Angeles)

This document records the initial, read-only audit performed before any corrective code changes. No `AGENTS.md` exists in the repository. `README.md`, every file under `docs/`, the complete Prisma schema and all migrations, providers, jobs, calculations, APIs, UI components, and tests were inspected. The live deployment and configured production database were tested independently without modifying production data.

## Initial verdict

**NOT READY — POINT-IN-TIME INTEGRITY FAILURE**

The live application contains real Yahoo price bars and SEC EDGAR facts, and it publishes deterministic-looking scores. That is not sufficient for backtesting. Fundamental observations are selected by period-end alone without enforcing comparable annual/quarterly durations or taxonomy, current universe membership is a seeded 15-stock watchlist surrogate, corporate actions are not ingested, model activation is not effective-dated, incomplete runs can leak snapshots, and the calculation selects the oldest 800 bars once history exceeds that limit. These defects can produce invalid historical features and rankings.

## Actual architecture

```text
Yahoo Finance via yahoo-finance2 (unofficial/delayed)    SEC EDGAR companyfacts/submissions
                         |                                  |
                         +---------- scripts/research.ts ---+
                                              |
                PriceBar / MarketSnapshot / Filing / FinancialFact / DataIngestionRun
                                              |
                               lib/research/engine.ts
                  FeatureSnapshot -> NormalizedFeatureSnapshot
                                              |
                 FactorScoreSnapshot / RiskMetricSnapshot / LiquiditySnapshot
                                              |
                               lib/database/research.ts
                                              |
                              Next.js route handlers
                                              |
                         dashboard and stored stock pages
```

Important bypasses/coupling:

- `MarketSnapshot` lacks provider, retrieval, effective-time, and mock lineage even though its market cap enters value features.
- `calculateFeatures`, `normalizeFeatures`, and `calculateFactors` are tightly coupled to the compiled `MODEL_V0`, not the active/effective database model configuration.
- Three administrative model routes and `run-daily` execute universe-wide work inside Vercel requests, contrary to the documented worker architecture.
- There is no scheduler configuration or durable worker deployment in the repository.

## Repository and production facts

- Next.js 16.2.11, App Router, strict TypeScript, React 19, Prisma/PostgreSQL, Zod, Vitest, Recharts.
- Production dashboard returned HTTP 200 and identified `MULTIFACTOR_V0 1.0.0`.
- Production database read-only counts: 15 companies, 15 memberships, 4,110 price bars, 0 corporate actions, 341 filings, 20,505 financial facts, 1,500 feature snapshots, 567 normalized snapshots, 30 score snapshots, 5 model runs, and 7 ingestion runs.
- Every production company had null exchange, country, currency, and security type. The universe description admits that members mirror the development watchlist.
- Each company had 274 price bars. TSM had zero financial facts, yet had two score snapshots.
- Production had a stale `RUNNING` model calculation and a stale `RUNNING` price-ingestion job.
- The latest completed live run reported 13 eligible/scored securities and zero failures.
- Live `/api/rankings` returned 13 rows sourced from Yahoo/SEC snapshots. Live `/api/stocks/AMD` returned 503, while narrower AMD endpoints returned 200.
- All eight tested administrative POST routes rejected unauthenticated requests with HTTP 401.

## Initial requirement classification

### Phase 1

| Requirement | Status | Evidence and initial defect |
|---|---|---|
| Security master | FAIL | `Company` has fields, but no security-master provider/job exists; all 15 live records lack exchange, country, currency, and security type. |
| Universe membership | FAIL | Effective dates exist, but seed enrolls every active company; live universe mirrors the development watchlist and eligibility rules are not comprehensively enforced. |
| Real price data | PARTIAL | Live `PriceBar` provider is unofficial/delayed Yahoo; 274 bars/security exist. No licensed/official production contract. |
| Adjusted price data | PARTIAL | Yahoo adjusted close is stored and used, but corporate-action lineage is absent and historical adjustment vintage is not preserved. |
| Corporate actions | NOT IMPLEMENTED | Schema exists; production count is zero; no ingestion method is called. |
| Real fundamentals | PARTIAL | SEC EDGAR facts/filings are real, but taxonomy collisions, period mixing, duration mixing, and restatement handling are unsafe. |
| Filing timestamps | PARTIAL | Filing acceptance is stored; companyfacts `publishedAt` uses filing date at midnight instead of acceptance time. |
| Point-in-time integrity | FAIL | Availability filters exist, but market-cap lineage, model-effective dates, restatement vintage, period alignment, and historical universe construction fail PIT requirements. |
| Provider lineage | PARTIAL | `PriceBar`/facts have lineage; `MarketSnapshot`, score inputs, and security master are incomplete. |
| Ingestion idempotency | PARTIAL | Natural keys/upserts prevent many duplicates; market snapshots append each run, fundamentals `createMany(skipDuplicates)` reports attempted rather than inserted records and does not update prior rows. |
| Ingestion observability | PARTIAL | Run records exist; stale `RUNNING` jobs have no heartbeat/lease recovery. |
| Mock safeguards | FAIL | Worker blocks mock ingestion, but provider selection defaults to mock when unset, the watchlist GET serves fixtures without a database, and `.env.example` is malformed and enables mocks. |
| Chart correctness | PARTIAL | Stored chart is linear/nonanimated/no interpolation and uses adjusted close; no provider/timestamp is visible on the chart and only one series is implemented. |
| Production configuration | FAIL | No scheduler/worker definition; malformed `.env.example`; heavy web routes exist; migrations are not part of deployment. |

### Phase 2

| Requirement | Status | Evidence and initial defect |
|---|---|---|
| Feature registry | PARTIAL | Central typed registry exists, but descriptions are labels, applicability is incomplete, and declared features include unavailable calculators. |
| Quality | FAIL | Calculator mixes periods/taxonomies, uses end assets rather than documented average assets, treats operating income as EBITDA, and may count debt as zero when absent. |
| Growth | FAIL | Annual and quarterly observations are mixed; live nonsensical “1Y” results confirm the defect. Several weighted features are always null. |
| Value | FAIL | Uses unsafe market-cap lineage and non-TTM mixed facts; EBITDA is incorrectly set to operating income; market-cap eligibility rule is not enforced. |
| Momentum | PARTIAL | Core return windows use adjusted closes and exclude the last month for 6–1/12–1. Relative SPY/QQQ/sector features are not calculated; short-term reversal duplicates 1-month return rather than documented 5 sessions. |
| Normalization | FAIL | Math fixtures cover winsorization/ties/fallback, but engine input is not explicitly restricted to eligible members; all live samples fall back to the 15-stock universe. |
| Peer fallback | PARTIAL | Algorithm records fallback correctly, but the live peer universe is too small and not a validated investable universe. |
| Model versioning | PARTIAL | Version table/snapshot association exists; active model has no effective interval and calculations use compiled configuration rather than the stored version. |
| Alpha calculation | PASS (unit scope only) | Pure function uses 30/25/20/25, excludes confidence/risk/liquidity, and live factor contributions reconcile to alpha. Inputs are not trustworthy. |
| Confidence independence | PARTIAL | Separate mathematically, but `freshness` is hardcoded to 100 and filing/price freshness are crude booleans. |
| Risk independence | PARTIAL | Separate from alpha; several metrics exist. Benchmark series are position-aligned rather than timestamp-aligned, missing-bar and idiosyncratic risk are absent. |
| Liquidity and eligibility | FAIL | Liquidity math exists, but configured market-cap/country/security-type rules are not enforced and ineligible drafts retain non-null alpha. |
| Historical snapshots | FAIL | Unique snapshot keys exist, but only two same-day snapshots are live; partial reruns can overwrite snapshots and rankings fall back to snapshots without a completed run. |
| Contribution reconciliation | PARTIAL | Factor contributions reconcile; individual raw feature values can be invalid and UI does not show configured/effective weights accurately. |
| Ranking bands | PARTIAL | Percentile bands calculate, but UI options omit `WEAK_SIGNAL` and include nonexistent `EXIT_RANGE`; ineligible rows are not excluded by the ranking query. |
| Dashboard integration | PARTIAL | Live dashboard displays core scores; alpha changes are hardcoded unavailable, industry percentiles are null, pagination is not wired into the client, and “real point-in-time” labeling overstates integrity. |
| Stock-page integration | PARTIAL | Stored page works for AMD/NVDA, but peer comparison and benchmark lines are absent and latest factor snapshots are not limited to completed runs. |
| API correctness | FAIL | Generic stock endpoint returns live 503 because Prisma `BigInt` volume is serialized directly; narrower routes return oversized/misaligned data and latest snapshots are not completed-run scoped. |
| Security | PARTIAL | Admin authentication and ticker/query validation work; watchlist mutations are public and trigger provider calls/database writes; no rate limiting exists. |
| Performance | PARTIAL | Ranking pagination/caching exists; stock repository fetches broad nested payloads repeatedly; 79 KB factor API and 97 KB pages observed; heavy calculations can run in requests. |
| Test coverage | FAIL | 56 tests passed before fixes, but tests are mostly pure-unit checks and do not cover database PIT behavior, period alignment, run publication atomicity, API serialization, or independent stored-data reconciliation. |

## Prioritized confirmed defects

### P0

- Fundamental features mix annual, quarterly, instant, duration, and taxonomy observations by sorting only `periodEnd`; live growth scores are therefore not trustworthy.
- Official rankings can fall back to non-mock snapshots when no completed run exists, allowing partial/interrupted output to become official.
- A rerun for an already-published date overwrites snapshots before its run completes; snapshots have no calculation-run association.
- Corporate-action history is absent, so adjusted histories cannot be independently validated for backtesting.

### P1

- Oldest rather than latest 800 bars are selected once more than 800 exist (`orderBy asc`, `take: 800`).
- Normalization is not explicitly restricted to eligible securities.
- `calculateFactors` queries memberships across every universe because it omits `universeId`.
- Configured market-cap, country, and security-type eligibility rules are not enforced.
- Ineligible securities can retain non-null alpha; default ranking query does not exclude `INELIGIBLE`.
- Market cap comes from `MarketSnapshot`, which lacks required lineage/mock fields.
- Security master and historical universe construction are not implemented.
- SEC restatements are always marked false and acceptance timestamps are not used for fact availability.
- Risk benchmark returns are array-position aligned rather than date aligned.
- `short_term_reversal` uses 21 sessions and duplicates `return_1m`, contradicting the five-session documentation.

### P2

- `/api/stocks/[ticker]` cannot serialize BigInt and returns 503 live.
- Heavy model work is exposed in four authenticated Vercel routes.
- `.env.example` contains an invalid provider value, a real-looking email address, and `ALLOW_MOCK_DATA=true`.
- Provider selection silently defaults to mock.
- Stale `RUNNING` jobs have no recovery mechanism.
- `fundamentalsFast` does not link facts to filings and reports attempted rather than inserted rows.
- Live API responses expose entire model configuration and oversized nested objects where concise contracts would suffice.
- Dashboard stale labeling relies on the latest run status, but the displayed `latestScore` is not scoped to a completed run.
- Documentation is internally inconsistent and stale.
- No rate limiting exists on public or administrative endpoints.

### P3

- Mojibake exists in stored/displayed punctuation.
- UI band options disagree with implemented bands.
- Legacy scoring and mock UI remain in the codebase and increase ambiguity.

## Tests and live checks completed before this document

- Inspected all 11 existing test files before relying on results.
- Executed lint (one warning, no errors), TypeScript, 56 Vitest tests, and production build successfully in the earlier baseline check.
- Live GET checks: `/`, `/dashboard`, system/model/universe/rankings APIs, AMD/NVDA stock pages, factor/history/contribution/peer/data-audit endpoints.
- Live query validation: invalid page and unknown parameter returned 400.
- Unauthorized checks: all eight administrative POST routes returned 401.
- Read-only production database counts, company metadata, run history, and ingestion history were queried.
- A true Playwright/browser-engine visual and mobile interaction audit was not yet available at this point; HTTP-rendered output and source implementation were inspected.

## Initial limitations

- No licensed provider account or original Yahoo contractual SLA was available.
- The repository contains no local/test database. Production was queried read-only; destructive migrations, resets, and duplicate-ingestion experiments were not performed there.
- Live values can be compared to stored/API values, but historical provider vintages cannot be reconstructed from Yahoo because raw responses and corporate-action vintages are absent.

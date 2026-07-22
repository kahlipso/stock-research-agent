# Phase 1–2 production-readiness verification — final

Date: 2026-07-22 (America/Los_Angeles)

## Overall verdict

The platform is **not a trustworthy foundation for backtesting or Phase 3**. Production contains real Yahoo price bars and real SEC EDGAR records, but the live fundamental feature snapshots are numerically invalid, historical universe integrity and corporate-action ingestion are absent, and historical snapshots are insufficient and not fully publication-atomic. Repository corrections improve fail-closed behavior but have not been deployed.

## Phase 1 verdict

Phase 1 fails on the security master/universe, corporate actions, point-in-time integrity, and production operations. Price and filing records are provider-backed, but Yahoo is an unofficial delayed source and adjusted-price vintages cannot be audited. Production’s 15-stock universe is the development watchlist, not an independently maintained investable universe.

## Phase 2 verdict

Phase 2 is deterministic at the pure-math layer but not trustworthy end to end. Live alpha contribution arithmetic reconciles, and sampled momentum/risk metrics reproduce. Quality, Growth, and Value source selection does not: AMD failed all six sampled fundamental calculations, while NVDA had stored values where no comparable annual facts were available by the score timestamp.

## Live deployment verdict

The live dashboard and stock pages render, and all eight administrative POST routes rejected unauthenticated requests. `/api/stocks/AMD` returns 503 because of BigInt serialization. Desktop is usable; the 390 px dashboard overflows horizontally. The live deployment is the pre-fix build and therefore does not match this working tree.

## Point-in-time integrity verdict

**FAIL.** Availability predicates exist, but they do not establish historical investability. There is no historical constituent provider, no corporate-action ingestion/vintage, model activation is not effective-dated, later calculations can overwrite same-date feature and normalized snapshots, and production has only two same-day factor snapshots per security. The new score-to-run link prevents incomplete scores from being published by the corrected query, but full atomic snapshot publication still requires redesign within Phase 1/2.

## Numerical reconciliation

| Ticker | Fundamental samples | Momentum samples | Risk samples | Alpha arithmetic |
|---|---:|---:|---:|---:|
| AMD | 0/6 pass | 3/3 pass | 2/2 pass | pass; absolute difference 0.000035 |
| NVDA | 0/6 pass | 3/3 pass | 2/2 pass | pass; absolute difference 0.000030 |

AMD examples: stored gross margin 0.5282356383 versus 0.4951644101 independently; stored one-year revenue growth -0.7040041572 versus +0.3433779329; stored earnings yield 0.0015578748 versus 0.0048831434. These are material, not rounding differences.

## Security findings

- Provider/database credentials remain server-side by source inspection; no named secret variables were found in generated client assets.
- Eight unauthenticated administrative POST endpoints returned 401.
- Public watchlist mutations can still cause provider calls and writes, and no rate limiter is implemented.
- Corrected production configuration rejects an absent provider and disables mock data by default, but that code is not live.

## Performance findings

Observed live timings were approximately 0.27 s for `/`, 1.6 s for `/dashboard`, 0.78 s for system status, and 0.33 s for rankings. Factor API payloads approached 79 KB and stock pages about 97 KB. Query-count instrumentation is absent. Corrected admin routes no longer perform universe-wide calculations inside Vercel requests, but a durable scheduled worker is still missing.

## Defects fixed in the repository

- Select latest 800 bars rather than the oldest 800.
- Select comparable annual fundamentals, preserve nulls, and use average balance-sheet denominators.
- Stop treating operating income as EBITDA and missing debt as zero.
- Restrict normalization and scores to the configured universe and eligible members.
- Enforce configured price, market-cap, history, dollar-volume, country, and security-type eligibility.
- Null alpha for ineligible securities and exclude them from official rankings.
- Associate factor scores with calculation runs and publish only completed-run scores.
- Add market-snapshot lineage fields and a non-destructive migration.
- Align benchmark returns by date.
- Correct short-term reversal from 21 sessions to five.
- Fix stock API BigInt serialization.
- Disable request-time model calculations with explicit 409 worker-required responses.
- Fail closed on missing production provider configuration; correct `.env.example`.
- Add security-master enrichment command, PIT regression tests, and independent numerical verifier.

## Remaining material defects

- No corporate-action ingestion or historical adjustment lineage.
- No authoritative, point-in-time security master or historical universe.
- No licensed fresh/live market feed; Yahoo is delayed/unofficial.
- No effective-dated model activation or fully atomic feature/normalization publication.
- SEC fact/restatement taxonomy and acceptance-time lineage remain incomplete.
- No durable scheduler/worker, stale-run recovery, or production rate limiting.
- Live data must be reingested/recalculated; existing fundamental scores must not be reused.
- Historical depth is inadequate for backtesting and survivorship-safe research.

## Commands and results

Executed: `npm install` PASS; `npm run lint` PASS with one unused-function warning; `npm run typecheck` PASS; `npm test` PASS (12 files, 60 tests); `npm run build` PASS; `npx prisma generate` PASS; `npx prisma validate` PASS with a non-secret validation URL; `npx prisma migrate status` PASS as a read-only check and reported the new migration unapplied; `npm run verify:numerics -- AMD` and `-- NVDA` completed with the results above; `git diff --check` PASS apart from line-ending notices.

The ingestion/calculation commands were not executed because `.env.local` targets production and no isolated test database exists. Running them would have modified valid production data, contrary to the audit constraints. Production migrations were not applied.

## Test and build result

All 60 automated tests and the production build pass in the corrected working tree. This proves compilation and the covered pure/regression behavior; it does not validate production data or make the system backtest-ready.

## Deployment steps

1. Provision an isolated staging PostgreSQL database and licensed data-provider credentials.
2. Apply `20260722050000_verification_integrity` in staging and deploy the corrected build.
3. Run security-master and price/fundamental ingestion, then a complete daily model calculation from a durable worker.
4. Verify that only the completed run is returned and independently reconcile samples again.
5. Deploy the migration before the application in production, run fresh ingestion/calculation, and retain the prior deployment for rollback. Existing scores should be treated as invalid, not migrated as trusted output.

Do not deploy the application code before the schema migration: it expects the new lineage and calculation-run columns.

## Readiness answers

1. Production uses real Yahoo and SEC data: **partly yes**, but the derived fundamental values are invalid.
2. Mock data can reach production: **yes in the currently deployed design through fallback/fixture paths; corrected provider selection is not deployed**.
3. Historical calculations are point-in-time safe: **no**.
4. Feature formulas are correct: **no; sampled fundamental features fail, sampled momentum passes**.
5. Normalization is correct: **pure algorithm mostly, production eligibility/universe no**.
6. Alpha reconciles mathematically: **yes within display rounding**.
7. Confidence and risk are independent from alpha: **yes structurally; confidence quality is incomplete**.
8. Rankings are reproducible: **pure calculations are deterministic, but historical inputs/publication are not sufficiently reproducible**.
9. Live matches audited corrected code: **no**.
10. Ready for Phase 3: **no**.
11. Ready for backtesting: **no**.
12. Before paper trading: implement authoritative security-master/universe history, corporate actions, licensed fresh prices, complete PIT/restatement lineage, atomic versioned snapshots, durable jobs/monitoring, rate limits, and a long independently reconciled historical run.

The full row-level evidence is in `docs/phase-1-2-verification-matrix.md`; initial pre-fix evidence is preserved in `docs/phase-1-2-verification-initial.md`.

**NOT READY — POINT-IN-TIME INTEGRITY FAILURE**

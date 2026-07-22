# Investment Research Dashboard

A personal investment-research MVP built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Recharts, Zod, and Vitest.

This application is for education and decision support. It does not execute trades, connect to a broker, or guarantee returns. It supports deterministic mock fixtures and an optional unofficial Yahoo Finance integration whose values may be delayed or incomplete.

## What is included

- `/dashboard`: seeded 15-company watchlist ranked by deterministic research score, compact summary, numerical sorting, text/sector/score filters, intraday changes, inspectable score breakdowns, missing-data warnings, and database-backed add/remove actions
- `/stocks/[ticker]`: overview, selectable 1D/5D/1M/6M/1Y/5Y price history, previous-close reference, growth, profitability, balance sheet, valuation, transparent scoring, and empty future research sections
- Route handlers: `GET/POST/DELETE /api/watchlist` and `GET /api/stocks/[ticker]`
- Provider-independent market-data interface with mock and unofficial Yahoo Finance implementations
- Deterministic, independently tested scoring under `lib/scoring`
- PostgreSQL schema, initial migration, and seed script

## Prerequisites

- Node.js 20.9 or newer
- npm
- PostgreSQL 14 or newer (required for persistent add/remove actions; read-only mock research screens work without it)

## Install

```powershell
git clone https://github.com/kahlipso/stock-research-agent.git
cd stock-research-agent
npm install
Copy-Item .env.example .env
```

Edit `.env` with your PostgreSQL connection:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stock_research?schema=public"
MARKET_DATA_PROVIDER="mock"
```

Create the database first if it does not exist, then initialize it:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the app:

```powershell
npm run dev
```

Open `http://localhost:3000`. Without `DATABASE_URL`, the seeded mock watchlist remains visible but add/remove controls are disabled.

Set `MARKET_DATA_PROVIDER="yahoo"` to request external data through `yahoo-finance2`. This is an unofficial integration, not a supported Yahoo API contract. Do not silently fall back to mock values when external fields are missing. Add the same variable in Vercel and redeploy to enable it there.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

```text
app/                    Server pages, loading/error states, route handlers
components/             Client interactivity, charts, reusable dashboard UI
lib/data-providers/     Provider contract, mock fixtures, provider orchestration
lib/scoring/            Deterministic scoring and complete explanations
lib/database/           Prisma client and watchlist repository
lib/validation/         Zod request validation
lib/formatting/         Display-only formatters
prisma/                 Schema, migration, and seed
tests/                  Vitest unit tests
```

Server Components fetch and assemble initial research views. Client Components are limited to table interaction and chart range controls. Route handlers validate mutations with Zod and return consistent error objects without stack traces.

## Data integrity

Every provider object contains `source`, `retrievedAt`, and `isMock`. The application distinguishes deterministic mock fixtures from unofficial external data. Some fields intentionally remain `null`; missing external values are not replaced with mock values.

Market snapshots also expose current price, previous close, derived daily dollar/percentage movement, market status, price timestamp, and a mock/delayed/live classification. Provider responses are validated with Zod. Price charts sort and deduplicate observations, use straight point-to-point segments, and never smooth or interpolate missing observations.

The score awards no metric points when an input is missing, marks that metric as missing, and separately reduces the completeness category. It never silently changes missing values into factual zeroes. A score is an organizational aid, not a forecast.

Default watchlist ranking uses total score, then data completeness, then growth score, then ticker alphabetically. The dashboard labels scores as research categories only; these labels are not buy recommendations.

## Future extension points

Replace or supplement the unofficial provider with a supported licensed market-data API without changing the UI. News, SEC imports, AI interpretation, alerts, backtesting, and paper trading are intentionally not implemented in this milestone. AI interpretation should remain separate from source facts and deterministic calculations.

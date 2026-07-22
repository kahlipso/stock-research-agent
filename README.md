# Northstar Stock Research Dashboard

A personal investment-research MVP built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Recharts, Zod, and Vitest.

This application is for education and decision support. It does not execute trades, connect to a broker, or guarantee returns. All financial values in this milestone are explicitly labeled mock data and are not current market facts.

## What is included

- `/dashboard`: seeded 15-company watchlist ranked by deterministic research score, compact summary, numerical sorting, text/sector/score filters, intraday changes, inspectable score breakdowns, missing-data warnings, and database-backed add/remove actions
- `/stocks/[ticker]`: overview, selectable 1D/5D/1M/6M/1Y/5Y mock price history, previous-close reference, growth, profitability, balance sheet, valuation, transparent scoring, and empty future research sections
- Route handlers: `GET/POST/DELETE /api/watchlist` and `GET /api/stocks/[ticker]`
- Provider-independent market-data interface with an explicit mock implementation
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

## Mock-data integrity

Every provider object contains `source`, `retrievedAt`, and `isMock`. The application presents a prominent mock-data banner and never presents fixture values as live data. Some fixture fields intentionally contain `null` to demonstrate missing-data handling.

Market snapshots also expose current price, previous close, derived daily dollar/percentage movement, market status, price timestamp, and a mock/delayed/live classification. Provider responses are validated with Zod. Price charts sort and deduplicate observations, use straight point-to-point segments, and never smooth or interpolate missing observations.

The score awards no metric points when an input is missing, marks that metric as missing, and separately reduces the completeness category. It never silently changes missing values into factual zeroes. A score is an organizational aid, not a forecast.

Default watchlist ranking uses total score, then data completeness, then growth score, then ticker alphabetically. The dashboard labels scores as research categories only; these labels are not buy recommendations.

## Future extension points

Implement another `MarketDataProvider` for live data and select it in the provider composition layer. News, SEC imports, AI interpretation, alerts, backtesting, and paper trading are intentionally not implemented in this milestone. AI interpretation should remain separate from source facts and deterministic calculations.

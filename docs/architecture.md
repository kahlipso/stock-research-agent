# Architecture

Next.js 16 App Router is the presentation layer. PostgreSQL/Prisma stores the security master (`Company`), user watchlist, point-in-time source data, normalized features, model versions, and daily score snapshots. `lib/research` is an isolated deterministic TypeScript research engine; `scripts/research.ts` is the worker entry point. Page requests read stored snapshots and never calculate the universe or call AI. Legacy `ResearchScore` rows remain preserved and are explicitly `legacy`/`isMock`.

No authentication existed before this milestone. Administrative routes require `Authorization: Bearer $INGESTION_SECRET` and deliberately direct heavy work to the CLI worker. There is no brokerage or execution component.

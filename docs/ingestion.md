# Ingestion

Jobs are tracked by `DataIngestionRun`, use bounded concurrency, isolate ticker failures, and upsert by natural point-in-time keys. Commands are `npm run ingest:prices`, `npm run ingest:fundamentals`, `npm run calculate:features`, and `npm run calculate:factors`. Only price ingestion has an initial implementation; the other commands fail closed until their worker is configured. Fixture ingestion is blocked unless explicitly enabled outside production, and fixture scores are never returned by production ranking queries.

The market provider is selected explicitly with `MARKET_DATA_PROVIDER`; there is no silent fallback. SEC requests require a descriptive `SEC_USER_AGENT`.

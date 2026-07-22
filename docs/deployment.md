# Deployment

Apply the additive Prisma migration before deploying application code. Configure `DATABASE_URL`, `MARKET_DATA_PROVIDER`, provider credentials, `SEC_USER_AGENT`, `INGESTION_SECRET`, `APP_TIMEZONE`, `ACTIVE_FACTOR_MODEL`, and `ALLOW_MOCK_DATA=false` as server-only variables. Run ingestion/calculation in a durable worker environment; Vercel routes must not run universe jobs. Retain the last valid scores when a job fails and expose stale status.

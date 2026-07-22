# Model calculation jobs

Commands accept an optional `YYYY-MM-DD` date after the command arguments:

```text
npm run calculate:features -- 2026-07-22
npm run normalize:features -- 2026-07-22
npm run calculate:factors -- 2026-07-22
npm run calculate:daily-model -- 2026-07-22
```

The daily command runs all three stages, upserts versioned snapshots and records a `ModelCalculationRun`. Per-security failures are recorded and do not abort peers. Only `COMPLETED` runs are official; `PARTIAL` and `FAILED` runs never replace the latest official ranking. Admin endpoints require the bearer ingestion secret. Cacheable GET endpoints only read stored results.

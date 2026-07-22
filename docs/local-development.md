# Local development

Install with `npm install`, copy `.env.example` to `.env.local`, configure PostgreSQL and a non-mock provider, then run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`. Use `ALLOW_MOCK_DATA=true` only for clearly labeled local fixture screens/tests. Validate with `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

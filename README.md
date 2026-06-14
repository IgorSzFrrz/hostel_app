# Hostel App

Booking site for an Inn / Bed & Breakfast / Hostel. Monorepo: React frontend,
Fastify API, Postgres database. Multilingual (PT/EN/ES), multi-currency
(BRL/USD/EUR).

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind 4, GSAP, TanStack Router/Query
- Backend: Fastify, TypeScript, Prisma, PostgreSQL
- Tooling: Bun workspaces, ESLint, Prettier, Husky, Vitest, Playwright

## Quickstart

Requires Bun 1.3+, Node 20+ and Docker.

```bash
bun install
Copy-Item apps/api/.env.example apps/api/.env
docker compose up -d
bun run --filter @hostel/api db:migrate
bun run --filter @hostel/api db:seed
bun run dev
```

- Web: http://localhost:5173
- API: http://localhost:3001
- API health: http://localhost:3001/v1/healthz

For a deployed frontend and API on different origins, set:

- API: `CORS_ORIGINS="https://your-web-origin.example"`
- Web: `VITE_API_BASE_URL="https://your-api-origin.example"`

## API

Initial public endpoints:

- `GET /v1/healthz`
- `GET /v1/readyz`
- `GET /v1/room-types`
- `GET /v1/room-types/:slug`
- `GET /v1/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&roomTypeId=...`
- `POST /v1/reservations`
- `POST /v1/reservations/:code/lookup`
- `POST /v1/reservations/:code/cancel`

Database commands:

```bash
bun run --filter @hostel/api db:generate
bun run --filter @hostel/api db:validate
bun run --filter @hostel/api db:migrate
bun run --filter @hostel/api db:seed
```

## Repo Layout

```text
apps/
  web/       Vite + React frontend
  api/       Fastify backend
packages/
  shared/    Zod schemas + shared types
```

## Status

Foundation scaffolded.

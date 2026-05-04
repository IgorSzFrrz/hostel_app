# Hostel App

Booking site for an Inn / Bed & Breakfast / Hostel. Monorepo: React frontend,
Fastify API, Postgres database. Multilingual (PT/EN/ES), multi-currency
(BRL/USD/EUR).

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind, GSAP, TanStack Router/Query
- Backend: Fastify, TypeScript, Prisma, PostgreSQL
- Tooling: pnpm workspaces, ESLint, Prettier, Husky, Vitest, Playwright

## Quickstart

Requires Node 20+ and Docker.

```bash
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install
Copy-Item apps/api/.env.example apps/api/.env
docker compose up -d
pnpm --filter @hostel/api db:migrate
pnpm --filter @hostel/api db:seed
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001
- API health: http://localhost:3001/v1/healthz

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
pnpm --filter @hostel/api db:generate
pnpm --filter @hostel/api db:validate
pnpm --filter @hostel/api db:migrate
pnpm --filter @hostel/api db:seed
```

## Repo Layout

```text
apps/
  web/       Vite + React frontend
  api/       Fastify backend
packages/
  shared/    Zod schemas + shared types
docs/
  superpowers/specs/   Design specs
  superpowers/plans/   Implementation plans
```

## Status

Foundation scaffolded. See `docs/superpowers/plans/` for the implementation
roadmap.

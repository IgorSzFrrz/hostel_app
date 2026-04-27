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
docker compose up -d
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001
- API health: http://localhost:3001/v1/healthz

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

# AGENTS.md - Conventions for AI-Assisted Development

This file documents the conventions in this repo so AI assistants and humans
stay consistent across sessions.

## Layout

- Bun workspace monorepo with `apps/web`, `apps/api`, `packages/shared`.
- TS strict mode, `noUncheckedIndexedAccess` enabled.
- Shared Zod schemas in `packages/shared` are the single source of truth for
  request/response shapes and form validation.

## Style

- Prettier handles formatting. Do not manually format.
- ESLint flat config. Fix lint warnings in your changes; do not introduce new
  ones.
- Imports use ES modules (`type: "module"` everywhere).
- Use `import type { ... }` for type-only imports.

## Tests

- Vitest for unit and integration. Real Postgres for DB tests (Testcontainers
  or docker-compose). No DB mocks.
- Playwright for E2E.
- TDD is encouraged for booking/availability logic. The DB EXCLUDE constraint is
  the booking conflict authority; test it directly.

## Commits

- Conventional Commits encouraged: `feat:`, `fix:`, `chore:`, `docs:`,
  `refactor:`, `test:`.
- Small, focused commits. Each one should leave the repo in a working state.

## i18n

- Portuguese is the primary locale. EN and ES are translations.
- Translatable content in DB lives in JSONB columns of shape `{ pt, en, es }`.
- Frontend uses `react-i18next` with PT fallback.

## Currency

- BRL is canonical. All `Decimal` price columns are BRL.
- USD and EUR are display-only conversions via cached `ExchangeRate` rows.
- Reservation totals are snapshotted in BRL at booking time.

## Do Not

- Do not add features beyond the current plan/spec.
- Do not introduce backwards-compat shims for unshipped code.
- Do not commit `.env` files.
- Do not bypass the EXCLUDE constraint with application-level locks.

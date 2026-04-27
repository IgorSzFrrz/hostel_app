# Hostel App — Design Spec

**Date:** 2026-04-26
**Status:** Draft, awaiting user review
**Author:** Igor (with Claude as senior-dev collaborator)

## 1. Purpose & Scope

A guest-facing booking website for a single Inn / Bed & Breakfast / Hostel property. MVP delivers public-facing browse-and-reserve functionality; architecture is built so a future admin dashboard, online payments, and additional properties can be added without rework.

This spec is the contract for the MVP. Anything labeled "future" is explicitly _not_ in MVP scope but the design accommodates it.

### MVP feature set

- Browse 3 room types (single, double, group of 3–4) with photos, descriptions, capacity, and prices.
- Check availability for a given date range.
- Submit a reservation with guest contact info — pay on arrival, no payment integration in MVP.
- Look up an existing reservation via reservation code + email; cancel if needed.
- Multilingual UI: Portuguese (primary), English, Spanish.
- Multi-currency display: BRL (canonical), USD, EUR, converted via cached daily exchange rates.

### Explicit non-goals (MVP)

- Online payment processing.
- Guest account creation / login.
- Admin dashboard / staff UI.
- Email confirmations (reservation code is shown on success page; layer email later).
- Reviews, ratings, blog, marketing CMS.
- Multi-property support.

### Constraints

- Single property, single owner.
- Photos for MVP are static AI-generated images committed to the repo.
- Build will proceed page-by-page, in the order listed in §5.

## 2. Stack

### Frontend (`apps/web`)

- React 18 + TypeScript + Vite
- TanStack Router (type-safe routing, Zod-validated search params)
- TanStack Query (server state, caching)
- React Hook Form + Zod resolver (forms)
- Tailwind CSS (styling, semantic tokens)
- GSAP (entrance animations, gallery transitions; respects `prefers-reduced-motion`)
- `react-i18next` (i18n)
- Headless-UI / Radix primitives (accessible date picker, modals, dropdowns)

### Backend (`apps/api`)

- Node.js + TypeScript
- Fastify
- Prisma ORM
- PostgreSQL (Neon for hosted, Postgres in `docker-compose.yml` for local dev)
- Zod via `fastify-type-provider-zod` for request/response validation
- `@fastify/swagger` for auto-generated OpenAPI docs at `/docs`
- `@fastify/rate-limit` on booking & lookup endpoints
- `pino` for structured logs
- `node-cron` for the daily exchange-rate sync job (replaceable by a real queue later)

### Shared (`packages/shared`)

- Zod schemas (request/response, form validation) — single source of truth used by both `web` and `api`.
- Shared TypeScript types derived from those schemas.

### Tooling

- pnpm workspaces (monorepo)
- ESLint + Prettier (shared root config)
- Husky + lint-staged (pre-commit hooks)
- Vitest (unit + integration tests)
- Playwright (E2E tests)
- `@axe-core/playwright` (accessibility checks)
- GitHub Actions (CI/CD)

## 3. Architecture

```
hostel_app/
├── apps/
│   ├── web/                  React + Vite + TS + Tailwind + GSAP
│   └── api/                  Fastify + Prisma + TS
├── packages/
│   └── shared/               Zod schemas, shared TS types
├── docker-compose.yml        Local Postgres
├── package.json              Workspace root
└── pnpm-workspace.yaml
```

### Why this layout

- **Monorepo:** front- and back-end share TS types via `packages/shared`. No DTO drift.
- **Separate `web` + `api`:** independent deploy targets (Vercel for web, Fly/Railway for api), independent scaling, easy to add `apps/admin` for D without rework.
- **Not Next.js full-stack:** GSAP and a clean SPA model are a better fit; routing isn't tied to server components.

## 4. Data Model

### Entity overview

```
RoomType ─┬─< Room ─┬─< Reservation
          │         │
          │         └── (specific room assigned at booking insert)
          │
          └── photos[], localized name/description (JSONB)

ExchangeRate (BRL→USD, BRL→EUR, refreshed daily)
```

### Prisma schema (canonical)

```prisma
model RoomType {
  id            String   @id @default(cuid())
  slug          String   @unique  // "single" | "double" | "group"
  name          Json     // { pt: "...", en: "...", es: "..." }
  description   Json     // localized
  capacity      Int      // 1, 2, 3, or 4
  basePriceBRL  Decimal  // canonical price per night
  photos        String[] // paths or URLs
  rooms         Room[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Room {
  id           String        @id @default(cuid())
  number       String        // physical identifier, e.g. "101"
  roomTypeId   String
  roomType     RoomType      @relation(fields: [roomTypeId], references: [id])
  active       Boolean       @default(true) // soft-disable for maintenance
  reservations Reservation[]
  createdAt    DateTime      @default(now())

  @@unique([number])
}

model Reservation {
  id             String            @id @default(cuid())
  code           String            @unique // human-friendly, e.g. "HST-7K9X3"
  roomId         String
  room           Room              @relation(fields: [roomId], references: [id])
  roomTypeId     String            // booked type at request time
  guestName      String
  guestEmail     String
  guestPhone     String?
  guestCount     Int
  checkIn        DateTime          @db.Date
  checkOut       DateTime          @db.Date
  priceTotalBRL  Decimal           // snapshotted at booking time: nights × basePriceBRL
  status         ReservationStatus @default(PENDING)
  notes          String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([guestEmail])
  @@index([code])
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  CHECKED_IN
  CHECKED_OUT
  NO_SHOW
}

model ExchangeRate {
  id        String   @id @default(cuid())
  base      String   // "BRL"
  quote     String   // "USD" | "EUR"
  rate      Decimal
  fetchedAt DateTime @default(now())

  @@unique([base, quote, fetchedAt])
  @@index([base, quote])
}
```

### Concurrency-safe availability (the critical piece)

Postgres `EXCLUDE` constraint added via raw migration after Prisma's table creation:

```sql
ALTER TABLE "Reservation"
  ADD CONSTRAINT no_overlap_active
  EXCLUDE USING gist (
    "roomId" WITH =,
    daterange("checkIn", "checkOut", '[)') WITH &&
  )
  WHERE (status IN ('PENDING','CONFIRMED','CHECKED_IN'));
```

Requires `CREATE EXTENSION btree_gist;` in an earlier migration.

This makes double-booking impossible at the DB level, even under concurrent requests. The application layer simply attempts inserts and handles the rejection — no application-level locking.

### i18n via JSONB

`RoomType.name` and `RoomType.description` are JSONB columns of shape `{ pt, en, es }`. The API selects the requested locale (or falls back to PT) before returning to the client. Adding a fourth locale later requires no schema migration — only a data update.

### Currency model

- BRL is canonical. All `Decimal` price columns are BRL.
- `Reservation.priceTotalBRL = nights × roomType.basePriceBRL`, snapshotted at booking time so historical totals don't drift if `basePriceBRL` is later edited or exchange rates change.
- USD and EUR are display-only conversions performed in the frontend using cached `ExchangeRate` rows.

### Reservation code

Format: `HST-XXXXX` where `XXXXX` is 5 chars from a confusion-free alphabet (`23456789ABCDEFGHJKMNPQRSTUVWXYZ` — no `0/O`, `1/I/L`). Generated server-side; uniqueness enforced by `@unique`. Used as the lookup key alongside email.

## 5. Frontend Pages (Build Order)

| #   | Route                 | Purpose                                                                                             |
| --- | --------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | `/`                   | Home — hero, value prop, room type teasers, GSAP entrance, CTA "Check availability"                 |
| 2   | `/rooms`              | List of all 3 room types with photos, prices, capacity                                              |
| 3   | `/rooms/:slug`        | Room detail — gallery, description, capacity, price, "Book this room" CTA                           |
| 4   | `/booking`            | 3-step booking flow (dates → guest info → review/confirm) — single route, search-param-driven state |
| 5   | `/reservation/lookup` | Form: enter code + email                                                                            |
| 6   | `/reservation/:code`  | Reservation detail with cancel button (after email match)                                           |
| 7   | `/about`              | Static info + contact                                                                               |
| 8   | `*`                   | 404                                                                                                 |

Pages 1–3 ship as a static-content milestone. Page 4 (real booking engine) layers on top once the API is in place.

### Frontend folder layout (`apps/web/src/`)

```
app/                   routing, providers (QueryClient, i18n, currency)
  routes.tsx
  providers.tsx
features/              feature-first organization
  room-types/          list page, detail page, hooks, components
  availability/        date picker, availability grid
  booking/             multi-step form (state machine)
  reservation-lookup/  lookup form + detail view
components/            design-system primitives: Button, Card, Input, Modal
hooks/                 useGsap, useCurrency, useLocale, useExchangeRate
i18n/                  pt.json (primary), en.json, es.json
lib/                   apiClient, currencyFormat, dateHelpers
styles/                tailwind base layer
main.tsx
```

### Key frontend decisions

- **Routing:** TanStack Router. Search params for `/booking` validated via Zod at the route boundary. Lazy-loaded routes per feature.
- **Server state:** TanStack Query. Room types cached aggressively; availability re-fetches on date change.
- **Forms:** React Hook Form + Zod resolver. Schemas imported from `packages/shared`.
- **i18n:** `react-i18next` with PT default + fallback. Language switcher in header persists to `localStorage`.
- **Currency:** `CurrencyContext` exposes `format(brlAmount)` using cached `ExchangeRate` and `Intl.NumberFormat`. User selection persists.
- **GSAP:** `useGsap` hook wraps `gsap.context()` for cleanup. ScrollTrigger on home; Flip on gallery transitions. Respects `prefers-reduced-motion`.
- **Design system:** Tailwind config defines semantic tokens (`bg-surface`, `text-muted`, `accent-primary`).
- **Accessibility:** Headless-UI / Radix primitives for date picker, modals, dropdowns. Focus management and keyboard support are non-negotiable.

## 6. API Surface

All routes under `/v1/...`. Standard error envelope:

```json
{ "error": { "code": "STRING_CODE", "message": "...", "details": {} } }
```

OpenAPI spec exposed at `/docs` in development.

| Method | Path                                                 | Purpose                                                                                                                                               |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/v1/room-types`                                     | List all room types with photos, localized text, base price (BRL). Cacheable.                                                                         |
| `GET`  | `/v1/room-types/:slug`                               | Detail for a single room type.                                                                                                                        |
| `GET`  | `/v1/availability?checkIn=…&checkOut=…&roomTypeId=…` | Availability counts per type for date range. `roomTypeId` optional.                                                                                   |
| `POST` | `/v1/reservations`                                   | Create a pending reservation. Body: `{ roomTypeId, checkIn, checkOut, guestCount, guest: { name, email, phone? } }`. Returns reservation with `code`. |
| `GET`  | `/v1/reservations/:code?email=…`                     | Look up a reservation. Email must match (anti-enumeration).                                                                                           |
| `POST` | `/v1/reservations/:code/cancel`                      | Cancel. Body: `{ email }`. Sets status to `CANCELLED`.                                                                                                |
| `GET`  | `/v1/exchange-rates`                                 | Latest cached BRL→USD/EUR rates.                                                                                                                      |
| `GET`  | `/v1/healthz`                                        | Liveness probe.                                                                                                                                       |
| `GET`  | `/v1/readyz`                                         | Readiness — checks DB connectivity.                                                                                                                   |

### Reservation creation flow

1. Server validates request via shared Zod schema.
2. Server queries candidate `Room`s of the requested type (active=true).
3. For each candidate, attempt `INSERT INTO Reservation`. EXCLUDE constraint either succeeds (booking confirmed) or rejects (try next room).
4. If all candidates exhausted → `409 ROOM_NO_LONGER_AVAILABLE`.
5. On success → return reservation with generated `code`.

### Exchange rate sync

A `node-cron` job inside the api process runs daily, fetches BRL→USD and BRL→EUR from the chosen currency API, upserts into `ExchangeRate`. The `GET /exchange-rates` endpoint reads only cached rows — never hits the third-party API on the request path.

When the app moves to multiple instances, the cron job is moved out to a dedicated worker or a managed scheduler (e.g., GitHub Actions cron, Fly Machines scheduled).

### Localization at the API

- Client sends `Accept-Language: pt-BR | en | es`.
- Server returns the matching string from JSONB. Falls back to PT.

## 7. Validation, Errors, Edge Cases

### Validation rules (shared Zod schemas)

| Field        | Rule                                           |
| ------------ | ---------------------------------------------- |
| `checkIn`    | Date ≥ today, ISO format                       |
| `checkOut`   | Date > `checkIn`, ≤ 365 days from today        |
| Stay length  | 1 to 30 nights                                 |
| `guestCount` | Integer, 1 ≤ count ≤ `roomType.capacity`       |
| `email`      | RFC 5322                                       |
| `phone`      | Optional, libphonenumber validation if present |
| `name`       | 2–80 chars, trimmed, non-empty                 |

### Stable error codes

- `VALIDATION_FAILED` (400) — `details: ZodIssue[]`
- `ROOM_NO_LONGER_AVAILABLE` (409) — booking conflict
- `RESERVATION_NOT_FOUND` (404) — wrong code OR wrong email (intentionally indistinguishable)
- `RATE_LIMITED` (429)
- `EXCHANGE_RATE_UNAVAILABLE` (503) — only on rates endpoint; never blocks booking

### Currency / exchange-rate degradation

- Booking never depends on live rates (canonical BRL).
- If rates are stale (>24h) or fetch failed, frontend shows BRL only with a localized note: "USD/EUR estimate temporarily unavailable."

### Frontend error & loading handling

- Top-level `<ErrorBoundary>` (logs + friendly page).
- Per-route boundaries via TanStack Router so a broken booking flow doesn't kill the home page.
- Skeleton loaders for room lists and availability grids — no spinners on layout-shifting content.
- Empty states: "No rooms available for these dates — try shifting by a day?" with quick-pick of nearby dates.
- 404 catch-all route.

### i18n fallback chain

- Requested locale → PT.
- Missing key → console warning in dev; silent fallback in prod.
- CI script diffs locale files and fails if PT keys are missing in EN/ES.

### Reservation-lookup hardening (anti-enumeration)

- Rate-limit `/reservations/:code` to 5 attempts/min per IP.
- Wrong email returns the same `RESERVATION_NOT_FOUND` (404) as wrong code.
- Constant-time email comparison (`crypto.timingSafeEqual` after both are normalized).

### Observability

- `pino` structured logs with request IDs (via `@fastify/request-context`).
- `@fastify/sensible` for consistent HTTP error formatting.
- `/healthz` (liveness), `/readyz` (DB-connected readiness).
- Future hook: OpenTelemetry traces, ready when D arrives.

## 8. Testing Strategy

| Layer           | Tool                           | What's tested                                                                                                                       |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| API integration | Vitest + Fastify `inject`      | All endpoints against a real Postgres (Testcontainers or `docker-compose.test.yml`).                                                |
| API unit        | Vitest                         | Currency conversion, date helpers, reservation code generator, availability calc helpers.                                           |
| Concurrency     | Vitest                         | Simulated parallel booking inserts on the same room/dates — assert exactly one succeeds; others receive `ROOM_NO_LONGER_AVAILABLE`. |
| Frontend unit   | Vitest + React Testing Library | Hooks (`useCurrency`, `useGsap`), components, form validation.                                                                      |
| Frontend E2E    | Playwright                     | Full booking happy path; reservation lookup + cancel; PT/EN/ES smoke.                                                               |
| A11y            | `@axe-core/playwright`         | Key pages must pass axe.                                                                                                            |

No coverage-percentage targets. Booking + availability paths must be tested. Each frontend page must have at least one render test and the two E2E flows must pass.

## 9. Deployment

- **Frontend** → Vercel (or Netlify). Built from `apps/web`. Free tier sufficient.
- **Backend** → Fly.io (or Railway). Single Fastify process for MVP.
- **Postgres** → Neon (free tier, branchable) or platform-managed alternative.
- **Photos** → committed to `apps/web/public/rooms/` for MVP. When the admin dashboard arrives in D, swap to Cloudflare R2 / S3 with signed-URL uploads — the API contract stays identical.
- **Secrets** → `.env.example` in repo, real values in the platform's secret manager.

### CI/CD (GitHub Actions)

- On PR: `lint` + `typecheck` + `test` (api + web) + Playwright smoke.
- On merge to `main`: deploy frontend, deploy backend, run `prisma migrate deploy`.
- Branch protection: PRs must pass CI + 1 review.

## 10. Repo Hygiene

- ESLint + Prettier shared config at root.
- Husky pre-commit: `lint-staged` runs eslint/prettier on changed files.
- Conventional commit messages encouraged (not enforced for solo MVP).
- README with: 3-command quickstart, architecture diagram, deploy guide.
- `CLAUDE.md` documenting conventions for AI-assisted development continuity.

## 11. Out of Scope (Recap)

- Online payment.
- Guest accounts / login.
- Admin dashboard.
- Email notifications.
- Reviews, blog, CMS.
- Multi-property.
- Real photo uploads (post-MVP via R2/S3).

## 12. Open Items for Future Specs

- Admin dashboard (D) spec — auth, RBAC, room/photo management, reservation calendar, manual confirmation workflow.
- Online payments spec — Stripe / MercadoPago integration, deposit vs. full-pay policy, refund flow.
- Email notification spec — Resend / Postmark integration, transactional templates, locale-aware.
- Real-photo upload spec — signed URLs, image processing pipeline, CDN.

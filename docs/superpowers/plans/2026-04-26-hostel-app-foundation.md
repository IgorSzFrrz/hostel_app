# Hostel App — Foundation Plan (Plan 0 of N)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a pnpm monorepo with `apps/web`, `apps/api`, `packages/shared`, configure shared tooling (TS, ESLint, Prettier, Husky), commit, and push to https://github.com/IgorSzFrrz/hostel_app.

**Architecture:** Three-package pnpm workspace. `packages/shared` is a TS-only package consumed by `web` and `api`. `web` is a Vite + React + TS app. `api` is a Fastify + TS server. Postgres is provided locally via `docker-compose.yml` (configured here, used in Plan 1).

**Tech Stack:** pnpm (via corepack), TypeScript 5.x, ESLint 9 (flat config), Prettier 3, Husky 9, lint-staged, Vite 5, React 18, Tailwind 3, Fastify 4, Docker Compose.

**Reference spec:** `docs/superpowers/specs/2026-04-26-hostel-app-design.md`

**Out of scope for this plan:**
- Prisma / DB schema / migrations (Plan 1).
- TanStack Router / Query / i18n / GSAP / actual pages (Plan 2+).
- API endpoints (Plan 1+).
- CI/CD workflows (later plan).

---

## Files Created

```
hostel_app/
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .nvmrc
├── .npmrc
├── package.json                      ← workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.mjs
├── .prettierrc.json
├── .prettierignore
├── docker-compose.yml
├── README.md
├── CLAUDE.md
├── .husky/
│   └── pre-commit
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   └── styles/index.css
│   │   └── public/.gitkeep
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       └── src/
│           ├── index.ts
│           └── server.ts
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        └── src/
            └── index.ts
```

---

### Task 0: Verify environment and prepare pnpm

**Files:** none (environment prep)

- [ ] **Step 1: Confirm Node version**

Run: `node --version`
Expected: `v20.x.x` or higher (we are on `v24.14.1`).

- [ ] **Step 2: Enable corepack and prepare pnpm**

Run: `corepack enable && corepack prepare pnpm@9.12.0 --activate`
Expected: pnpm becomes available. Verify: `pnpm --version` → `9.12.0`.

- [ ] **Step 3: Confirm git is configured**

Run: `git config --global user.name && git config --global user.email`
Expected: Non-empty values. If empty, instruct user to set them before continuing.

---

### Task 1: Initialize git repository and ignore files

**Files:**
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `.editorconfig`
- Create: `.nvmrc`
- Create: `.npmrc`

- [ ] **Step 1: Initialize git**

Run: `git init -b main`
Expected: `Initialized empty Git repository in C:/Igor/DevIgor/hostel_app/.git/`.

- [ ] **Step 2: Write `.gitignore`**

```
# Dependencies
node_modules/
.pnpm-store/

# Build artifacts
dist/
build/
*.tsbuildinfo

# Env files
.env
.env.local
.env.*.local
!.env.example

# Editor / OS
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Test artifacts
coverage/
.nyc_output/
playwright-report/
test-results/

# Prisma generated
**/prisma/generated/

# Misc
.turbo/
.cache/
```

- [ ] **Step 3: Write `.gitattributes`**

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.ico binary
*.pdf binary
```

- [ ] **Step 4: Write `.editorconfig`**

```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 5: Write `.nvmrc`**

```
24
```

- [ ] **Step 6: Write `.npmrc`**

```
engine-strict=true
auto-install-peers=true
```

---

### Task 2: Workspace root configuration

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "hostel-app",
  "version": "0.0.0",
  "private": true,
  "description": "Inn / Bed & Breakfast / Hostel booking app — monorepo root.",
  "license": "UNLICENSED",
  "packageManager": "pnpm@9.12.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "pnpm -r typecheck",
    "prepare": "husky"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "eslint": "^9.13.0",
    "globals": "^15.11.0",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "typescript": "^5.6.3",
    "typescript-eslint": "^8.11.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml,css}": ["prettier --write"]
  }
}
```

- [ ] **Step 2: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["**/node_modules", "**/dist", "**/build"]
}
```

---

### Task 3: ESLint + Prettier configuration

**Files:**
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Write `eslint.config.mjs`**

```javascript
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/prisma/generated/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
);
```

- [ ] **Step 2: Add `@eslint/js` to root devDependencies**

Edit `package.json` `devDependencies`:

```json
"@eslint/js": "^9.13.0",
```

- [ ] **Step 3: Write `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 4: Write `.prettierignore`**

```
node_modules
dist
build
coverage
.pnpm-store
**/prisma/generated
playwright-report
test-results
*.lock
pnpm-lock.yaml
```

---

### Task 4: `packages/shared` scaffold

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Write `packages/shared/package.json`**

```json
{
  "name": "@hostel/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Write `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write `packages/shared/src/index.ts`**

```ts
export const SHARED_PACKAGE_VERSION = "0.0.0";
```

(Real schemas land in Plan 1.)

---

### Task 5: `apps/api` scaffold

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsup.config.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Write `apps/api/package.json`**

```json
{
  "name": "@hostel/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hostel/shared": "workspace:*",
    "fastify": "^4.28.1",
    "pino": "^9.4.0"
  },
  "devDependencies": {
    "tsup": "^8.3.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
```

- [ ] **Step 2: Write `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../../packages/shared" }]
}
```

- [ ] **Step 3: Write `apps/api/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  dts: false,
});
```

- [ ] **Step 4: Write `apps/api/src/server.ts`**

```ts
import Fastify from "fastify";

export function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  app.get("/v1/healthz", async () => ({ status: "ok" }));

  return app;
}
```

- [ ] **Step 5: Write `apps/api/src/index.ts`**

```ts
import { buildServer } from "./server.js";

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "0.0.0.0";

const app = buildServer();

app
  .listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`API listening on http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
```

---

### Task 6: `apps/web` scaffold

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.node.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/styles/index.css`
- Create: `apps/web/public/.gitkeep`

- [ ] **Step 1: Write `apps/web/package.json`**

```json
{
  "name": "@hostel/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hostel/shared": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.3",
    "vite": "^5.4.8"
  }
}
```

- [ ] **Step 2: Write `apps/web/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "useDefineForClassFields": true,
    "types": []
  },
  "include": ["src"],
  "references": [
    { "path": "../../packages/shared" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 3: Write `apps/web/tsconfig.node.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  },
  "include": ["vite.config.ts", "tailwind.config.ts", "postcss.config.js"]
}
```

- [ ] **Step 4: Write `apps/web/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/v1": "http://localhost:3001",
    },
  },
});
```

- [ ] **Step 5: Write `apps/web/index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hostel App</title>
  </head>
  <body class="bg-stone-50 text-stone-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `apps/web/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Write `apps/web/tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#fafaf9",
        ink: "#1c1917",
        accent: "#b45309",
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 8: Write `apps/web/src/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
#root {
  height: 100%;
}
```

- [ ] **Step 9: Write `apps/web/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 10: Write `apps/web/src/App.tsx`**

```tsx
export function App() {
  return (
    <main className="flex min-h-full items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <h1 className="font-display text-4xl text-ink">Hostel App</h1>
        <p className="mt-4 text-stone-700">
          Foundation scaffolded. Pages and booking flow coming next.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 11: Create `apps/web/public/.gitkeep`** (empty file).

---

### Task 7: docker-compose for local Postgres

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Write `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: hostel_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: hostel
      POSTGRES_PASSWORD: hostel
      POSTGRES_DB: hostel
    ports:
      - "5432:5432"
    volumes:
      - hostel_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hostel -d hostel"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  hostel_pgdata:
```

(Used in Plan 1 when Prisma is introduced. Compose file lives here so the repo is ready.)

---

### Task 8: README and CLAUDE.md

**Files:**
- Create: `README.md`
- Create: `CLAUDE.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Hostel App

Booking site for an Inn / Bed & Breakfast / Hostel. Monorepo: React frontend, Fastify API, Postgres database. Multilingual (PT/EN/ES), multi-currency (BRL/USD/EUR).

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind, GSAP, TanStack Router/Query
- **Backend:** Fastify, TypeScript, Prisma, PostgreSQL
- **Tooling:** pnpm workspaces, ESLint, Prettier, Husky, Vitest, Playwright

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

## Repo layout

```
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

Foundation scaffolded. See `docs/superpowers/plans/` for the implementation roadmap.
```

- [ ] **Step 2: Write `CLAUDE.md`**

```markdown
# CLAUDE.md — Conventions for AI-Assisted Development

This file documents the conventions in this repo so AI assistants (and humans) stay consistent across sessions.

## Layout

- pnpm monorepo with `apps/web`, `apps/api`, `packages/shared`.
- TS strict mode, `noUncheckedIndexedAccess` enabled.
- Shared Zod schemas in `packages/shared` are the single source of truth for request/response shapes and form validation.

## Style

- Prettier handles formatting. Don't manually format.
- ESLint flat config. Fix lint warnings in your changes; don't introduce new ones.
- Imports use ES modules (`type: "module"` everywhere).
- Use `import type { ... }` for type-only imports.

## Tests

- Vitest for unit + integration. Real Postgres for DB tests (Testcontainers or docker-compose). No DB mocks.
- Playwright for E2E.
- TDD encouraged for booking/availability logic — DB EXCLUDE constraint *is* the logic; test it directly.

## Commits

- Conventional Commits encouraged: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Small, focused commits. Each one should leave the repo in a working state.

## i18n

- Portuguese is the primary locale. EN and ES are translations.
- Translatable content in DB lives in JSONB columns of shape `{ pt, en, es }`.
- Frontend uses `react-i18next` with PT fallback.

## Currency

- BRL is canonical. All `Decimal` price columns are BRL.
- USD and EUR are display-only conversions via cached `ExchangeRate` rows.
- Reservation totals are snapshotted in BRL at booking time.

## Don't

- Don't add features beyond the current plan/spec.
- Don't introduce backwards-compat shims for unshipped code.
- Don't commit `.env` files.
- Don't bypass the EXCLUDE constraint with application-level locks.
```

---

### Task 9: Husky pre-commit hook

**Files:**
- Create: `.husky/pre-commit`

- [ ] **Step 1: Install dependencies and initialize husky**

Run: `pnpm install`
Expected: Lockfile generated, all deps installed, no errors.

- [ ] **Step 2: Verify husky was initialized**

The `prepare` script in root `package.json` runs `husky` on install, which creates `.husky/`.
Check: `ls .husky/`
Expected: directory exists.

- [ ] **Step 3: Write `.husky/pre-commit`**

```bash
pnpm exec lint-staged
```

- [ ] **Step 4: Make hook executable (Git Bash on Windows)**

Run: `git update-index --chmod=+x .husky/pre-commit 2>/dev/null || true`
(On Windows, Git tracks the executable bit; this command is a no-op if the file isn't yet staged but ensures it's marked executable when staged.)

---

### Task 10: Verify everything builds and lints

- [ ] **Step 1: Typecheck all packages**

Run: `pnpm typecheck`
Expected: All three packages pass with no errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: No lint errors. Warnings on unused vars are acceptable.

- [ ] **Step 3: Format check**

Run: `pnpm format:check`
Expected: All files formatted.

- [ ] **Step 4: Build the API**

Run: `pnpm --filter @hostel/api build`
Expected: `apps/api/dist/index.js` exists.

- [ ] **Step 5: Build the web app**

Run: `pnpm --filter @hostel/web build`
Expected: `apps/web/dist/` exists with `index.html` and assets.

- [ ] **Step 6: Smoke-test the API**

Run (background): `pnpm --filter @hostel/api dev`
After ~3 seconds, in a separate shell run: `curl http://localhost:3001/v1/healthz`
Expected: `{"status":"ok"}`.
Stop the dev process.

- [ ] **Step 7: Smoke-test the web app**

Run (background): `pnpm --filter @hostel/web dev`
After ~3 seconds, in a separate shell run: `curl -s http://localhost:5173/ | grep -i 'Hostel App'`
Expected: HTML includes the title.
Stop the dev process.

---

### Task 11: Initial commit

- [ ] **Step 1: Stage all files**

Run: `git add .`

- [ ] **Step 2: Confirm what's staged (no secrets, no node_modules)**

Run: `git status`
Expected: All scaffolded files listed under "Changes to be committed". `node_modules/` and `pnpm-lock.yaml` behavior:
- `pnpm-lock.yaml` SHOULD be committed.
- `node_modules/` MUST NOT be present (covered by `.gitignore`).

- [ ] **Step 3: Create initial commit**

Run:

```bash
git commit -m "$(cat <<'EOF'
chore: scaffold monorepo foundation

- pnpm workspaces with apps/web, apps/api, packages/shared
- TS strict, ESLint flat config, Prettier, Husky + lint-staged
- Vite + React + Tailwind frontend stub
- Fastify backend stub with /v1/healthz
- docker-compose for local Postgres
- README, CLAUDE.md, design spec, foundation plan
EOF
)"
```

Expected: commit succeeds; pre-commit hook runs lint-staged on staged files.

---

### Task 12: Push to GitHub

**Repository URL:** https://github.com/IgorSzFrrz/hostel_app

- [ ] **Step 1: Add remote**

Run: `git remote add origin https://github.com/IgorSzFrrz/hostel_app.git`

- [ ] **Step 2: Push**

Run: `git push -u origin main`
Expected: push succeeds. If GitHub auth is missing, the push will prompt for credentials or fail with an auth error — in that case, instruct the user to authenticate (Git Credential Manager, SSH key, or PAT) and re-run.

- [ ] **Step 3: Confirm remote state**

Run: `git remote -v && git log --oneline -1`
Expected: remote `origin` set; one commit on `main`.

---

## Self-Review

Spec coverage: this plan covers spec §3 (architecture layout) and the foundational pieces of §2 (stack). It deliberately defers data model (§4), pages (§5), API endpoints (§6), validation (§7), testing (§8), and deployment (§9) to subsequent plans.

Placeholder scan: every step contains exact file content or exact commands. No "TBD", no "implement later".

Type consistency: file names and package names match across all task references (`@hostel/web`, `@hostel/api`, `@hostel/shared`).

Open follow-ups (next plans):
- Plan 1: Prisma + Postgres + room/reservation schema + migrations + seed + GET endpoints.
- Plan 2: Frontend foundations (TanStack Router, TanStack Query, i18n, currency, design system primitives).
- Plan 3+: Page-by-page from §5.

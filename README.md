# Rezerva

Multi-vertical booking platform (football, beauty, restaurants, clinics, hotels). Monorepo with a NestJS API, Next.js consumer app, and optional Telegram bot.

![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)

> Replace `OWNER/REPO` in the badge URL after pushing to GitHub.

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@9.15.9 --activate`)
- **Docker** and Docker Compose (Postgres 16 + Redis 7)

## Quick start

```bash
# 1. Clone and install
git clone <repository-url> rezerva
cd rezerva
pnpm install

# 2. Environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Start infrastructure
pnpm docker:up

# 4. Database (from backend/)
cd backend
pnpm prisma:generate
pnpm prisma:migrate    # applies migrations in dev
pnpm prisma:seed       # optional; geo/business seeds come in later milestones
cd ..

# 5. Run apps
pnpm dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |
| Postgres | localhost:5432        |
| Redis    | localhost:6379        |

Run services individually:

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

## Environment variables

### Backend (`backend/.env`)

| Variable                    | Required | Description                                |
| --------------------------- | -------- | ------------------------------------------ |
| `DATABASE_URL`              | Yes      | PostgreSQL connection string               |
| `REDIS_HOST`                | Yes      | Redis host for BullMQ queues               |
| `REDIS_PORT`                | Yes      | Redis port (default `6379`)                |
| `JWT_SECRET`                | Yes      | Secret for signing access tokens           |
| `JWT_EXPIRES_IN`            | No       | Token TTL (default `7d`)                   |
| `PORT`                      | No       | API port (default `3001`)                  |
| `NODE_ENV`                  | No       | `development` or `production`              |
| `FRONTEND_URL`              | Yes      | CORS origin (e.g. `http://localhost:3000`) |
| `TELEGRAM_BOT_TOKEN`        | No       | Enables Telegram bot module when set       |
| `TELEGRAM_BOT_USERNAME`     | No       | Bot username for login widget              |
| `SUPABASE_URL`              | No       | File storage (uploads)                     |
| `SUPABASE_SERVICE_ROLE_KEY` | No       | Supabase service role key                  |
| `SUPABASE_STORAGE_BUCKET`   | No       | Storage bucket name                        |
| `SENTRY_DSN`                | No       | Error monitoring                           |

Copy from `backend/.env.example`. For local Docker Postgres:

```env
DATABASE_URL=postgresql://ordering:ordering@localhost:5432/ordering
```

### Frontend (`frontend/.env.local`)

| Variable                            | Required | Description                                     |
| ----------------------------------- | -------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | Yes      | Backend base URL (e.g. `http://localhost:3001`) |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | No       | Telegram Login Widget                           |
| `NEXT_PUBLIC_SUPABASE_URL`          | No       | Public Supabase URL                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | No       | Supabase anon key                               |
| `NEXT_PUBLIC_SENTRY_DSN`            | No       | Client error monitoring                         |

Copy from `frontend/.env.example`.

## Database migrations

All schema changes require a committed Prisma migration.

```bash
cd backend

# Development — create and apply migrations
npm run prisma:migrate

# Production / CI — apply committed migrations only
npx prisma migrate deploy

# Regenerate client after schema changes
npm run prisma:generate

# Optional: open Prisma Studio
npm run prisma:studio
```

Migrations live in `backend/prisma/migrations/`. The initial migration is `20260622082152_init_rezerva`.

**Note:** A PostgreSQL exclusion constraint on `booking_resource_allocations` (prevent double-booking) is planned in a follow-up migration (see T-053 in `TODO.md`).

## Project structure

```
├── frontend/          Next.js App Router (consumer app)
├── backend/           NestJS API, Prisma, BullMQ workers
├── packages/          Shared config (tsconfig, eslint-config, shared-*)
├── docs/              Architecture and API specifications
├── .cursor/rules/     AI coding rules for Cursor
├── .github/issues/    Roadmap issues (M0–M11)
├── turbo.json         Turborepo pipeline
├── pnpm-workspace.yaml
└── docker-compose.yml Postgres + Redis (+ optional backend image)
```

## Documentation

| Document                                                       | Description                                       |
| -------------------------------------------------------------- | ------------------------------------------------- |
| [docs/API.md](docs/API.md)                                     | REST API specification (`/v1`)                    |
| [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md)   | NestJS modules, repositories, guards              |
| [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md) | App Router, features, state                       |
| [docs/BOT_ARCHITECTURE.md](docs/BOT_ARCHITECTURE.md)           | Telegraf bot, scenes, Redis sessions              |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                       | Production deploy: Docker, Vercel, Railway, CI/CD |
| [TODO.md](TODO.md)                                             | Implementation task breakdown (107 tasks)         |
| [.github/issues/issues.json](.github/issues/issues.json)       | Product roadmap and acceptance criteria           |

## Scripts

Root (monorepo — uses Turborepo):

```bash
pnpm dev            # Backend + frontend concurrently
pnpm build          # Build all packages and apps
pnpm lint           # Lint all packages and apps
pnpm typecheck      # Typecheck all packages and apps
pnpm format         # Prettier write
pnpm format:check   # Prettier check
pnpm docker:up      # Start Postgres and Redis
pnpm docker:down    # Stop containers
```

Backend (`backend/`):

```bash
pnpm dev            # Watch mode
pnpm build          # Compile NestJS
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests
pnpm prisma:migrate # Dev migrations
```

Frontend (`frontend/`):

```bash
pnpm dev            # Next.js dev server
pnpm build          # Production build
pnpm start          # Production server
```

## Docker

Start only infrastructure (recommended for local development):

```bash
docker compose up -d postgres redis
# or
pnpm docker:up
```

Build and run the backend container (includes migrate on start):

```bash
pnpm docker:backend
# or
docker compose --profile full up -d --build backend
```

Production-like local stack:

```bash
pnpm docker:prod
```

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for full production deployment (Vercel, Railway, secrets, monitoring, backups).

## CI / CD

GitHub Actions:

| Workflow              | Trigger                       | Purpose                               |
| --------------------- | ----------------------------- | ------------------------------------- |
| `ci.yml`              | Push/PR to `main`             | Lint, test, build, migrations, Docker |
| `deploy.yml`          | After successful CI on `main` | Deploy to Vercel + Railway            |
| `backup-database.yml` | Daily 03:00 UTC + manual      | Postgres backup artifact              |

Configure secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RAILWAY_TOKEN`, `RAILWAY_PUBLIC_DOMAIN`, `DATABASE_URL` (backups).

## License

Private — UNLICENSED

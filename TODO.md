# Rezerva — Implementation Tasks

**Rule:** Each task is designed to complete in **≤ 2 hours**.  
**Format:** Goal · Files · Dependencies · Definition of Done · Estimated Time  
**Status key:** `[ ]` todo · `[~]` in progress · `[x]` done

Tasks are ordered by dependency. Complete a phase before starting the next unless noted.

---

## Phase 0 — Repository cleanup & baseline (legacy → Rezerva)

### T-001 · Remove legacy ordering domain (backend)

**Goal:** Delete food-ordering code so new work targets the booking platform only.

**Files:**

- `backend/src/orders/` (delete)
- `backend/src/app.module.ts`
- `backend/src/queue/order.processor.ts`
- `backend/prisma/seed.ts`

**Dependencies:** None

**Definition of Done:**

- [x] `OrdersModule` removed from `AppModule`
- [x] Order queue processor removed or renamed for future booking notifications
- [x] Backend builds without order imports
- [x] Seed no longer references `Product` / `Order`

**Estimated Time:** 45 min

---

### T-002 · Commit initial Prisma migration

**Goal:** Create first migration from current `schema.prisma` and verify local apply.

**Files:**

- `backend/prisma/migrations/` (new)
- `backend/prisma/schema.prisma`

**Dependencies:** T-001

**Definition of Done:**

- [x] `prisma migrate dev --name init_rezerva` succeeds on empty DB
- [x] Migration SQL reviewed (UUID, indexes, FKs)
- [x] `prisma migrate deploy` documented in README
- [x] Exclusion constraint comment noted for follow-up migration (bookings)

**Estimated Time:** 90 min

---

### T-003 · Root README with setup instructions

**Goal:** Document clone → install → env → migrate → dev flow.

**Files:**

- `README.md` (new)
- `backend/.env.example`
- `frontend/.env.example`

**Dependencies:** T-002

**Definition of Done:**

- [x] Fresh clone steps verified
- [x] Required env vars listed
- [x] Links to `docs/API.md`, architecture docs
- [x] CI badge placeholder or live badge

**Estimated Time:** 60 min

---

## Phase 1 — Monorepo shared packages (M0)

### T-004 · Scaffold `packages/tsconfig`

**Goal:** Shared TypeScript bases for NestJS and Next.js apps.

**Files:**

- `packages/tsconfig/base.json`
- `packages/tsconfig/nestjs.json`
- `packages/tsconfig/nextjs.json`
- `package.json` (root workspaces)
- `frontend/tsconfig.json`
- `backend/tsconfig.json`

**Dependencies:** T-003

**Definition of Done:**

- [ ] Root workspaces include `packages/*`
- [ ] Both apps extend shared base
- [ ] `npm run build` passes

**Estimated Time:** 60 min

---

### T-005 · Scaffold `packages/shared-constants`

**Goal:** Single source for enums used by frontend and backend.

**Files:**

- `packages/shared-constants/package.json`
- `packages/shared-constants/src/index.ts`
- `packages/shared-constants/src/locale.ts`
- `packages/shared-constants/src/business-category.ts`
- `packages/shared-constants/src/booking-status.ts`

**Dependencies:** T-004

**Definition of Done:**

- [ ] Exports `Locale`, `BusinessCategory`, `BookingStatus`, `PlatformRole`
- [ ] Imported in frontend and backend without duplicate enums

**Estimated Time:** 45 min

---

### T-006 · Scaffold `packages/shared-validation`

**Goal:** Shared Zod schemas for phone and OTP.

**Files:**

- `packages/shared-validation/package.json`
- `packages/shared-validation/src/phone.schema.ts`
- `packages/shared-validation/src/otp.schema.ts`
- `packages/shared-validation/src/index.ts`

**Dependencies:** T-005

**Definition of Done:**

- [ ] Phone E.164 +998 normalization schema exported
- [ ] OTP 6-digit schema exported
- [ ] Unit test or manual verify in both apps

**Estimated Time:** 60 min

---

### T-007 · Wire workspace dependencies

**Goal:** Connect apps to shared packages.

**Files:**

- `frontend/package.json`
- `backend/package.json`
- `package-lock.json`

**Dependencies:** T-005, T-006

**Definition of Done:**

- [ ] `npm install` at root resolves workspace links
- [ ] Lint and build pass with shared imports

**Estimated Time:** 30 min

---

## Phase 2 — Backend shared infrastructure (M0)

### T-008 · Reorganize backend into `shared/` folder

**Goal:** Move cross-cutting modules per `docs/BACKEND_ARCHITECTURE.md`.

**Files:**

- `backend/src/shared/database/` ← `prisma/`
- `backend/src/shared/config/`
- `backend/src/shared/health/`
- `backend/src/shared/queue/`
- `backend/src/shared/storage/`
- `backend/src/app.module.ts`

**Dependencies:** T-001

**Definition of Done:**

- [ ] Imports updated across codebase
- [ ] Backend builds and starts

**Estimated Time:** 90 min

---

### T-009 · Environment validation on boot

**Goal:** Fail fast in production when required env vars missing.

**Files:**

- `backend/src/shared/config/env.validation.ts`
- `backend/src/shared/config/configuration.ts`
- `backend/src/main.ts`

**Dependencies:** T-008

**Definition of Done:**

- [ ] Zod/Joi schema validates `JWT_SECRET`, `DATABASE_URL`, `REDIS_HOST`
- [ ] Production boot throws on missing vars
- [ ] Dev allows sensible defaults with warning

**Estimated Time:** 60 min

---

### T-010 · Global `/v1` prefix and exception filters

**Goal:** Align API with `docs/API.md` conventions.

**Files:**

- `backend/src/main.ts`
- `backend/src/shared/filters/http-exception.filter.ts`
- `backend/src/shared/filters/prisma-exception.filter.ts`
- `backend/src/shared/filters/all-exceptions.filter.ts`
- `backend/src/shared/types/api-error.type.ts`

**Dependencies:** T-008

**Definition of Done:**

- [ ] All routes prefixed `/v1`
- [ ] Standard error shape `{ statusCode, code, message, details, requestId }`
- [ ] P2002 → 409, P2025 → 404 mapped

**Estimated Time:** 90 min

---

### T-011 · JWT guards and decorators

**Goal:** Shared auth infrastructure for feature modules.

**Files:**

- `backend/src/shared/guards/jwt-auth.guard.ts`
- `backend/src/shared/guards/public.decorator.ts`
- `backend/src/shared/guards/roles.guard.ts`
- `backend/src/shared/decorators/current-user.decorator.ts`
- `backend/src/shared/types/jwt-payload.type.ts`

**Dependencies:** T-010

**Definition of Done:**

- [ ] `@Public()` skips JWT
- [ ] `@CurrentUser()` extracts payload
- [ ] Global JWT guard registered with public exceptions

**Estimated Time:** 90 min

---

### T-012 · Health endpoint with Redis check

**Goal:** `/health` reports Postgres and Redis status.

**Files:**

- `backend/src/shared/health/health.controller.ts`
- `backend/src/shared/health/health.module.ts`

**Dependencies:** T-008

**Definition of Done:**

- [ ] Returns `{ status, db, redis, timestamp }`
- [ ] HTTP 503 when either dependency down
- [ ] Docker compose healthcheck passes

**Estimated Time:** 45 min

---

### T-013 · CI: add migrate, tests, typecheck

**Goal:** Strengthen `.github/workflows/ci.yml`.

**Files:**

- `.github/workflows/ci.yml`

**Dependencies:** T-002

**Definition of Done:**

- [ ] `prisma migrate deploy` runs against CI Postgres
- [ ] Backend unit test job runs (at least health e2e)
- [ ] Fails on lint/type errors

**Estimated Time:** 90 min

---

## Phase 3 — Backend auth feature (M0)

### T-014 · Create `features/auth` module skeleton

**Goal:** Feature-first auth folder with module, controller, service stubs.

**Files:**

- `backend/src/features/auth/auth.module.ts`
- `backend/src/features/auth/auth.controller.ts`
- `backend/src/features/auth/auth.service.ts`
- `backend/src/app.module.ts`

**Dependencies:** T-011

**Definition of Done:**

- [ ] Module registered in AppModule
- [ ] Old `backend/src/auth/` removed or re-exported temporarily

**Estimated Time:** 45 min

---

### T-015 · Auth repositories (User, Identity, Session, OTP)

**Goal:** Encapsulate Prisma access for auth models.

**Files:**

- `backend/src/features/auth/repositories/user.repository.ts`
- `backend/src/features/auth/repositories/user-identity.repository.ts`
- `backend/src/features/auth/repositories/session.repository.ts`
- `backend/src/features/auth/repositories/otp.repository.ts`

**Dependencies:** T-014, T-002

**Definition of Done:**

- [ ] CRUD methods for each model
- [ ] No Prisma calls outside repositories in auth feature

**Estimated Time:** 90 min

---

### T-016 · OTP send endpoint

**Goal:** `POST /v1/auth/otp/send` with rate limiting.

**Files:**

- `backend/src/features/auth/dto/send-otp.dto.ts`
- `backend/src/features/auth/services/otp.service.ts`
- `backend/src/features/auth/services/rate-limit.service.ts`
- `backend/src/features/auth/auth.controller.ts`

**Dependencies:** T-015, T-006

**Definition of Done:**

- [ ] Phone normalized to +998 E.164
- [ ] OTP hashed in DB, 5 min expiry
- [ ] Max 3 sends/hour/phone (Redis)
- [ ] Returns 202 with `expiresInSeconds`

**Estimated Time:** 120 min

---

### T-017 · OTP verify endpoint

**Goal:** `POST /v1/auth/otp/verify` issues JWT pair.

**Files:**

- `backend/src/features/auth/dto/verify-otp.dto.ts`
- `backend/src/features/auth/services/token.service.ts`
- `backend/src/features/auth/auth.controller.ts`

**Dependencies:** T-016

**Definition of Done:**

- [ ] Returns access + refresh tokens
- [ ] Creates User + UserIdentity if new
- [ ] Invalid/expired OTP → 401
- [ ] Max 5 attempts per OTP

**Estimated Time:** 120 min

---

### T-018 · Migrate Telegram login to features/auth

**Goal:** Move and upgrade Telegram auth with `user_identities`.

**Files:**

- `backend/src/features/auth/dto/telegram-login.dto.ts`
- `backend/src/features/auth/services/telegram-auth.service.ts`
- `backend/src/features/auth/auth.controller.ts`
- Delete `backend/src/auth/`

**Dependencies:** T-015

**Definition of Done:**

- [ ] `POST /v1/auth/telegram` works
- [ ] Hash verification + 24h auth_date check
- [ ] Upserts UserIdentity(provider: telegram)
- [ ] Frontend Telegram widget still works

**Estimated Time:** 90 min

---

### T-019 · Refresh token rotation

**Goal:** `POST /v1/auth/refresh` with session rotation.

**Files:**

- `backend/src/features/auth/dto/refresh-token.dto.ts`
- `backend/src/features/auth/services/session.service.ts`
- `backend/src/features/auth/auth.controller.ts`

**Dependencies:** T-017

**Definition of Done:**

- [ ] Refresh rotates token; old token invalidated
- [ ] Reuse detection revokes session
- [ ] JWT claims: sub, role, locale, jti

**Estimated Time:** 90 min

---

### T-020 · Logout and session list endpoints

**Goal:** Session management API.

**Files:**

- `backend/src/features/auth/dto/logout.dto.ts`
- `backend/src/features/auth/auth.controller.ts`

**Dependencies:** T-019

**Definition of Done:**

- [ ] `POST /v1/auth/logout` revokes session(s)
- [ ] `GET /v1/auth/sessions` lists active sessions
- [ ] `DELETE /v1/auth/sessions/:id` revokes one

**Estimated Time:** 60 min

---

### T-021 · Auth unit tests

**Goal:** Test OTP hash, expiry, Telegram hash verification.

**Files:**

- `backend/src/features/auth/services/otp.service.spec.ts`
- `backend/src/features/auth/services/telegram-auth.service.spec.ts`

**Dependencies:** T-017, T-018

**Definition of Done:**

- [ ] Tests pass in CI
- [ ] Coverage for happy path + main error cases

**Estimated Time:** 90 min

---

## Phase 4 — Backend geo feature (M0)

### T-022 · Geo seed data (Tashkent)

**Goal:** Seed countries, regions, districts, cities.

**Files:**

- `backend/prisma/seed/geo.seed.ts`
- `backend/prisma/seed.ts`

**Dependencies:** T-002

**Definition of Done:**

- [ ] Uzbekistan + Tashkent regions/districts seeded
- [ ] `prisma db seed` idempotent

**Estimated Time:** 60 min

---

### T-023 · Geo module (read-only API)

**Goal:** Public geo endpoints per `docs/API.md`.

**Files:**

- `backend/src/features/geo/geo.module.ts`
- `backend/src/features/geo/geo.controller.ts`
- `backend/src/features/geo/geo.service.ts`
- `backend/src/features/geo/repositories/*.ts`

**Dependencies:** T-022, T-010

**Definition of Done:**

- [ ] `GET /v1/geo/countries`, regions, districts, cities
- [ ] All routes `@Public()`
- [ ] Only active records returned

**Estimated Time:** 90 min

---

## Phase 5 — Frontend foundation (M0)

### T-024 · Frontend folder restructure

**Goal:** Create `features/` and `shared/` per `docs/FRONTEND_ARCHITECTURE.md`.

**Files:**

- `frontend/src/shared/components/ui/` ← move from `components/ui/`
- `frontend/src/shared/lib/` ← move from `lib/`
- `frontend/src/features/auth/` (new)
- Delete or migrate `components/home-client.tsx`, `hero.tsx`

**Dependencies:** T-003

**Definition of Done:**

- [ ] Import paths use `@/shared/` and `@/features/`
- [ ] App builds without broken imports

**Estimated Time:** 90 min

---

### T-025 · Design tokens in globals.css

**Goal:** Primary `#2563EB`, success/warning/destructive, dark mode.

**Files:**

- `frontend/src/app/globals.css`
- `frontend/src/shared/providers/theme-provider.tsx`

**Dependencies:** T-024

**Definition of Done:**

- [ ] Primary blue in light/dark
- [ ] Semantic color tokens defined
- [ ] ThemeProvider toggles `.dark` on html

**Estimated Time:** 60 min

---

### T-026 · Install core shadcn components

**Goal:** Button, Input, Card, Dialog, Sheet, Skeleton, Sonner, Form, Label.

**Files:**

- `frontend/src/shared/components/ui/*.tsx`
- `frontend/components.json`

**Dependencies:** T-025

**Definition of Done:**

- [ ] Components match design tokens (no hardcoded colors)
- [ ] Storybook optional; manual smoke on placeholder page OK

**Estimated Time:** 90 min

---

### T-027 · API client split (server + client)

**Goal:** Replace monolithic `lib/api.ts`.

**Files:**

- `frontend/src/shared/lib/api-client.ts`
- `frontend/src/shared/lib/api-client.server.ts`
- `frontend/src/shared/types/api-error.ts`
- Remove `frontend/src/lib/api.ts`

**Dependencies:** T-024

**Definition of Done:**

- [ ] Typed fetch with standard error handling
- [ ] Server client reads cookies
- [ ] Base URL from env

**Estimated Time:** 90 min

---

### T-028 · Auth feature API + hooks

**Goal:** Client auth layer for login flows.

**Files:**

- `frontend/src/features/auth/api/auth.api.ts`
- `frontend/src/features/auth/hooks/use-auth.ts`
- `frontend/src/features/auth/hooks/use-login.ts`
- `frontend/src/features/auth/types/`

**Dependencies:** T-027, T-006

**Definition of Done:**

- [ ] `sendOtp`, `verifyOtp`, `loginTelegram`, `logout` functions
- [ ] `useAuth` exposes user + isAuthenticated

**Estimated Time:** 90 min

---

### T-029 · Route groups: `(auth)` and `(consumer)`

**Goal:** App Router layout split.

**Files:**

- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/verify/page.tsx`
- `frontend/src/app/(consumer)/layout.tsx`
- `frontend/src/app/(consumer)/page.tsx`
- `frontend/src/app/page.tsx` (redirect or remove)

**Dependencies:** T-024

**Definition of Done:**

- [ ] Login at `/login`, verify at `/verify`
- [ ] Consumer homepage at `/`
- [ ] Layouts render correctly

**Estimated Time:** 90 min

---

### T-030 · Consumer AppShell (Header, Footer, MobileTabBar)

**Goal:** M0 consumer shell components.

**Files:**

- `frontend/src/shared/components/layout/consumer-header.tsx`
- `frontend/src/shared/components/layout/consumer-footer.tsx`
- `frontend/src/shared/components/navigation/mobile-tab-bar.tsx`
- `frontend/src/app/(consumer)/layout.tsx`

**Dependencies:** T-029, T-026

**Definition of Done:**

- [ ] Responsive at 375px
- [ ] Mobile tab bar hidden on md+
- [ ] Header shows login or avatar

**Estimated Time:** 120 min

---

### T-031 · Login page (C-50)

**Goal:** Phone OTP + Telegram widget login.

**Files:**

- `frontend/src/features/auth/components/login-form.tsx`
- `frontend/src/features/auth/components/phone-input.tsx`
- `frontend/src/features/auth/components/telegram-login-button.tsx`
- `frontend/src/app/(auth)/login/page.tsx`

**Dependencies:** T-028, T-016, T-018

**Definition of Done:**

- [ ] Phone submit navigates to `/verify`
- [ ] Telegram login calls API and redirects home
- [ ] React Hook Form + Zod validation

**Estimated Time:** 120 min

---

### T-032 · OTP verify page (C-51)

**Goal:** 6-digit OTP entry with resend timer.

**Files:**

- `frontend/src/features/auth/components/otp-input.tsx`
- `frontend/src/features/auth/components/otp-verify-form.tsx`
- `frontend/src/app/(auth)/verify/page.tsx`

**Dependencies:** T-031, T-017

**Definition of Done:**

- [ ] Verify issues session and redirects to `returnUrl` or `/`
- [ ] Resend disabled for 60s
- [ ] Error states for invalid OTP

**Estimated Time:** 90 min

---

### T-033 · Auth middleware (protected routes)

**Goal:** Edge middleware for route protection.

**Files:**

- `frontend/src/middleware.ts`
- `frontend/src/shared/lib/auth.server.ts`

**Dependencies:** T-019, T-029

**Definition of Done:**

- [ ] `/bookings/*`, `/book/*` redirect to login when unauthenticated
- [ ] `/login` redirects home when authenticated
- [ ] httpOnly cookie for refresh token (no localStorage)

**Estimated Time:** 120 min

---

### T-034 · Homepage placeholder (C-01)

**Goal:** Category grid + hero placeholder.

**Files:**

- `frontend/src/features/search/components/homepage-hero.tsx`
- `frontend/src/features/search/components/category-grid.tsx`
- `frontend/src/app/(consumer)/page.tsx`

**Dependencies:** T-030

**Definition of Done:**

- [ ] Category cards render (static data OK)
- [ ] Server Component page, client islands only where needed

**Estimated Time:** 60 min

---

### T-035 · EmptyState + Skeleton primitives

**Goal:** Shared feedback components per `docs/COMPONENTS.md`.

**Files:**

- `frontend/src/shared/components/feedback/empty-state.tsx`
- `frontend/src/shared/components/ui/skeleton.tsx`
- `frontend/src/shared/components/feedback/venue-card-skeleton.tsx`

**Dependencies:** T-026

**Definition of Done:**

- [ ] EmptyState accepts icon, title, description, action
- [ ] VenueCardSkeleton matches card dimensions

**Estimated Time:** 60 min

---

## Phase 6 — M0 gate & deploy

### T-036 · Deploy workflow: prisma migrate

**Goal:** Railway runs migrations before start.

**Files:**

- `.github/workflows/deploy.yml`
- `backend/railway.toml` or start script
- `docs/runbooks/deploy.md`

**Dependencies:** T-002, T-013

**Definition of Done:**

- [ ] Merge to main deploys with migrate
- [ ] Runbook documents secrets and rollback

**Estimated Time:** 60 min

---

### T-037 · M0 smoke test checklist

**Goal:** Verify M0 epic acceptance criteria end-to-end.

**Files:**

- `docs/runbooks/m0-smoke-test.md`

**Dependencies:** T-031, T-032, T-012, T-033

**Definition of Done:**

- [ ] OTP login works on staging
- [ ] Telegram login works
- [ ] Health shows db + redis ok
- [ ] CI green on main

**Estimated Time:** 60 min

---

## Phase 7 — Business domain backend (M1)

### T-038 · Business module skeleton + repository

**Goal:** `features/business` with BusinessRepository.

**Files:**

- `backend/src/features/business/business.module.ts`
- `backend/src/features/business/repositories/business.repository.ts`
- `backend/src/features/business/repositories/business-member.repository.ts`

**Dependencies:** T-037

**Definition of Done:**

- [ ] Module registered
- [ ] Repository queries with soft-delete filter

**Estimated Time:** 60 min

---

### T-039 · Business registration API

**Goal:** `POST /v1/businesses` creates draft business.

**Files:**

- `backend/src/features/business/business.controller.ts`
- `backend/src/features/business/business.service.ts`
- `backend/src/features/business/dto/create-business.dto.ts`

**Dependencies:** T-038

**Definition of Done:**

- [ ] Slug auto-generated, unique
- [ ] Owner added as BusinessMember
- [ ] Status `draft`

**Estimated Time:** 90 min

---

### T-040 · BusinessMemberGuard

**Goal:** Tenant-scoped authorization for business routes.

**Files:**

- `backend/src/shared/guards/business-member.guard.ts`
- `backend/src/shared/guards/business-role.decorator.ts`

**Dependencies:** T-038

**Definition of Done:**

- [ ] Guard validates membership + role
- [ ] 403 when not a member

**Estimated Time:** 90 min

---

### T-041 · Business profile CRUD API

**Goal:** GET/PATCH business, list my businesses.

**Files:**

- `backend/src/features/business/dto/update-business.dto.ts`
- `backend/src/features/business/business.controller.ts`

**Dependencies:** T-039, T-040

**Definition of Done:**

- [ ] `GET /v1/businesses/me`, `GET/PATCH /v1/businesses/:id`
- [ ] Only owner/manager can PATCH

**Estimated Time:** 90 min

---

### T-042 · Venue (location) API

**Goal:** CRUD for `business_locations`.

**Files:**

- `backend/src/features/venue/venue.module.ts`
- `backend/src/features/venue/venue.controller.ts`
- `backend/src/features/venue/venue.service.ts`

**Dependencies:** T-041

**Definition of Done:**

- [ ] Create/update/delete venue under business
- [ ] Public list at `GET /v1/businesses/:id/venues`

**Estimated Time:** 120 min

---

### T-043 · Working hours + blocked dates API

**Goal:** Venue schedule management.

**Files:**

- `backend/src/features/venue/working-hours.service.ts`
- `backend/src/features/venue/blocked-date.service.ts`
- `backend/src/features/venue/venue.controller.ts`

**Dependencies:** T-042

**Definition of Done:**

- [ ] PUT working hours (7 days)
- [ ] POST/DELETE blocked dates

**Estimated Time:** 90 min

---

### T-044 · Catalog: resources API

**Goal:** CRUD bookable resources (pitches).

**Files:**

- `backend/src/features/catalog/catalog.module.ts`
- `backend/src/features/catalog/resource.controller.ts`
- `backend/src/features/catalog/resource.service.ts`

**Dependencies:** T-042

**Definition of Done:**

- [ ] CRUD under business
- [ ] Football pitch extension optional follow-up

**Estimated Time:** 120 min

---

### T-045 · Catalog: services API

**Goal:** CRUD services + service-resource linking.

**Files:**

- `backend/src/features/catalog/service.controller.ts`
- `backend/src/features/catalog/service.service.ts`

**Dependencies:** T-044

**Definition of Done:**

- [ ] Service linked to resources
- [ ] Public list on business profile

**Estimated Time:** 120 min

---

### T-046 · Business policy API

**Goal:** Cancellation/deposit policy CRUD.

**Files:**

- `backend/src/features/business/business-policy.service.ts`
- `backend/src/features/business/dto/business-policy.dto.ts`

**Dependencies:** T-041

**Definition of Done:**

- [ ] Policy saved during onboarding
- [ ] Returned on public profile

**Estimated Time:** 60 min

---

### T-047 · Onboarding wizard API

**Goal:** Step state machine for business onboarding.

**Files:**

- `backend/src/features/business/onboarding.controller.ts`
- `backend/src/features/business/onboarding.service.ts`

**Dependencies:** T-042, T-044, T-045, T-046

**Definition of Done:**

- [ ] GET progress, PATCH step, POST submit
- [ ] Steps validated in order

**Estimated Time:** 120 min

---

### T-048 · Media upload (Supabase signed URLs)

**Goal:** Upload URL + confirm endpoints.

**Files:**

- `backend/src/features/business/business-media.controller.ts`
- `backend/src/features/business/business-media.service.ts`
- `backend/src/shared/storage/storage.service.ts`

**Dependencies:** T-041

**Definition of Done:**

- [ ] Signed URL generation
- [ ] Confirm saves BusinessMedia record
- [ ] Mime/size validation

**Estimated Time:** 90 min

---

### T-049 · Football profile extension

**Goal:** FootballVenueProfile + FootballPitch on resource create.

**Files:**

- `backend/src/features/business/repositories/football-profile.repository.ts`
- `backend/src/features/catalog/category-resource.service.ts`

**Dependencies:** T-044

**Definition of Done:**

- [ ] Pitch metadata saved with resource
- [ ] Returned on public profile

**Estimated Time:** 90 min

---

## Phase 8 — Search & public profile (M2 prep)

### T-050 · Search module API

**Goal:** List businesses with filters.

**Files:**

- `backend/src/features/search/search.module.ts`
- `backend/src/features/search/search.controller.ts`
- `backend/src/features/search/search.service.ts`

**Dependencies:** T-041

**Definition of Done:**

- [ ] `GET /v1/businesses` with category, district, pagination
- [ ] Only `active` businesses returned

**Estimated Time:** 90 min

---

### T-051 · Public business profile by slug

**Goal:** `GET /v1/businesses/slug/:slug`.

**Files:**

- `backend/src/features/search/search.controller.ts`
- `backend/src/features/business/business.service.ts`

**Dependencies:** T-050

**Definition of Done:**

- [ ] Returns profile + venues + services summary + policies
- [ ] 404 for inactive/missing

**Estimated Time:** 60 min

---

### T-052 · Demo business seed

**Goal:** Seed one football business for dev/staging.

**Files:**

- `backend/prisma/seed/business.seed.ts`
- `backend/prisma/seed.ts`

**Dependencies:** T-022, T-049

**Definition of Done:**

- [ ] Active football business with pitch + service
- [ ] Bookable in dev after M2

**Estimated Time:** 90 min

---

## Phase 9 — Booking engine backend (M2)

### T-053 · Booking migration (exclusion constraint)

**Goal:** Raw SQL migration for allocation overlap prevention.

**Files:**

- `backend/prisma/migrations/*_booking_exclusion/`

**Dependencies:** T-002

**Definition of Done:**

- [ ] Exclusion constraint on resource_id + time range
- [ ] Migration applies cleanly

**Estimated Time:** 90 min

---

### T-054 · Availability service

**Goal:** Compute available slots from hours − blocks − allocations − holds.

**Files:**

- `backend/src/features/availability/availability.module.ts`
- `backend/src/features/availability/availability.service.ts`
- `backend/src/features/availability/slot-calculator.service.ts`

**Dependencies:** T-043, T-045

**Definition of Done:**

- [ ] Pure slot calculator unit tested
- [ ] `GET /v1/businesses/:id/availability` returns slots

**Estimated Time:** 120 min

---

### T-055 · Availability Redis cache

**Goal:** 5-min cache with invalidation hooks.

**Files:**

- `backend/src/features/availability/availability-cache.service.ts`

**Dependencies:** T-054

**Definition of Done:**

- [ ] Cache hit/miss logged
- [ ] Invalidation stub on booking write (wired in T-058)

**Estimated Time:** 60 min

---

### T-056 · Slot hold service

**Goal:** Create/release holds with Redis lock + 10 min TTL.

**Files:**

- `backend/src/features/booking/slot-hold.service.ts`
- `backend/src/features/booking/repositories/slot-hold.repository.ts`
- `backend/src/features/booking/booking.controller.ts` (hold routes)

**Dependencies:** T-054

**Definition of Done:**

- [ ] `POST /v1/bookings/holds` creates hold
- [ ] Concurrent last-slot: only one succeeds
- [ ] `DELETE` releases hold

**Estimated Time:** 120 min

---

### T-057 · Hold expiry processor

**Goal:** BullMQ job expires stale holds.

**Files:**

- `backend/src/features/booking/processors/hold-expiry.processor.ts`
- `backend/src/shared/queue/queue.constants.ts`

**Dependencies:** T-056

**Definition of Done:**

- [ ] Expired holds marked `expired`
- [ ] Job runs on schedule or delayed queue

**Estimated Time:** 60 min

---

### T-058 · Booking confirm (pay at venue)

**Goal:** Create booking from hold in transaction.

**Files:**

- `backend/src/features/booking/booking.service.ts`
- `backend/src/features/booking/repositories/booking.repository.ts`
- `backend/src/features/booking/booking.controller.ts`

**Dependencies:** T-056

**Definition of Done:**

- [ ] `POST /v1/bookings` with holdId
- [ ] Reference code generated
- [ ] Status history appended
- [ ] policySnapshot stored

**Estimated Time:** 120 min

---

### T-059 · Booking cancel + policy evaluator

**Goal:** Consumer cancel with fee calculation.

**Files:**

- `backend/src/features/booking/booking-policy.service.ts`
- `backend/src/features/booking/booking.controller.ts`

**Dependencies:** T-058

**Definition of Done:**

- [ ] Cancel respects policy_snapshot
- [ ] Returns fee/refund amounts

**Estimated Time:** 90 min

---

### T-060 · My bookings + detail API

**Goal:** Consumer booking list and detail.

**Files:**

- `backend/src/features/booking/booking.controller.ts`
- `backend/src/features/booking/dto/booking-response.dto.ts`

**Dependencies:** T-058

**Definition of Done:**

- [ ] `GET /v1/bookings/me`, `GET /v1/bookings/:id`
- [ ] Includes timeline, canCancel flag

**Estimated Time:** 90 min

---

### T-061 · Business booking ops API

**Goal:** Check-in, complete, no-show, accept/reject.

**Files:**

- `backend/src/features/booking/business-booking.controller.ts`

**Dependencies:** T-058, T-040

**Definition of Done:**

- [ ] Status transitions enforced
- [ ] Business calendar data endpoint stub

**Estimated Time:** 120 min

---

### T-062 · Booking e2e test

**Goal:** Full hold → confirm flow integration test.

**Files:**

- `backend/test/booking.e2e-spec.ts`

**Dependencies:** T-058, T-052

**Definition of Done:**

- [ ] E2E passes in CI
- [ ] Double-booking case covered

**Estimated Time:** 90 min

---

## Phase 10 — Consumer booking UI (M2)

### T-063 · VenueCard + SearchResultsList

**Goal:** Search result components.

**Files:**

- `frontend/src/features/search/components/venue-card.tsx`
- `frontend/src/features/search/components/search-results-list.tsx`
- `frontend/src/features/search/api/search.api.ts`

**Dependencies:** T-050, T-035

**Definition of Done:**

- [ ] Card shows image, rating, district, price from
- [ ] Skeleton loading state (L-04)

**Estimated Time:** 90 min

---

### T-064 · Search page + category landing

**Goal:** C-02, C-03 basic search UI.

**Files:**

- `frontend/src/app/(consumer)/search/page.tsx`
- `frontend/src/app/(consumer)/categories/[category]/page.tsx`
- `frontend/src/features/search/components/search-bar.tsx`

**Dependencies:** T-063

**Definition of Done:**

- [ ] Filter by category
- [ ] Paginated results

**Estimated Time:** 120 min

---

### T-065 · Business profile page (C-20)

**Goal:** Public profile with services + book CTA.

**Files:**

- `frontend/src/app/(consumer)/businesses/[slug]/page.tsx`
- `frontend/src/features/business/components/business-profile-header.tsx`
- `frontend/src/features/business/api/business.api.ts`

**Dependencies:** T-051

**Definition of Done:**

- [ ] SSR/ISR page with generateMetadata
- [ ] Book button links to `/book/[slug]`

**Estimated Time:** 120 min

---

### T-066 · Booking flow routes + stepper

**Goal:** Shell for C-30–C-38.

**Files:**

- `frontend/src/app/(consumer)/book/[businessSlug]/layout.tsx`
- `frontend/src/features/booking/components/booking-stepper.tsx`
- `frontend/src/shared/components/layout/sticky-footer.tsx`

**Dependencies:** T-065, T-033

**Definition of Done:**

- [ ] 4-step stepper visible
- [ ] Sticky footer on mobile

**Estimated Time:** 90 min

---

### T-067 · Service select step (C-31)

**Goal:** Service selection UI.

**Files:**

- `frontend/src/app/(consumer)/book/[businessSlug]/service/page.tsx`
- `frontend/src/features/booking/components/service-card.tsx`

**Dependencies:** T-066, T-045

**Definition of Done:**

- [ ] Lists services from API
- [ ] Selection persists in URL or state

**Estimated Time:** 60 min

---

### T-068 · Date + slot picker (C-33)

**Goal:** Availability calendar + slot grid.

**Files:**

- `frontend/src/app/(consumer)/book/[businessSlug]/slot/page.tsx`
- `frontend/src/features/booking/components/availability-calendar.tsx`
- `frontend/src/features/booking/components/slot-grid.tsx`
- `frontend/src/features/booking/hooks/use-availability.ts`

**Dependencies:** T-054, T-067

**Definition of Done:**

- [ ] Slots load for selected date
- [ ] ER-08 empty/error state (E-15)
- [ ] SlotGrid skeleton (L-07)

**Estimated Time:** 120 min

---

### T-069 · Hold banner + countdown

**Goal:** Hold UX during booking flow.

**Files:**

- `frontend/src/features/booking/components/hold-banner.tsx`
- `frontend/src/features/booking/components/hold-countdown.tsx`
- `frontend/src/features/booking/hooks/use-slot-hold.ts`

**Dependencies:** T-056, T-068

**Definition of Done:**

- [ ] Hold created on slot select
- [ ] Countdown visible; ER-09 on expiry

**Estimated Time:** 90 min

---

### T-070 · Summary + confirm step (C-38)

**Goal:** Booking summary and confirm.

**Files:**

- `frontend/src/app/(consumer)/book/[businessSlug]/summary/page.tsx`
- `frontend/src/features/booking/components/booking-summary.tsx`

**Dependencies:** T-069, T-058

**Definition of Done:**

- [ ] Shows policy, price, time
- [ ] Confirm calls API pay_at_venue

**Estimated Time:** 90 min

---

### T-071 · Booking success page (C-42)

**Goal:** Reference code + QR link.

**Files:**

- `frontend/src/app/(consumer)/book/[businessSlug]/success/page.tsx`
- `frontend/src/features/booking/components/booking-success.tsx`

**Dependencies:** T-070

**Definition of Done:**

- [ ] Displays reference code
- [ ] Link to my bookings

**Estimated Time:** 60 min

---

### T-072 · My bookings list (C-52)

**Goal:** Upcoming/past tabs with BookingCard.

**Files:**

- `frontend/src/app/(consumer)/bookings/page.tsx`
- `frontend/src/features/booking/components/booking-card.tsx`
- `frontend/src/features/booking/components/status-badge.tsx`
- `frontend/src/features/booking/hooks/use-my-bookings.ts`

**Dependencies:** T-060, T-033

**Definition of Done:**

- [ ] Tabs: upcoming / past
- [ ] Empty state E-02

**Estimated Time:** 90 min

---

### T-073 · Booking detail + cancel dialog (C-53, D-03)

**Goal:** Detail page with timeline and cancel.

**Files:**

- `frontend/src/app/(consumer)/bookings/[id]/page.tsx`
- `frontend/src/features/booking/components/booking-timeline.tsx`
- `frontend/src/features/booking/components/cancel-booking-dialog.tsx`

**Dependencies:** T-072, T-059

**Definition of Done:**

- [ ] Timeline from status history
- [ ] Cancel dialog shows policy summary

**Estimated Time:** 120 min

---

## Phase 11 — Payments (M3)

### T-074 · Payment module backend

**Goal:** Payment + ledger repositories.

**Files:**

- `backend/src/features/payment/payment.module.ts`
- `backend/src/features/payment/repositories/payment.repository.ts`
- `backend/src/features/payment/repositories/payment-transaction.repository.ts`

**Dependencies:** T-058

**Definition of Done:**

- [ ] Append-only transaction ledger
- [ ] Idempotency key unique constraint used

**Estimated Time:** 90 min

---

### T-075 · Payme adapter + initiate endpoint

**Goal:** Start Payme payment flow.

**Files:**

- `backend/src/features/payment/adapters/payme.adapter.ts`
- `backend/src/features/payment/payment.controller.ts`

**Dependencies:** T-074

**Definition of Done:**

- [ ] `POST /v1/bookings/:id/payment/initiate` returns redirectUrl
- [ ] Sandbox credentials via env

**Estimated Time:** 120 min

---

### T-076 · Payme webhook

**Goal:** Verified webhook with idempotent processing.

**Files:**

- `backend/src/webhooks/payme.webhook.controller.ts`
- `backend/src/features/payment/payment-webhook.service.ts`

**Dependencies:** T-075

**Definition of Done:**

- [ ] Invalid signature rejected
- [ ] Duplicate webhook no double charge
- [ ] Booking confirmed on success

**Estimated Time:** 120 min

---

### T-077 · Click adapter + webhook

**Goal:** Second payment provider.

**Files:**

- `backend/src/features/payment/adapters/click.adapter.ts`
- `backend/src/webhooks/click.webhook.controller.ts`

**Dependencies:** T-076

**Definition of Done:**

- [ ] Same idempotency pattern as Payme
- [ ] E2E sandbox test documented

**Estimated Time:** 120 min

---

### T-078 · Refund service

**Goal:** Cancellation-triggered refunds.

**Files:**

- `backend/src/features/payment/refund.service.ts`

**Dependencies:** T-076, T-059

**Definition of Done:**

- [ ] Full/partial refund per policy
- [ ] Refund status on booking detail

**Estimated Time:** 90 min

---

### T-079 · Checkout UI (C-40–C-43)

**Goal:** Payment method selection + polling.

**Files:**

- `frontend/src/app/(consumer)/checkout/[bookingId]/page.tsx`
- `frontend/src/features/payment/components/payment-method-card.tsx`
- `frontend/src/features/payment/components/payment-processing.tsx`
- `frontend/src/features/payment/hooks/use-payment-polling.ts`

**Dependencies:** T-075, T-070

**Definition of Done:**

- [ ] Payme/Click selection
- [ ] ER-22 polling until terminal state
- [ ] D-11 failed dialog

**Estimated Time:** 120 min

---

### T-080 · Payment worker entrypoint

**Goal:** Separate worker process for payment jobs.

**Files:**

- `backend/src/worker.main.ts`
- `backend/src/features/payment/processors/payment.processor.ts`

**Dependencies:** T-076

**Definition of Done:**

- [ ] Worker deploys independently
- [ ] Webhook retry queue processes

**Estimated Time:** 90 min

---

## Phase 12 — Reviews & polish (M4)

### T-081 · Review API

**Goal:** Create/list reviews with rating aggregation.

**Files:**

- `backend/src/features/review/review.module.ts`
- `backend/src/features/review/review.controller.ts`
- `backend/src/features/review/rating-aggregation.service.ts`

**Dependencies:** T-058

**Definition of Done:**

- [ ] One review per completed booking
- [ ] averageRating updated on business

**Estimated Time:** 90 min

---

### T-082 · Favorites API + UI

**Goal:** User favorites CRUD + C-55 page.

**Files:**

- `backend/src/features/user/favorite.controller.ts`
- `frontend/src/features/user/components/favorite-button.tsx`
- `frontend/src/app/(consumer)/favorites/page.tsx`

**Dependencies:** T-050

**Definition of Done:**

- [ ] Toggle favorite on VenueCard
- [ ] Favorites page lists saved businesses

**Estimated Time:** 90 min

---

### T-083 · Rating components + review form (C-59)

**Goal:** RatingStars + review submission UI.

**Files:**

- `frontend/src/features/review/components/rating-stars.tsx`
- `frontend/src/features/review/components/review-form.tsx`
- `frontend/src/app/(consumer)/reviews/[bookingId]/page.tsx`

**Dependencies:** T-081

**Definition of Done:**

- [ ] Post-completion review only
- [ ] Verified badge shown

**Estimated Time:** 90 min

---

### T-084 · i18n setup (uz/ru)

**Goal:** next-intl with core booking strings.

**Files:**

- `frontend/messages/uz.json`
- `frontend/messages/ru.json`
- `frontend/src/shared/providers/locale-provider.tsx`
- `frontend/src/shared/components/locale-switcher.tsx`

**Dependencies:** T-030

**Definition of Done:**

- [ ] Locale switcher in header
- [ ] Auth + booking flow translated

**Estimated Time:** 120 min

---

### T-085 · FilterSheet + map view (BS-01, C-04)

**Goal:** Advanced search filters and map.

**Files:**

- `frontend/src/features/search/components/filter-sheet.tsx`
- `frontend/src/app/(consumer)/map/page.tsx`
- `frontend/src/features/search/components/map-view.tsx`

**Dependencies:** T-064

**Definition of Done:**

- [ ] Filters apply without full reload
- [ ] Map shows business pins (dynamic import)

**Estimated Time:** 120 min

---

## Phase 13 — Notifications & Telegram bot (M5)

### T-086 · Notification module backend

**Goal:** In-app notifications + delivery queue.

**Files:**

- `backend/src/features/notification/notification.module.ts`
- `backend/src/features/notification/notification.service.ts`
- `backend/src/features/notification/processors/notification.processor.ts`

**Dependencies:** T-058

**Definition of Done:**

- [ ] Create notification on booking confirm
- [ ] SMS/Telegram adapters stubbed or sandbox

**Estimated Time:** 120 min

---

### T-087 · Booking reminder scheduler

**Goal:** 24h and 1h reminder cron.

**Files:**

- `backend/src/features/notification/booking-reminder.scheduler.ts`
- `backend/src/features/notification/processors/booking-reminder.processor.ts`

**Dependencies:** T-086

**Definition of Done:**

- [ ] Dedupe via notifications table
- [ ] Skips cancelled bookings

**Estimated Time:** 90 min

---

### T-088 · Notification inbox UI (C-57, C-58)

**Goal:** Preferences + inbox pages.

**Files:**

- `frontend/src/app/(consumer)/account/notifications/page.tsx`
- `frontend/src/features/notification/components/notification-inbox.tsx`
- `frontend/src/features/notification/components/notification-preferences.tsx`

**Dependencies:** T-086

**Definition of Done:**

- [ ] Toggle SMS/Telegram prefs
- [ ] Unread count in header

**Estimated Time:** 90 min

---

### T-089 · Telegram bot folder structure

**Goal:** Scaffold per `docs/BOT_ARCHITECTURE.md`.

**Files:**

- `backend/src/features/telegram/` (commands, scenes, middleware, keyboards)

**Dependencies:** T-058

**Definition of Done:**

- [ ] Module registers without token (conditional)
- [ ] `/start` command responds

**Estimated Time:** 90 min

---

### T-090 · Telegram Redis session middleware

**Goal:** Session + rate limit middleware.

**Files:**

- `backend/src/features/telegram/middleware/session.middleware.ts`
- `backend/src/features/telegram/middleware/rate-limit.middleware.ts`
- `backend/src/features/telegram/telegram-session.service.ts`

**Dependencies:** T-089

**Definition of Done:**

- [ ] Session persists across restarts
- [ ] Rate limit enforced

**Estimated Time:** 90 min

---

### T-091 · Telegram booking scene

**Goal:** End-to-end football booking in bot.

**Files:**

- `backend/src/features/telegram/scenes/booking/booking.scene.ts`
- `backend/src/features/telegram/scenes/booking/steps/*.ts`

**Dependencies:** T-090, T-054, T-058

**Definition of Done:**

- [ ] User completes booking via bot
- [ ] ER-08/ER-09 handled

**Estimated Time:** 120 min

---

### T-092 · Telegram webhook mode

**Goal:** Production webhook controller.

**Files:**

- `backend/src/features/telegram/telegram-webhook.controller.ts`
- `backend/src/features/telegram/telegram-bot.service.ts`

**Dependencies:** T-089

**Definition of Done:**

- [ ] Webhook registered on deploy
- [ ] Secret token validated

**Estimated Time:** 60 min

---

### T-093 · Telegram notification adapter

**Goal:** Outbound booking messages via bot.

**Files:**

- `backend/src/features/telegram/notifications/telegram-notification.adapter.ts`

**Dependencies:** T-086, T-089

**Definition of Done:**

- [ ] Booking confirm sends Telegram message
- [ ] Respects user preferences

**Estimated Time:** 60 min

---

### T-094 · Mini App shell (T-01–T-08)

**Goal:** Telegram Mini App routes with initData auth.

**Files:**

- `frontend/src/app/(mini-app)/layout.tsx`
- `frontend/src/app/(mini-app)/page.tsx`
- `frontend/src/features/auth/api/mini-app-auth.api.ts`
- `backend/src/features/auth/` (mini-app endpoint)

**Dependencies:** T-066, T-018

**Definition of Done:**

- [ ] initData validated server-side
- [ ] Reuses consumer booking API

**Estimated Time:** 120 min

---

## Phase 14 — Business dashboard (M6)

### T-095 · Business route group + sidebar

**Goal:** `(business)` layout with role-based nav.

**Files:**

- `frontend/src/app/(business)/layout.tsx`
- `frontend/src/features/business/components/business-sidebar.tsx`
- `frontend/src/features/business/components/business-top-bar.tsx`

**Dependencies:** T-040, T-033

**Definition of Done:**

- [ ] Sidebar nav by role
- [ ] Business switcher

**Estimated Time:** 120 min

---

### T-096 · Onboarding wizard UI (B-04–B-12)

**Goal:** Multi-step business onboarding.

**Files:**

- `frontend/src/app/(business)/onboarding/[step]/page.tsx`
- `frontend/src/features/business/components/onboarding-stepper.tsx`
- `frontend/src/shared/hooks/use-confirm-leave.ts` (D-12)

**Dependencies:** T-047, T-095

**Definition of Done:**

- [ ] All steps complete without dead ends
- [ ] Leave guard on unsaved changes

**Estimated Time:** 120 min

---

### T-097 · Catalog management UI (B-30–B-35)

**Goal:** Services and resources drawers.

**Files:**

- `frontend/src/app/(business)/catalog/services/page.tsx`
- `frontend/src/app/(business)/catalog/resources/page.tsx`
- `frontend/src/features/business/components/service-drawer.tsx`

**Dependencies:** T-044, T-045

**Definition of Done:**

- [ ] CRUD via API
- [ ] Empty states E-07, E-08

**Estimated Time:** 120 min

---

### T-098 · Business calendar UI (B-22–B-23)

**Goal:** Day/week calendar views.

**Files:**

- `frontend/src/app/(business)/calendar/page.tsx`
- `frontend/src/features/business/components/calendar-day-view.tsx`
- `frontend/src/features/business/components/booking-detail-drawer.tsx`

**Dependencies:** T-061

**Definition of Done:**

- [ ] Bookings shown per resource
- [ ] Click opens DR-01 drawer

**Estimated Time:** 120 min

---

### T-099 · Bookings inbox + check-in (B-21)

**Goal:** Business booking list with actions.

**Files:**

- `frontend/src/app/(business)/bookings/page.tsx`
- `frontend/src/features/business/hooks/use-business-bookings.ts`

**Dependencies:** T-061, T-095

**Definition of Done:**

- [ ] Check-in / complete / no-show actions work
- [ ] Empty state E-06

**Estimated Time:** 90 min

---

### T-100 · Analytics + payouts UI (B-50, B-52)

**Goal:** Charts and payout table.

**Files:**

- `frontend/src/app/(business)/analytics/page.tsx`
- `frontend/src/app/(business)/payouts/page.tsx`
- `frontend/src/features/business/components/stat-card.tsx`

**Dependencies:** T-041 (analytics API from M6 backend — add if missing)

**Definition of Done:**

- [ ] 30-day summary displays
- [ ] Payout history with skeleton L-15

**Estimated Time:** 120 min

---

## Phase 15 — Admin (M10)

### T-101 · Admin guard + module backend

**Goal:** Platform admin API foundation.

**Files:**

- `backend/src/shared/guards/admin.guard.ts`
- `backend/src/features/admin/admin.module.ts`

**Dependencies:** T-047

**Definition of Done:**

- [ ] Non-admin gets 403 on `/v1/admin/*`

**Estimated Time:** 45 min

---

### T-102 · Verification queue API

**Goal:** Approve/reject business verifications.

**Files:**

- `backend/src/features/admin/verification-admin.controller.ts`
- `backend/src/features/admin/audit-log.service.ts`

**Dependencies:** T-101, T-047

**Definition of Done:**

- [ ] List pending verifications
- [ ] Approve/reject with audit log

**Estimated Time:** 90 min

---

### T-103 · Admin UI shell (A-02–A-05)

**Goal:** Admin layout + verification queue page.

**Files:**

- `frontend/src/app/(admin)/layout.tsx`
- `frontend/src/app/(admin)/page.tsx`
- `frontend/src/app/(admin)/verifications/page.tsx`

**Dependencies:** T-102

**Definition of Done:**

- [ ] Admin can approve from queue
- [ ] D-07, D-08 dialogs

**Estimated Time:** 120 min

---

### T-104 · Disputes + audit log UI (A-10, A-15)

**Goal:** Dispute resolution and audit search.

**Files:**

- `frontend/src/app/(admin)/disputes/page.tsx`
- `frontend/src/app/(admin)/audit/page.tsx`
- `backend/src/features/admin/dispute-admin.controller.ts`

**Dependencies:** T-103

**Definition of Done:**

- [ ] Resolve dispute with refund override
- [ ] Audit log searchable by entity

**Estimated Time:** 120 min

---

## Phase 16 — Scale & hardening (M11)

### T-105 · OpenAPI spec generation

**Goal:** Swagger at `/v1/docs`.

**Files:**

- `backend/src/main.ts`
- DTO decorators across features

**Dependencies:** T-010

**Definition of Done:**

- [ ] Swagger UI accessible in dev/staging
- [ ] Auth endpoints documented

**Estimated Time:** 90 min

---

### T-106 · Read replica routing for search

**Goal:** Search queries use read replica connection.

**Files:**

- `backend/src/shared/database/prisma.service.ts`
- `backend/src/features/search/search.repository.ts`

**Dependencies:** T-050

**Definition of Done:**

- [ ] Writes to primary, search reads replica
- [ ] Documented in runbook

**Estimated Time:** 120 min

---

### T-107 · Load test availability + search

**Goal:** k6 scripts for p95 targets.

**Files:**

- `scripts/load/availability.k6.js`
- `scripts/load/search.k6.js`
- `docs/runbooks/performance.md`

**Dependencies:** T-054, T-050

**Definition of Done:**

- [ ] Report shows p95 within budget
- [ ] Bottlenecks documented

**Estimated Time:** 120 min

---

## Summary

| Phase | Tasks       | Focus                             |
| ----- | ----------- | --------------------------------- |
| 0     | T-001–T-003 | Legacy cleanup, migration, README |
| 1     | T-004–T-007 | Shared packages                   |
| 2     | T-008–T-013 | Backend infrastructure            |
| 3     | T-014–T-021 | Auth API                          |
| 4     | T-022–T-023 | Geo                               |
| 5     | T-024–T-035 | Frontend M0                       |
| 6     | T-036–T-037 | Deploy + M0 gate                  |
| 7     | T-038–T-049 | Business backend M1               |
| 8     | T-050–T-052 | Search + seed                     |
| 9     | T-053–T-062 | Booking backend M2                |
| 10    | T-063–T-073 | Booking UI M2                     |
| 11    | T-074–T-080 | Payments M3                       |
| 12    | T-081–T-085 | Reviews + i18n M4                 |
| 13    | T-086–T-094 | Notifications + bot M5            |
| 14    | T-095–T-100 | Business dashboard M6             |
| 15    | T-101–T-104 | Admin M10                         |
| 16    | T-105–T-107 | Scale M11                         |

**Total:** 107 tasks · **~145 hours** estimated (avg ~81 min/task)

---

## How to use this file

1. Work strictly in order unless dependencies allow parallel work (e.g. T-024 frontend + T-014 backend after T-011).
2. Mark tasks `[x]` in this file or track in GitHub Issues using `[M0]`, `[M1]` labels from `.github/issues/issues.json`.
3. Do not start M1 business UI until T-037 M0 gate passes.
4. Reference `docs/API.md`, `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md`, `docs/COMPONENTS.md`, `docs/BOT_ARCHITECTURE.md` when implementing each task.

---

_Generated from Rezerva roadmap M0–M11 and current repository state (legacy ordering MVP → booking platform migration)._

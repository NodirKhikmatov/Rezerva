# Rezerva Frontend — Next.js Application Architecture

**Stack:** Next.js 15 · App Router · React 19 · Tailwind 4 · shadcn/ui · TypeScript  
**Apps:** Consumer web · Business dashboard · Telegram Mini App · Admin (later)  
**Principle:** Feature-first modules, Server Components by default, thin pages, business logic in services — never in UI

This document defines App Router structure, layouts, auth, component boundaries, hooks, state, and feature modules. No implementation code.

---

## Table of contents

1. [Overview](#1-overview)
2. [Folder structure](#2-folder-structure)
3. [App Router map](#3-app-router-map)
4. [Layouts](#4-layouts)
5. [Protected routes](#5-protected-routes)
6. [Server Components strategy](#6-server-components-strategy)
7. [Client Components strategy](#7-client-components-strategy)
8. [Feature modules](#8-feature-modules)
9. [Shared layer](#9-shared-layer)
10. [Hooks catalog](#10-hooks-catalog)
11. [State management](#11-state-management)
12. [Data fetching & API layer](#12-data-fetching--api-layer)
13. [Forms & validation](#13-forms--validation)
14. [Internationalization](#14-internationalization)
15. [Performance & UX patterns](#15-performance--ux-patterns)
16. [Legacy migration](#16-legacy-migration)
17. [Phased rollout](#17-phased-rollout)

---

## 1. Overview

### Application surfaces

| Surface      | Route group  | Users                           | Auth                 |
| ------------ | ------------ | ------------------------------- | -------------------- |
| **Consumer** | `(consumer)` | End customers                   | Phone OTP / Telegram |
| **Auth**     | `(auth)`     | Unauthenticated                 | —                    |
| **Business** | `(business)` | Owners, managers, receptionists | Same + membership    |
| **Mini App** | `(mini-app)` | Telegram users                  | `initData`           |
| **Admin**    | `(admin)`    | Platform admins                 | JWT + `admin` role   |

All surfaces share `src/features/` and `src/shared/` — route groups only define shells and access rules.

### Rendering model

```
Request
  → middleware.ts          (auth redirect, locale, role)
  → Root layout            (html, fonts, providers)
  → Route group layout     (AppShell, sidebar)
  → Page (Server Component) — fetch data, compose features
  → Feature components     (Server or Client)
  → shared/ui primitives
```

### Design rules

| Rule                                           | Rationale                                       |
| ---------------------------------------------- | ----------------------------------------------- |
| Server Components default                      | SEO, smaller bundles, direct API access         |
| `"use client"` only when needed                | Interactivity, browser APIs, hooks              |
| Pages ≤ 50 lines                               | Compose from features                           |
| No fetch in Client Components for initial data | Pass from Server Component or use server action |
| Feature isolation                              | No cross-feature component imports              |
| Shared UI only in `shared/`                    | Prevent feature coupling                        |

---

## 2. Folder structure

```
frontend/
├── public/
│   ├── icons/
│   └── og/                          # Open Graph images
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root: fonts, metadata, providers
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx              # Global fallback (rare)
│   │   │
│   │   ├── (auth)/                  # Unauthenticated shell
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx       # C-50
│   │   │   └── verify/page.tsx      # C-51
│   │   │
│   │   ├── (consumer)/              # Public + authenticated consumer
│   │   │   ├── layout.tsx           # AppShell: Header, Footer, mobile nav
│   │   │   ├── page.tsx             # C-01 Homepage
│   │   │   ├── search/page.tsx      # C-03 Search results
│   │   │   ├── map/page.tsx         # C-04 Map view
│   │   │   ├── favorites/page.tsx   # C-55
│   │   │   ├── categories/
│   │   │   │   └── [category]/page.tsx   # C-02 Category landing
│   │   │   ├── businesses/
│   │   │   │   └── [slug]/page.tsx       # C-20 Business profile
│   │   │   ├── book/
│   │   │   │   └── [businessSlug]/
│   │   │   │       ├── page.tsx          # C-30 Booking entry
│   │   │   │       ├── service/page.tsx  # C-31 Service select
│   │   │   │       ├── slot/page.tsx     # C-33 Slot picker
│   │   │   │       ├── summary/page.tsx  # C-38 Summary
│   │   │   │       └── success/page.tsx  # C-42 Success
│   │   │   ├── checkout/
│   │   │   │   └── [bookingId]/page.tsx  # C-40–C-43 Payment
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx              # C-52 My bookings
│   │   │   │   └── [id]/page.tsx         # C-53 Detail
│   │   │   ├── account/
│   │   │   │   ├── page.tsx              # Profile
│   │   │   │   ├── notifications/page.tsx  # C-57, C-58
│   │   │   │   └── addresses/page.tsx
│   │   │   └── reviews/
│   │   │       └── [bookingId]/page.tsx  # C-59
│   │   │
│   │   ├── (business)/              # Business dashboard
│   │   │   ├── layout.tsx           # Sidebar + top bar
│   │   │   ├── onboarding/
│   │   │   │   └── [step]/page.tsx  # B-04–B-12 Wizard
│   │   │   ├── dashboard/page.tsx   # B-20 Today overview
│   │   │   ├── calendar/page.tsx    # B-22–B-23 Day/week
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx         # B-21 Inbox
│   │   │   │   └── [id]/page.tsx    # DR-01 Detail drawer route
│   │   │   ├── catalog/
│   │   │   │   ├── services/page.tsx    # B-30
│   │   │   │   └── resources/page.tsx   # B-31–B-35
│   │   │   ├── analytics/page.tsx   # B-50
│   │   │   ├── payouts/page.tsx     # B-52
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       └── staff/page.tsx
│   │   │
│   │   ├── (mini-app)/              # Telegram Mini App
│   │   │   ├── layout.tsx           # TG viewport, back button, theme
│   │   │   ├── page.tsx             # T-01 Home
│   │   │   ├── book/[slug]/page.tsx # T-02–T-08 Booking shell
│   │   │   └── bookings/page.tsx
│   │   │
│   │   ├── (admin)/                 # Platform admin (M10)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # A-02 Overview
│   │   │   ├── verifications/page.tsx   # A-05
│   │   │   ├── bookings/page.tsx        # A-08
│   │   │   ├── disputes/page.tsx        # A-10
│   │   │   ├── featured/page.tsx        # A-12
│   │   │   └── audit/page.tsx           # A-15
│   │   │
│   │   └── api/                     # Route handlers (minimal)
│   │       └── auth/
│   │           └── session/route.ts # Optional BFF cookie refresh
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── search/
│   │   ├── business/
│   │   ├── booking/
│   │   ├── payment/
│   │   ├── review/
│   │   ├── notification/
│   │   ├── geo/
│   │   └── admin/
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── layout/              # AppShell, Header, Footer, Sidebar
│   │   │   ├── navigation/          # MobileNav, Breadcrumbs, TabBar
│   │   │   ├── feedback/            # EmptyState, ErrorState, Skeleton*
│   │   │   └── ui/                  # shadcn primitives
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── types/
│   │   └── validation/
│   │
│   ├── middleware.ts
│   └── instrumentation.ts           # Sentry
│
├── components.json                  # shadcn config
├── next.config.ts
├── vercel.json
└── sentry.*.config.ts
```

### Monorepo packages (consumed by frontend)

```
packages/shared-constants/     # Enums: BusinessCategory, BookingStatus, Locale
packages/shared-validation/    # Zod: phone, OTP, shared form schemas
```

---

## 3. App Router map

### Route group responsibilities

| Group        | URL prefix                      | Layout                  | Auth                                |
| ------------ | ------------------------------- | ----------------------- | ----------------------------------- |
| `(auth)`     | `/login`, `/verify`             | Minimal centered card   | Public only (redirect if logged in) |
| `(consumer)` | `/`, `/businesses/*`, `/book/*` | Consumer AppShell       | Mixed — protected sub-routes        |
| `(business)` | `/dashboard`, `/onboarding/*`   | Business sidebar layout | Business member required            |
| `(mini-app)` | `/mini/*` or subdomain          | TG-optimized shell      | initData session                    |
| `(admin)`    | `/admin/*`                      | Admin sidebar           | Platform admin                      |

> **Note:** Route groups `(consumer)` do not affect URL — `/book/...` not `/consumer/book/...`.

### Screen ID → route mapping (roadmap)

| ID        | Route                                  | Feature module |
| --------- | -------------------------------------- | -------------- |
| C-01      | `/`                                    | search         |
| C-02      | `/categories/[category]`               | search         |
| C-03      | `/search`                              | search         |
| C-04      | `/map`                                 | search         |
| C-20      | `/businesses/[slug]`                   | business       |
| C-30–C-42 | `/book/[slug]/*`                       | booking        |
| C-40–C-43 | `/checkout/[bookingId]`                | payment        |
| C-50      | `/login`                               | auth           |
| C-51      | `/verify`                              | auth           |
| C-52–C-53 | `/bookings`, `/bookings/[id]`          | booking        |
| C-55      | `/favorites`                           | user           |
| C-57–C-58 | `/account/notifications`               | notification   |
| C-59      | `/reviews/[bookingId]`                 | review         |
| B-04–B-12 | `/onboarding/[step]`                   | business       |
| B-20–B-25 | `/dashboard`, `/calendar`, `/bookings` | business       |
| T-01–T-08 | `(mini-app)/*`                         | booking + auth |
| A-02–A-15 | `/admin/*`                             | admin          |

### Special files

| File                                                   | Purpose                             |
| ------------------------------------------------------ | ----------------------------------- |
| `middleware.ts`                                        | Auth, locale, role redirects        |
| `app/error.tsx`                                        | Route-level error boundary (client) |
| `app/not-found.tsx`                                    | Global 404                          |
| `app/(consumer)/book/[slug]/loading.tsx`               | Booking flow skeleton               |
| `app/(consumer)/businesses/[slug]/opengraph-image.tsx` | Dynamic OG for SEO                  |

### Parallel & intercepting routes (M4+)

| Pattern                   | Use case                                                |
| ------------------------- | ------------------------------------------------------- |
| `@modal/(.)bookings/[id]` | Booking detail drawer on mobile without full navigation |
| `parallel routes`         | Business calendar day + sidebar filters                 |

Deferred to M6 — document slot reserved in `(business)/calendar/@sidebar/`.

---

## 4. Layouts

### Layout hierarchy

```
app/layout.tsx                    # Root
├── (auth)/layout.tsx             # AuthLayout — logo, no nav
├── (consumer)/layout.tsx         # ConsumerLayout — Header + Footer + MobileNav
├── (business)/layout.tsx        # BusinessLayout — Sidebar + TopBar
├── (mini-app)/layout.tsx         # MiniAppLayout — TG SDK init, compact header
└── (admin)/layout.tsx            # AdminLayout — Admin sidebar
```

### Root layout (`app/layout.tsx`)

**Type:** Server Component

| Responsibility                                     |
| -------------------------------------------------- |
| `<html lang={locale}>`                             |
| Geist Sans / Mono fonts                            |
| Global metadata (title template, OG defaults)      |
| `ThemeProvider` (dark mode class strategy)         |
| `QueryProvider` (TanStack Query — client boundary) |
| `AuthProvider` (session context — client boundary) |
| `LocaleProvider`                                   |
| Toaster / Sonner                                   |
| Sentry error boundary wrapper                      |

### Consumer layout (`(consumer)/layout.tsx`)

**Type:** Server Component wrapping client shell

| Slot       | Component        | Type                                             |
| ---------- | ---------------- | ------------------------------------------------ |
| Header     | `ConsumerHeader` | Server (user from cookie) + Client (menu toggle) |
| Main       | `{children}`     | —                                                |
| Footer     | `ConsumerFooter` | Server                                           |
| Mobile nav | `MobileTabBar`   | Client — visible < md breakpoint                 |

Authenticated-only sections (bookings, favorites) still use consumer layout — middleware enforces auth.

### Business layout (`(business)/layout.tsx`)

**Type:** Server Component

| Slot    | Component                                       |
| ------- | ----------------------------------------------- |
| Sidebar | `BusinessSidebar` — nav items by role           |
| Top bar | `BusinessTopBar` — business switcher, user menu |
| Main    | `{children}`                                    |

Server-fetches: current user's businesses, active business from cookie/header.

Role-based nav visibility:

- `owner` — all items including payouts, staff
- `manager` — all except payout settings
- `receptionist` — calendar, bookings, walk-in only

### Mini App layout (`(mini-app)/layout.tsx`)

**Type:** Client Component (requires Telegram WebApp SDK)

| Responsibility                     |
| ---------------------------------- |
| Initialize `@telegram-apps/sdk`    |
| Expand viewport, set header color  |
| BackButton integration with router |
| Haptic feedback on confirm actions |
| Compact spacing (no Footer)        |

### Auth layout (`(auth)/layout.tsx`)

**Type:** Server Component

Centered card, brand logo, no navigation. Redirect authenticated users to `/` or `returnUrl`.

---

## 5. Protected routes

### Middleware (`src/middleware.ts`)

Runs on Edge before render.

```
Request
  → Read session cookie / access token
  → Decode JWT (jose — edge compatible)
  → Match path against route config
  → Redirect / rewrite / continue
```

### Route protection matrix

| Path pattern                                     | Requirement                  | Redirect on fail                |
| ------------------------------------------------ | ---------------------------- | ------------------------------- |
| `/login`, `/verify`                              | Guest only                   | `/` if authenticated            |
| `/book/*` (slot, summary, confirm)               | Authenticated                | `/login?returnUrl=...`          |
| `/checkout/*`                                    | Authenticated                | `/login?returnUrl=...`          |
| `/bookings/*`                                    | Authenticated                | `/login?returnUrl=...`          |
| `/favorites`                                     | Authenticated                | `/login?returnUrl=...`          |
| `/account/*`                                     | Authenticated                | `/login?returnUrl=...`          |
| `/onboarding/*`, `/dashboard/*`, `/calendar/*`   | Business member              | `/login` or `/onboarding/start` |
| `/admin/*`                                       | Platform admin               | `/` or 403 page                 |
| `/mini/*`                                        | Valid initData header/cookie | Mini App auth error page        |
| `/`, `/businesses/*`, `/categories/*`, `/search` | Public                       | —                               |

### Matcher config

```
matcher: [
  '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
]
```

### Session storage strategy

| Token            | Storage                                  | Lifetime |
| ---------------- | ---------------------------------------- | -------- |
| Access token     | Memory (client) or short cookie          | 15 min   |
| Refresh token    | httpOnly secure cookie `rezerva_session` | 7 days   |
| Business context | Cookie `rezerva_business_id`             | Session  |
| Locale           | Cookie `rezerva_locale`                  | 1 year   |

**Production:** no `localStorage` for tokens (migrate away from current MVP).

### Server-side auth helper

`shared/lib/auth.server.ts`:

| Function                            | Used by                               |
| ----------------------------------- | ------------------------------------- |
| `getSession()`                      | Server Components, layouts            |
| `requireAuth()`                     | Protected pages — redirect if missing |
| `requireBusinessMember(businessId)` | Business pages                        |
| `requireAdmin()`                    | Admin pages                           |

### Client-side auth guard

`shared/components/auth/auth-guard.tsx` — Client Component wrapper for interactive subtrees that need client session (e.g., booking hold countdown). Server redirect is primary; client guard is fallback for hydration edge cases.

### returnUrl handling

- Middleware preserves intended path in `?returnUrl=` on login redirect
- After successful OTP/Telegram login → `redirect(returnUrl ?? '/')`
- Validated against same-origin path only (open redirect prevention)

---

## 6. Server Components strategy

### Default to Server Component when

- Fetching initial page data
- Rendering static or cacheable content
- SEO-critical pages (business profile, category landing)
- Layout shells without interactivity
- Reading cookies/headers for personalization

### Server Component patterns

| Pattern                        | Example                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| **Page fetches, passes props** | `businesses/[slug]/page.tsx` → `<BusinessProfile data={business} />` |
| **Parallel fetch**             | Homepage: featured + categories + cities in `Promise.all`            |
| **Suspense streaming**         | Search results stream while filters render immediately               |
| **Cache tags**                 | `fetch(url, { next: { tags: ['business:slug'] } })`                  |
| **ISR**                        | Business profile revalidate 300s (M11)                               |
| **generateMetadata**           | Dynamic title/description/OG from business data                      |

### Server-only modules

```
features/*/api/*.server.ts     # API calls with auth cookie — never imported by client
shared/lib/auth.server.ts
shared/lib/api-client.server.ts
```

Mark with `import 'server-only'` package to prevent client bundling.

### Caching policy

| Data                    | Strategy      | Revalidate |
| ----------------------- | ------------- | ---------- |
| Geo (countries, cities) | `force-cache` | 24h        |
| Business public profile | ISR           | 5 min      |
| Featured listings       | ISR           | 15 min     |
| Availability slots      | `no-store`    | —          |
| User bookings           | `no-store`    | —          |
| Business dashboard      | `no-store`    | —          |

---

## 7. Client Components strategy

### Require `"use client"` when

- Event handlers (onClick, onChange)
- React hooks (useState, useEffect, custom hooks)
- Browser APIs (localStorage for non-sensitive prefs, geolocation)
- Third-party interactive libs (Framer Motion, Telegram SDK, map)
- React Hook Form
- Real-time countdown (hold timer)
- Payment polling

### Client boundary placement

Push `"use client"` **as deep as possible** — leaf interactive components, not entire pages.

```
page.tsx (Server)
  └── BookingFlow (Server — layout)
        └── SlotPicker (Client — grid + callbacks)
        └── HoldCountdown (Client — timer)
        └── ConfirmButton (Client — mutation)
```

### Dynamic imports

| Component         | Reason             |
| ----------------- | ------------------ |
| `MapView`         | Heavy map SDK      |
| `AnalyticsCharts` | Chart library      |
| `DocumentPreview` | PDF viewer (admin) |
| `QRCodeDisplay`   | qrcode.react       |

Use `next/dynamic` with `{ ssr: false }` where browser-only.

### Client component catalog (shared)

| Component                   | Location          | Purpose           |
| --------------------------- | ----------------- | ----------------- |
| `ThemeToggle`               | shared/components | Dark mode         |
| `MobileTabBar`              | shared/navigation | Bottom nav        |
| `Dialog`, `Sheet`, `Drawer` | shared/ui         | Overlays (shadcn) |
| `LocaleSwitcher`            | shared/components | uz/ru/en          |
| `Toast`                     | shared/ui         | Notifications     |

---

## 8. Feature modules

Each feature follows the same internal structure:

```
features/<name>/
├── components/       # UI — Server or Client (suffix .client.tsx if client)
├── hooks/            # Client hooks only
├── api/              # API functions
│   ├── *.ts          # Isomorphic typed fetchers
│   └── *.server.ts   # Server-only fetchers with cookie auth
├── services/         # Client-side orchestration (no direct fetch)
├── types/            # Feature types & API response shapes
├── utils/            # Pure helpers
├── validation/       # Zod schemas (import from shared-validation where possible)
└── index.ts          # Public exports barrel
```

**Import rule:** Features export via `index.ts`. Other features import only from `@/features/<name>`, never deep paths.

---

### 8.1 `features/auth`

**Purpose:** Login, OTP verify, Telegram widget, session, logout.

| Category       | Items                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| **Components** | `LoginForm`, `OtpVerifyForm`, `TelegramLoginButton`, `AuthDivider`, `LogoutButton` |
| **Hooks**      | `useAuth`, `useSession`, `useLogin`, `useOtpVerify`, `useLogout`                   |
| **API**        | `sendOtp`, `verifyOtp`, `loginWithTelegram`, `refreshSession`, `logout`            |
| **Services**   | `AuthService` — coordinates login flow, token refresh queue                        |
| **Types**      | `AuthUser`, `AuthSession`, `LoginMethod`                                           |
| **Validation** | `sendOtpSchema`, `verifyOtpSchema` (from shared-validation)                        |

**Pages:** `(auth)/login`, `(auth)/verify`

---

### 8.2 `features/user`

**Purpose:** Profile, addresses, favorites.

| Category       | Items                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Components** | `ProfileForm`, `AddressList`, `AddressForm`, `FavoriteButton`, `FavoriteGrid`                    |
| **Hooks**      | `useProfile`, `useUpdateProfile`, `useAddresses`, `useFavorites`, `useToggleFavorite`            |
| **API**        | `getProfile`, `updateProfile`, `getAddresses`, `createAddress`, `getFavorites`, `toggleFavorite` |
| **Types**      | `UserProfile`, `Address`, `FavoriteBusiness`                                                     |
| **Validation** | `updateProfileSchema`, `addressSchema`                                                           |

**Pages:** `/account`, `/account/addresses`, `/favorites`

---

### 8.3 `features/search`

**Purpose:** Homepage, search, filters, map, category landing.

| Category       | Items                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Components** | `HomepageHero`, `CategoryGrid`, `FeaturedCarousel`, `SearchBar`, `FilterSheet` (BS-01), `BusinessCard`, `MapView`, `SearchResultsList` |
| **Hooks**      | `useSearch`, `useSearchFilters`, `useGeoLocation`                                                                                      |
| **API**        | `searchBusinesses`, `getFeatured`, `getCategories`                                                                                     |
| **Types**      | `SearchFilters`, `SearchResult`, `FeaturedBusiness`                                                                                    |
| **Validation** | `searchQuerySchema`                                                                                                                    |

**Pages:** `/`, `/search`, `/map`, `/categories/[category]`

---

### 8.4 `features/business`

**Purpose:** Public profile, business dashboard, onboarding, catalog management.

| Category                   | Items                                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components (public)**    | `BusinessProfileHeader`, `BusinessGallery`, `ServicesSummary`, `VenueMap`, `PoliciesSummary`, `ReviewsPreview`                                                                                                                |
| **Components (dashboard)** | `OnboardingStepper`, `OnboardingStep*`, `BusinessSidebar`, `ServiceDrawer`, `ResourceDrawer`, `CalendarDayView`, `CalendarWeekView`, `BookingInbox`, `AnalyticsCharts`, `PayoutTable`, `StaffTable`, `QuickBookSheet` (BS-12) |
| **Hooks**                  | `useBusiness`, `useOnboarding`, `useBusinessBookings`, `useCalendar`, `useCatalog`, `useAnalytics`, `usePayouts`, `useStaff`                                                                                                  |
| **API**                    | Full `/v1/businesses/*` surface                                                                                                                                                                                               |
| **Services**               | `OnboardingService` — step progression client-side                                                                                                                                                                            |
| **Types**                  | `Business`, `BusinessPublic`, `OnboardingStep`, `CalendarEvent`, `CatalogService`, `CatalogResource`                                                                                                                          |
| **Validation**             | Per onboarding step schemas                                                                                                                                                                                                   |

**Pages:** `/businesses/[slug]`, `/onboarding/*`, `/dashboard`, `/calendar`, `/catalog/*`, `/analytics`, `/payouts`

---

### 8.5 `features/booking`

**Purpose:** Availability, holds, booking flow, my bookings, cancel.

| Category       | Items                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components** | `BookingStepper`, `ServiceSelector`, `AvailabilityCalendar`, `SlotPicker`, `SlotGrid`, `HoldBanner`, `HoldCountdown`, `BookingSummary`, `BookingSuccess`, `BookingCard`, `BookingTimeline`, `BookingDetail`, `CancelBookingDialog` (D-03), `PartySizeSelector` (C-35), `StylistPicker` (C-32), `DateRangePicker` (C-36), `EmptyBookings` (E-02) |
| **Hooks**      | `useAvailability`, `useSlotHold`, `useCreateBooking`, `useMyBookings`, `useBookingDetail`, `useCancelBooking`, `useHoldCountdown`                                                                                                                                                                                                               |
| **API**        | `getAvailability`, `createHold`, `releaseHold`, `createBooking`, `getMyBookings`, `getBooking`, `cancelBooking`                                                                                                                                                                                                                                 |
| **Services**   | `BookingFlowService` — step state, hold lifecycle                                                                                                                                                                                                                                                                                               |
| **Types**      | `TimeSlot`, `SlotHold`, `Booking`, `BookingSummary`, `BookingStatus`                                                                                                                                                                                                                                                                            |
| **Validation** | `createHoldSchema`, `createBookingSchema`, `cancelBookingSchema`                                                                                                                                                                                                                                                                                |

**Pages:** `/book/[slug]/*`, `/bookings`, `/bookings/[id]`

**Error states:** ER-08 (slot taken), ER-09 (hold expired) — mapped in `BookingErrorBoundary`

---

### 8.6 `features/payment`

**Purpose:** Checkout, Payme/Click, polling, receipts.

| Category       | Items                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components** | `CheckoutSummary`, `PaymentMethodCard`, `PaymentSheet` (BS-07), `PaymentProcessing` (ER-22), `PaymentSuccess`, `PaymentFailedDialog` (D-11), `DepositExplainer` (BS-17) |
| **Hooks**      | `usePayment`, `useInitiatePayment`, `usePaymentPolling`, `usePaymentMethods`                                                                                            |
| **API**        | `getPayment`, `initiatePayment`, `getPaymentStatus`, `getPaymentMethods`                                                                                                |
| **Types**      | `Payment`, `PaymentMethod`, `PaymentStatus`                                                                                                                             |
| **Validation** | `initiatePaymentSchema`                                                                                                                                                 |

**Pages:** `/checkout/[bookingId]`

---

### 8.7 `features/review`

**Purpose:** Create review, list reviews, report.

| Category       | Items                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Components** | `ReviewForm`, `ReviewList`, `RatingStars`, `RatingSummary`, `ReviewCard`, `VerifiedBadge` |
| **Hooks**      | `useCreateReview`, `useBusinessReviews`, `useReportReview`                                |
| **API**        | `getBusinessReviews`, `createReview`, `updateReview`, `reportReview`                      |
| **Types**      | `Review`, `RatingSummary`                                                                 |
| **Validation** | `createReviewSchema`                                                                      |

**Pages:** `/reviews/[bookingId]`, embedded in business profile

---

### 8.8 `features/notification`

**Purpose:** In-app inbox, preferences.

| Category       | Items                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| **Components** | `NotificationInbox`, `NotificationItem`, `NotificationPreferences`, `UnreadBadge`    |
| **Hooks**      | `useNotifications`, `useUnreadCount`, `useNotificationPreferences`, `useMarkRead`    |
| **API**        | `getNotifications`, `markRead`, `markAllRead`, `getUnreadCount`, `updatePreferences` |
| **Types**      | `Notification`, `NotificationPreferences`                                            |

**Pages:** `/account/notifications`

---

### 8.9 `features/geo`

**Purpose:** City selector, district filters.

| Category       | Items                                                     |
| -------------- | --------------------------------------------------------- |
| **Components** | `CitySelector`, `DistrictFilter`                          |
| **Hooks**      | `useCities`, `useDistricts`                               |
| **API**        | `getCountries`, `getRegions`, `getDistricts`, `getCities` |
| **Types**      | `City`, `District`, `Region`                              |

Used by search filters and address forms — no dedicated pages.

---

### 8.10 `features/admin`

**Purpose:** Platform admin UI (M10).

| Category       | Items                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Components** | `AdminOverview`, `VerificationQueue`, `VerificationDetail`, `DisputeList`, `DisputeDetail`, `FeaturedManager`, `AuditLogTable`, `DocumentPreview` |
| **Hooks**      | `useAdminOverview`, `useVerifications`, `useDisputes`, `useAuditLogs`                                                                             |
| **API**        | Full `/v1/admin/*` surface                                                                                                                        |
| **Types**      | `VerificationSubmission`, `Dispute`, `AuditEntry`                                                                                                 |

**Pages:** `/admin/*`

---

## 9. Shared layer

### `shared/components/layout/`

| Component        | Type   | Purpose                            |
| ---------------- | ------ | ---------------------------------- |
| `AppShell`       | Server | Main + optional aside              |
| `Container`      | Server | Max-width wrapper                  |
| `PageHeader`     | Server | Title + breadcrumbs + actions slot |
| `SectionHeading` | Server | Consistent section titles          |

### `shared/components/feedback/`

| Component         | IDs                          | Purpose                     |
| ----------------- | ---------------------------- | --------------------------- |
| `EmptyState`      | E-02, E-07, E-08, E-15       | Zero-data states            |
| `ErrorState`      | ER-\*                        | Recoverable errors with CTA |
| `LoadingSkeleton` | L-04, L-07, L-15             | Placeholder layouts         |
| `ConfirmDialog`   | D-03, D-04, D-05, D-11, D-12 | Destructive confirmations   |

### `shared/components/ui/`

shadcn/ui primitives: `Button`, `Input`, `Card`, `Dialog`, `Sheet`, `Drawer`, `Badge`, `Skeleton`, `Toast`, `Tabs`, `Select`, `Calendar`, `Form`, etc.

### `shared/lib/`

| Module                 | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `api-client.ts`        | Base fetch with auth header injection   |
| `api-client.server.ts` | Cookie-authenticated server fetch       |
| `auth.server.ts`       | Session read/require helpers            |
| `cn.ts`                | Tailwind merge (existing `utils.ts`)    |
| `logger.ts`            | Structured client/server logging        |
| `format.ts`            | Price, date, phone formatters           |
| `constants.ts`         | Re-export from shared-constants package |

### `shared/providers/`

| Provider         | Type   | Wraps                     |
| ---------------- | ------ | ------------------------- |
| `QueryProvider`  | Client | TanStack Query client     |
| `AuthProvider`   | Client | Session context + refresh |
| `ThemeProvider`  | Client | Dark mode                 |
| `LocaleProvider` | Client | next-intl or custom i18n  |

### `shared/types/`

Cross-cutting: `PaginatedResponse<T>`, `ApiError`, `Locale`, `Coordinates`.

---

## 10. Hooks catalog

### Naming convention

`use<Verb><Noun>` — single responsibility, one data domain per hook.

### Auth hooks (`features/auth/hooks/`)

| Hook         | Returns                                            | Purpose                |
| ------------ | -------------------------------------------------- | ---------------------- |
| `useAuth`    | `{ user, isLoading, isAuthenticated }`             | Session context reader |
| `useSession` | `{ accessToken, refresh }`                         | Token management       |
| `useLogin`   | `{ sendOtp, verifyOtp, loginTelegram, isPending }` | Login mutations        |
| `useLogout`  | `{ logout, isPending }`                            | Clear session          |

### Booking hooks (`features/booking/hooks/`)

| Hook               | Returns                                        | Purpose                    |
| ------------------ | ---------------------------------------------- | -------------------------- |
| `useAvailability`  | `{ slots, isLoading, error, refetch }`         | Fetch slots for date range |
| `useSlotHold`      | `{ hold, createHold, releaseHold, isPending }` | Hold lifecycle             |
| `useHoldCountdown` | `{ secondsLeft, isExpired }`                   | Timer from `holdExpiresAt` |
| `useCreateBooking` | `{ createBooking, isPending, error }`          | Confirm mutation           |
| `useMyBookings`    | `{ bookings, pagination, fetchNext }`          | Infinite/paginated list    |
| `useBookingDetail` | `{ booking, isLoading }`                       | Single booking             |
| `useCancelBooking` | `{ cancel, isPending }`                        | Cancel mutation            |

### Payment hooks (`features/payment/hooks/`)

| Hook                 | Returns                     | Purpose                     |
| -------------------- | --------------------------- | --------------------------- |
| `useInitiatePayment` | `{ initiate, redirectUrl }` | Start Payme/Click           |
| `usePaymentPolling`  | `{ status, stopPolling }`   | Poll until terminal (ER-22) |

### Shared hooks (`shared/hooks/`)

| Hook                      | Purpose                     |
| ------------------------- | --------------------------- |
| `useMediaQuery`           | Responsive breakpoints      |
| `useDebounce`             | Search input debounce       |
| `useIntersectionObserver` | Infinite scroll             |
| `useLocalStorage`         | Non-sensitive UI prefs only |
| `useConfirmLeave`         | D-12 onboarding leave guard |
| `useToast`                | Toast notifications         |

### Hook rules

- Hooks call `api/` or `services/` — never raw fetch inline
- Server data initial load → Server Component; hooks for mutations and client refetch
- TanStack Query wraps all client fetch hooks (`useQuery`, `useMutation`)
- No hooks in Server Components

---

## 11. State management

### State categories

| Category                | Tool                             | Scope           | Examples                                   |
| ----------------------- | -------------------------------- | --------------- | ------------------------------------------ |
| **Server state**        | Server Components + fetch cache  | Request         | Business profile, geo                      |
| **Remote client state** | TanStack Query v5                | Client          | Bookings list, availability refetch        |
| **URL state**           | `nuqs` or searchParams           | Shareable       | Filters, pagination, booking step          |
| **Form state**          | React Hook Form                  | Ephemeral       | Login, onboarding, review                  |
| **Session state**       | AuthProvider + httpOnly cookie   | Global          | User, tokens                               |
| **UI state**            | useState / useReducer            | Local           | Dialog open, sheet, active tab             |
| **Booking flow state**  | URL params + Query cache         | Semi-persistent | Selected service, date (not hold — server) |
| **Mini App state**      | Telegram CloudStorage (optional) | TG only         | Last city preference                       |

### No global Redux/Zustand

TanStack Query covers remote state. Booking flow uses URL + server hold record — not client global store.

Exception: `AuthProvider` context for session (minimal global).

### TanStack Query key conventions

```
['businesses', slug]
['businesses', id, 'services']
['availability', businessId, serviceId, from, to]
['bookings', 'me', { status, page }]
['bookings', id]
['hold', holdId]
['payment', bookingId]
['notifications', { unreadOnly, page }]
['search', filters]
```

### Optimistic updates

| Action                 | Optimistic         | Rollback         |
| ---------------------- | ------------------ | ---------------- |
| Toggle favorite        | Heart icon         | Revert + toast   |
| Mark notification read | Remove unread dot  | Refetch          |
| Cancel booking         | Status → cancelled | Refetch on error |

### Invalidation graph

```
createBooking → invalidate ['bookings'], ['availability']
cancelBooking → invalidate ['bookings', id], ['availability']
createHold    → invalidate ['availability'] (narrow range)
payment success → invalidate ['bookings', id], ['payment']
```

---

## 12. Data fetching & API layer

### Two-track API client

| Track      | File                   | Auth                                  | Used by                                    |
| ---------- | ---------------------- | ------------------------------------- | ------------------------------------------ |
| **Server** | `api-client.server.ts` | Reads httpOnly cookie                 | Server Components, layouts, server actions |
| **Client** | `api-client.ts`        | Memory access token from AuthProvider | Client hooks, mutations                    |

Both share response typing from `features/*/types/`.

### Error handling

```
API error response
  → api-client throws ApiError { code, statusCode, message, details }
  → TanStack Query onError / hook catch
  → ErrorState component or toast
  → Sentry capture if 5xx
```

### Server Actions (limited use)

| Action                     | Reason                            |
| -------------------------- | --------------------------------- |
| `logoutAction`             | Clear httpOnly cookie server-side |
| `setLocaleAction`          | Set locale cookie                 |
| `setBusinessContextAction` | Set active business cookie        |

Prefer REST via api-client for domain operations — aligns with `docs/API.md`.

---

## 13. Forms & validation

### Stack

- **React Hook Form** — form state
- **Zod** — schemas (`@hookform/resolvers/zod`)
- **shared-validation package** — phone, OTP shared with backend

### Form locations

| Form             | Schema location                          | Component             |
| ---------------- | ---------------------------------------- | --------------------- |
| Phone login      | `features/auth/validation/`              | `LoginForm`           |
| OTP verify       | shared-validation                        | `OtpVerifyForm`       |
| Profile edit     | `features/user/validation/`              | `ProfileForm`         |
| Onboarding steps | `features/business/validation/` per step | `OnboardingStep*`     |
| Review           | `features/review/validation/`            | `ReviewForm`          |
| Cancel booking   | `features/booking/validation/`           | `CancelBookingDialog` |

### Validation timing

- `mode: 'onBlur'` for text fields
- `mode: 'onChange'` after first submit failure
- Server-side validation errors mapped to `setError(field, { message })`

---

## 14. Internationalization

### Strategy

**next-intl** with locale prefix optional (default uz without prefix).

| Locale | URL                 | Priority    |
| ------ | ------------------- | ----------- |
| `uz`   | `/` (default)       | M0          |
| `ru`   | `/ru/...` or cookie | M4          |
| `en`   | `/en/...`           | M9 (hotels) |

### Message files

```
frontend/messages/
├── uz.json
├── ru.json
└── en.json
```

Feature-scoped keys: `booking.slotPicker.title`, `auth.login.heading`.

### Locale resolution order

1. URL prefix
2. User profile locale (authenticated)
3. `rezerva_locale` cookie
4. Browser `Accept-Language`
5. Default `uz`

---

## 15. Performance & UX patterns

### Suspense boundaries

| Page              | Fallback                   |
| ----------------- | -------------------------- |
| Homepage featured | `FeaturedCarouselSkeleton` |
| Search results    | `BusinessCardSkeleton` × 6 |
| Business profile  | `ProfileSkeleton`          |
| Slot picker       | `SlotGridSkeleton`         |
| Bookings list     | `BookingCardSkeleton`      |

### Mobile-first patterns

| Pattern              | Component                      |
| -------------------- | ------------------------------ |
| Sticky footer CTA    | `StickyFooter` on booking flow |
| Bottom sheet filters | `FilterSheet` (BS-01)          |
| Swipeable tabs       | Bookings upcoming/past         |
| Pull-to-refresh      | Bookings list (client)         |
| Safe area padding    | Mini App layout                |

### Accessibility

- Focus rings on all interactive elements
- `aria-live` on hold countdown and payment polling
- Keyboard navigation for slot grid
- Skip link in AppShell
- Color contrast WCAG AA on primary `#2563EB`

### SEO

- `generateMetadata` on business profile, category pages
- JSON-LD `LocalBusiness` on profile pages
- Sitemap generated for active businesses (M4)
- `robots.txt` — block `/dashboard`, `/admin`, `/mini`

---

## 16. Legacy migration

| Current path                             | Target                                         | Action              |
| ---------------------------------------- | ---------------------------------------------- | ------------------- |
| `src/components/home-client.tsx`         | `features/search/components/`                  | Split server/client |
| `src/components/hero.tsx`                | `features/search/components/HomepageHero`      | Move                |
| `src/components/auth/telegram-login.tsx` | `features/auth/components/TelegramLoginButton` | Move                |
| `src/lib/api.ts`                         | `shared/lib/api-client.ts` + `features/*/api/` | Split by domain     |
| `src/components/ui/*`                    | `shared/components/ui/*`                       | Move                |
| `src/app/page.tsx`                       | `(consumer)/page.tsx`                          | Route group         |

Delete ordering-specific API methods (`getProducts`, `createOrder`) — replaced by booking feature.

---

## 17. Phased rollout

| Phase  | Milestone | Frontend deliverables                                                            |
| ------ | --------- | -------------------------------------------------------------------------------- |
| **P0** | M0        | Route groups, auth (C-50, C-51), AppShell, design tokens, middleware             |
| **P1** | M2        | Search, business profile, full booking flow (C-02–C-42), my bookings (C-52–C-53) |
| **P2** | M3        | Checkout + payment polling (C-40–C-43)                                           |
| **P3** | M4        | i18n, favorites, reviews, map, homepage polish                                   |
| **P4** | M5        | Notification inbox, Mini App shell (T-01–T-08)                                   |
| **P5** | M6        | Business dashboard, calendar, catalog UI                                         |
| **P6** | M10       | Admin app routes                                                                 |

### P0 acceptance criteria

- [ ] Feature folder structure in place
- [ ] `(auth)` and `(consumer)` route groups with layouts
- [ ] Middleware protects `/bookings`, `/book/*`
- [ ] No business logic in page files
- [ ] Server Components for homepage and business profile shells
- [ ] Auth tokens in httpOnly cookies (no localStorage)
- [ ] React Hook Form + Zod on login forms

---

## Appendix A — Component type decision tree

```
Needs useState/useEffect/hooks?
  YES → Client Component (.client.tsx optional suffix)
  NO  → Needs browser API?
          YES → Client Component
          NO  → Needs event handlers?
                  YES → Client Component (leaf only)
                  NO  → Server Component
```

---

## Appendix B — Environment variables

| Variable                            | Exposure | Purpose          |
| ----------------------------------- | -------- | ---------------- |
| `NEXT_PUBLIC_API_URL`               | Public   | Backend base URL |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Public   | Login widget     |
| `NEXT_PUBLIC_SENTRY_DSN`            | Public   | Error tracking   |
| `NEXT_PUBLIC_MAP_PROVIDER_KEY`      | Public   | Map tiles (M4)   |

No secrets in `NEXT_PUBLIC_*`.

---

_Aligned with `.cursor/rules/frontend.mdc`, `.cursor/rules/architecture.mdc`, `docs/API.md`, and Rezerva roadmap screen IDs._

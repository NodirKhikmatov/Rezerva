# Rezerva Backend — Module Architecture

**Stack:** NestJS 11 · Prisma · PostgreSQL · BullMQ · Redis · Passport JWT  
**API prefix:** `/v1`  
**Target layout:** `backend/src/features/<feature>/` + `backend/src/shared/`

This document defines the complete backend architecture. It specifies modules, classes, and responsibilities only — no implementation code.

---

## Table of contents

1. [Directory structure](#1-directory-structure)
2. [Layering rules](#2-layering-rules)
3. [Application bootstrap](#3-application-bootstrap)
4. [Shared infrastructure](#4-shared-infrastructure)
5. [Feature modules](#5-feature-modules)
6. [Workers & processors](#6-workers--processors)
7. [Cross-cutting concerns](#7-cross-cutting-concerns)
8. [Module dependency graph](#8-module-dependency-graph)
9. [Legacy migration map](#9-legacy-migration-map)

---

## 1. Directory structure

```
backend/src/
├── main.ts
├── worker.main.ts                    # Separate worker entrypoint (M3+)
├── instrument.ts                     # Sentry
├── app.module.ts
│
├── shared/
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── configuration.ts
│   │   └── env.validation.ts         # Joi/Zod fail-fast schema
│   │
│   ├── database/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── public.decorator.ts
│   │   ├── roles.guard.ts
│   │   ├── roles.decorator.ts
│   │   ├── business-member.guard.ts
│   │   ├── business-role.decorator.ts
│   │   └── admin.guard.ts
│   │
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   └── timeout.interceptor.ts
│   │
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   ├── prisma-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   │
│   ├── pipes/
│   │   └── parse-uuid.pipe.ts
│   │
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── business-id.decorator.ts
│   │   └── idempotency-key.decorator.ts
│   │
│   ├── dto/
│   │   ├── pagination-query.dto.ts
│   │   └── paginated-response.dto.ts
│   │
│   ├── types/
│   │   ├── jwt-payload.type.ts
│   │   ├── request-context.type.ts
│   │   └── api-error.type.ts
│   │
│   ├── utils/
│   │   ├── slug.util.ts
│   │   ├── reference-code.util.ts
│   │   └── phone.util.ts
│   │
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   │
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── queue.constants.ts
│   │   └── base.processor.ts
│   │
│   └── storage/
│       ├── storage.module.ts
│       └── storage.service.ts
│
├── features/
│   ├── auth/
│   ├── user/
│   ├── geo/
│   ├── business/
│   ├── venue/
│   ├── catalog/                      # services + resources
│   ├── availability/
│   ├── booking/
│   ├── payment/
│   ├── review/
│   ├── notification/
│   ├── search/
│   ├── admin/
│   └── telegram/
│
└── webhooks/
    ├── webhooks.module.ts
    ├── payme.webhook.controller.ts
    └── click.webhook.controller.ts
```

---

## 2. Layering rules

```
HTTP Request
    → Guard(s)
    → Interceptor(s) [pre]
    → Pipe(s) / ValidationPipe
    → Controller          # HTTP only: parse, delegate, respond
    → Service             # Business rules, orchestration, transactions
    → Repository          # Prisma queries only
    → PostgreSQL / Redis
    → Interceptor(s) [post]
    → Exception Filter(s) [on error]
```

| Layer           | Responsibility                             | Must NOT               |
| --------------- | ------------------------------------------ | ---------------------- |
| **Controller**  | Route mapping, status codes, DTO binding   | Prisma, business logic |
| **Service**     | Domain logic, `$transaction`, enqueue jobs | Raw HTTP concerns      |
| **Repository**  | CRUD, queries, soft-delete filters         | Business decisions     |
| **DTO**         | Input/output validation & serialization    | Database access        |
| **Entity/Type** | Domain shapes, Prisma select mappers       | Validation decorators  |
| **Guard**       | AuthN/AuthZ                                | Business logic         |
| **Processor**   | Async job handling                         | HTTP responses         |

**Dependency direction:** Feature modules may import `shared/` and other features' **exported services only** — never another feature's repository directly.

---

## 3. Application bootstrap

### `main.ts`

| Concern             | Detail                                           |
| ------------------- | ------------------------------------------------ |
| Global prefix       | `/v1`                                            |
| CORS                | `FRONTEND_URL`, credentials                      |
| ValidationPipe      | `whitelist`, `transform`, `forbidNonWhitelisted` |
| Global filters      | `AllExceptionsFilter`, `PrismaExceptionFilter`   |
| Global interceptors | `LoggingInterceptor`, `TransformInterceptor`     |
| Swagger             | `/v1/docs` (OpenAPI)                             |
| Helmet              | Security headers                                 |
| Graceful shutdown   | `enableShutdownHooks()`                          |

### `app.module.ts`

Imports (order matters for lifecycle):

1. `ConfigModule` (global)
2. `PrismaModule` (global)
3. `QueueModule`
4. `StorageModule`
5. `HealthModule`
6. Feature modules (see §5)
7. `WebhooksModule`
8. `TelegramModule` (conditional on `TELEGRAM_BOT_TOKEN`)

### `worker.main.ts`

Separate NestJS application context importing:

- `ConfigModule`, `PrismaModule`, `QueueModule`
- Processor modules only (notification, payment, booking-hold-expiry, payout, search-index)
- No HTTP controllers except health (optional)

---

## 4. Shared infrastructure

### 4.1 Guards

| Class                 | Purpose                                             | Used on                      |
| --------------------- | --------------------------------------------------- | ---------------------------- |
| `JwtAuthGuard`        | Validates Bearer JWT; respects `@Public()`          | Default global (APP_GUARD)   |
| `RolesGuard`          | Checks `PlatformRole` via `@Roles()`                | Admin routes                 |
| `AdminGuard`          | Shorthand `@Roles('admin')`                         | `/admin/*`                   |
| `BusinessMemberGuard` | Validates membership + injects `businessId` context | `/businesses/:businessId/*`  |
| `BusinessRoleGuard`   | Checks `BusinessMemberRole` via `@BusinessRoles()`  | Owner/manager-only mutations |

### 4.2 Interceptors

| Class                  | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `LoggingInterceptor`   | Request ID, method, path, duration, userId            |
| `TransformInterceptor` | Wraps success responses in `{ data, meta? }` envelope |
| `TimeoutInterceptor`   | 30s default; 5s for availability endpoints            |

### 4.3 Filters

| Class                   | Maps to                                     |
| ----------------------- | ------------------------------------------- |
| `HttpExceptionFilter`   | Nest `HttpException` → standard error shape |
| `PrismaExceptionFilter` | P2002 → 409, P2025 → 404, P2003 → 422       |
| `AllExceptionsFilter`   | Unhandled → 500 + Sentry capture            |

### 4.4 Shared DTOs

| Class                     | Purpose                 |
| ------------------------- | ----------------------- |
| `PaginationQueryDto`      | `page`, `limit`, `sort` |
| `PaginatedResponseDto<T>` | Generic list wrapper    |

### 4.5 Shared types

| Type                | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `JwtPayload`        | `{ sub, role, locale, jti, businessId? }`    |
| `RequestContext`    | `{ userId, role, ip, userAgent, requestId }` |
| `ApiError`          | Standard error response contract             |
| `AuthenticatedUser` | User + identities subset                     |

### 4.6 Decorators

| Decorator             | Extracts                           |
| --------------------- | ---------------------------------- |
| `@CurrentUser()`      | JWT user from request              |
| `@BusinessId()`       | Validated business UUID from route |
| `@IdempotencyKey()`   | Header `Idempotency-Key`           |
| `@Public()`           | Skip JWT guard                     |
| `@Roles(...)`         | Platform roles                     |
| `@BusinessRoles(...)` | Business member roles              |

---

## 5. Feature modules

---

### 5.1 `features/auth`

**Purpose:** Phone OTP, Telegram Login, Mini App auth, sessions, token rotation.

#### Module

- `AuthModule`

#### Controllers

| Controller       | Routes                                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthController` | `POST /auth/otp/send`, `POST /auth/otp/verify`, `POST /auth/telegram`, `POST /auth/telegram/mini-app`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId` |

#### Services

| Service               | Responsibility                                |
| --------------------- | --------------------------------------------- |
| `AuthService`         | Orchestrates login flows, issues token pairs  |
| `OtpService`          | Generate, hash, verify OTP; expiry & attempts |
| `TelegramAuthService` | Widget hash + Mini App initData verification  |
| `SessionService`      | Refresh rotation, revoke, list sessions       |
| `TokenService`        | JWT sign/verify, jti generation               |
| `RateLimitService`    | Redis-backed OTP send/verify limits           |

#### Repositories

| Repository          | Models                 |
| ------------------- | ---------------------- |
| `UserRepository`    | `User`, `UserIdentity` |
| `OtpRepository`     | `OtpVerification`      |
| `SessionRepository` | `UserSession`          |

#### DTOs

| DTO                    | Direction |
| ---------------------- | --------- |
| `SendOtpDto`           | Request   |
| `VerifyOtpDto`         | Request   |
| `TelegramLoginDto`     | Request   |
| `TelegramMiniAppDto`   | Request   |
| `RefreshTokenDto`      | Request   |
| `LogoutDto`            | Request   |
| `AuthTokenResponseDto` | Response  |
| `SessionResponseDto`   | Response  |

#### Entities / Types

| Type                  | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `AuthResult`          | Internal login result before token issuance |
| `TelegramUserPayload` | Parsed Telegram user data                   |
| `SessionRecord`       | Mapped session entity                       |

#### Guards (feature-local)

| Guard               | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `RefreshTokenGuard` | Validates refresh token on `/auth/refresh` |

#### Validation

- Phone: E.164, normalize to `+998`
- OTP code: 6 digits
- Telegram: hash + auth_date freshness (24h)
- Rate limits: 3 sends/hour/phone, 5 verify attempts/OTP

#### Exports

- `AuthService`, `TokenService`, `JwtAuthGuard` (re-export from shared)

---

### 5.2 `features/user`

**Purpose:** Profile, addresses, favorites, notification preferences, push devices.

#### Module

- `UserModule`

#### Controllers

| Controller                 | Routes                                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| `UserController`           | `GET/PATCH /users/me`                                                         |
| `UserAddressController`    | `GET/POST /users/me/addresses`, `PATCH/DELETE /users/me/addresses/:addressId` |
| `UserFavoriteController`   | `GET /users/me/favorites`, `POST/DELETE /users/me/favorites/:businessId`      |
| `UserPreferenceController` | `GET/PATCH /users/me/notification-preferences`                                |
| `PushDeviceController`     | `POST /notifications/devices`, `DELETE /notifications/devices/:deviceId`      |

#### Services

| Service                         | Responsibility                      |
| ------------------------------- | ----------------------------------- |
| `UserService`                   | Profile CRUD, email uniqueness      |
| `UserAddressService`            | Address CRUD, default address logic |
| `FavoriteService`               | Idempotent favorite toggle          |
| `NotificationPreferenceService` | Preference CRUD                     |
| `PushDeviceService`             | Device token registration           |

#### Repositories

| Repository                         | Models                                    |
| ---------------------------------- | ----------------------------------------- |
| `UserRepository`                   | `User` (shared with auth — single source) |
| `UserAddressRepository`            | `UserAddress`                             |
| `FavoriteRepository`               | `UserFavorite`                            |
| `NotificationPreferenceRepository` | `UserNotificationPreference`              |
| `PushDeviceRepository`             | `PushDevice`                              |

#### DTOs

| DTO                                     | Direction |
| --------------------------------------- | --------- |
| `UpdateUserDto`                         | Request   |
| `UserResponseDto`                       | Response  |
| `CreateAddressDto` / `UpdateAddressDto` | Request   |
| `AddressResponseDto`                    | Response  |
| `FavoriteResponseDto`                   | Response  |
| `UpdateNotificationPreferenceDto`       | Request   |
| `RegisterPushDeviceDto`                 | Request   |

#### Entities / Types

| Type                  | Purpose                |
| --------------------- | ---------------------- |
| `UserProfile`         | Public-safe user shape |
| `UserIdentitySummary` | Linked providers       |

#### Validation

- Email uniqueness check in service
- Address: district must exist in geo module
- Locale enum: `uz | ru | en`

---

### 5.3 `features/geo`

**Purpose:** Countries, regions, districts, cities (public read-only).

#### Module

- `GeoModule`

#### Controllers

| Controller      | Routes                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `GeoController` | `GET /geo/countries`, `GET /geo/countries/:countryId/regions`, `GET /geo/regions/:regionId/districts`, `GET /geo/cities` |

#### Services

| Service      | Responsibility                            |
| ------------ | ----------------------------------------- |
| `GeoService` | Read-only geo hierarchy, active filtering |

#### Repositories

| Repository           | Models     |
| -------------------- | ---------- |
| `CountryRepository`  | `Country`  |
| `RegionRepository`   | `Region`   |
| `DistrictRepository` | `District` |
| `CityRepository`     | `City`     |

#### DTOs

| DTO                   | Direction          |
| --------------------- | ------------------ |
| `CountryResponseDto`  | Response           |
| `RegionResponseDto`   | Response           |
| `DistrictResponseDto` | Response           |
| `CityResponseDto`     | Response           |
| `GeoQueryDto`         | Query (`isActive`) |

#### Entities / Types

| Type           | Purpose                            |
| -------------- | ---------------------------------- |
| `GeoHierarchy` | Nested country → region → district |

#### Guards

- All routes `@Public()`

---

### 5.4 `features/business`

**Purpose:** Business registration, profile, onboarding, members, media, policies, analytics, payouts view.

#### Module

- `BusinessModule`

#### Controllers

| Controller                     | Routes                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `BusinessController`           | `GET /businesses`, `GET /businesses/slug/:slug`, `POST /businesses`, `GET /businesses/me`, `GET/PATCH /businesses/:businessId`                 |
| `BusinessOnboardingController` | `GET /businesses/:businessId/onboarding`, `PATCH /businesses/:businessId/onboarding/:stepId`, `POST /businesses/:businessId/onboarding/submit` |
| `BusinessMemberController`     | `GET /businesses/:businessId/members`, `POST .../invite`, `PATCH .../:memberId`, `DELETE .../:memberId`                                        |
| `BusinessMediaController`      | `POST .../media/upload-url`, `POST .../media/confirm`, `DELETE .../media/:mediaId`                                                             |
| `BusinessAnalyticsController`  | `GET /businesses/:businessId/analytics`                                                                                                        |
| `BusinessPayoutController`     | `GET /businesses/:businessId/payouts`, `GET .../payouts/:payoutId`                                                                             |
| `StaffInvitationController`    | `POST /invitations/:token/accept`                                                                                                              |

#### Services

| Service                     | Responsibility                                 |
| --------------------------- | ---------------------------------------------- |
| `BusinessService`           | CRUD, slug generation, status transitions      |
| `BusinessOnboardingService` | Step state machine, validation per step        |
| `BusinessMemberService`     | Invite, accept, role management                |
| `BusinessMediaService`      | Signed URL orchestration via StorageService    |
| `BusinessPolicyService`     | Cancellation/deposit policy CRUD               |
| `BusinessAnalyticsService`  | Aggregated metrics queries                     |
| `BusinessPayoutService`     | Read-only payout views                         |
| `StaffInvitationService`    | Token generation, acceptance                   |
| `CategoryProfileService`    | Football/salon/restaurant/etc. profile upserts |

#### Repositories

| Repository                       | Models                                                        |
| -------------------------------- | ------------------------------------------------------------- |
| `BusinessRepository`             | `Business`                                                    |
| `BusinessMemberRepository`       | `BusinessMember`                                              |
| `BusinessPolicyRepository`       | `BusinessPolicy`                                              |
| `BusinessMediaRepository`        | `BusinessMedia`                                               |
| `BusinessVerificationRepository` | `BusinessVerification`, `BusinessVerificationDocument`        |
| `StaffInvitationRepository`      | `StaffInvitation`                                             |
| `BusinessPayoutRepository`       | `BusinessPayout`, `PayoutItem`                                |
| `FootballProfileRepository`      | `FootballVenueProfile`, `FootballPitch`                       |
| `SalonProfileRepository`         | `SalonProfile`, `SalonChair`                                  |
| `RestaurantProfileRepository`    | `RestaurantProfile`, `RestaurantTable`                        |
| `ClinicProfileRepository`        | `ClinicProfile`, `ClinicDoctor`, `ClinicIntakeFormField`      |
| `CoworkingProfileRepository`     | `CoworkingProfile`, `CoworkingSpace`                          |
| `HotelProfileRepository`         | `HotelProfile`, `HotelRoomType`, `HotelRoom`, `HotelRatePlan` |

#### DTOs

| DTO                             | Direction                  |
| ------------------------------- | -------------------------- |
| `CreateBusinessDto`             | Request                    |
| `UpdateBusinessDto`             | Request                    |
| `BusinessResponseDto`           | Response                   |
| `BusinessPublicResponseDto`     | Response (consumer-facing) |
| `BusinessSearchQueryDto`        | Query                      |
| `OnboardingStepDto`             | Request (per step)         |
| `OnboardingProgressResponseDto` | Response                   |
| `SubmitVerificationDto`         | Request                    |
| `InviteMemberDto`               | Request                    |
| `UpdateMemberRoleDto`           | Request                    |
| `MemberResponseDto`             | Response                   |
| `RequestUploadUrlDto`           | Request                    |
| `ConfirmMediaDto`               | Request                    |
| `MediaResponseDto`              | Response                   |
| `BusinessPolicyDto`             | Request/Response           |
| `AnalyticsQueryDto`             | Query                      |
| `AnalyticsResponseDto`          | Response                   |
| `PayoutSummaryResponseDto`      | Response                   |
| `PayoutDetailResponseDto`       | Response                   |
| `AcceptInvitationDto`           | Request                    |

#### Entities / Types

| Type                    | Purpose                          |
| ----------------------- | -------------------------------- |
| `BusinessEntity`        | Full business with relations     |
| `OnboardingState`       | Step progress internal model     |
| `BusinessMemberContext` | Injected by guard                |
| `CategoryProfileUnion`  | Discriminated union per vertical |

#### Guards

| Guard                 | Routes                             |
| --------------------- | ---------------------------------- |
| `BusinessMemberGuard` | All `/:businessId/*` member routes |
| `BusinessRoleGuard`   | Mutations requiring owner/manager  |

#### Validation

- Slug: auto-generated, URL-safe, unique
- Onboarding: step prerequisites enforced in service
- Media: mime type + size limits
- Member invite: phone E.164, role not `owner`

#### Exports

- `BusinessService`, `BusinessMemberGuard`

---

### 5.5 `features/venue`

**Purpose:** Physical locations (venues), working hours, blocked dates.

#### Module

- `VenueModule`

#### Controllers

| Controller                | Routes                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `VenueController`         | `GET /businesses/:businessId/venues`, `GET /venues/:venueId`, `POST/PATCH/DELETE /businesses/:businessId/venues/:venueId` |
| `VenueScheduleController` | `PUT .../venues/:venueId/working-hours`, `POST/DELETE .../blocked-dates/:blockedDateId`                                   |

#### Services

| Service               | Responsibility                     |
| --------------------- | ---------------------------------- |
| `VenueService`        | Location CRUD, primary venue logic |
| `WorkingHoursService` | 7-day schedule validation & upsert |
| `BlockedDateService`  | Holiday/closure management         |

#### Repositories

| Repository               | Models                |
| ------------------------ | --------------------- |
| `VenueRepository`        | `BusinessLocation`    |
| `WorkingHoursRepository` | `BusinessWorkingHour` |
| `BlockedDateRepository`  | `BusinessBlockedDate` |

#### DTOs

| DTO                                 | Direction |
| ----------------------------------- | --------- |
| `CreateVenueDto` / `UpdateVenueDto` | Request   |
| `VenueResponseDto`                  | Response  |
| `VenuePublicResponseDto`            | Response  |
| `SetWorkingHoursDto`                | Request   |
| `WorkingHourItemDto`                | Nested    |
| `CreateBlockedDateDto`              | Request   |
| `BlockedDateResponseDto`            | Response  |

#### Entities / Types

| Type           | Purpose                   |
| -------------- | ------------------------- |
| `VenueEntity`  | Location with geo + hours |
| `WeekSchedule` | Normalized 7-day map      |

#### Guards

- `BusinessMemberGuard` on mutations

#### Validation

- One `isPrimary` per business (service enforces)
- `dayOfWeek` 0–6 unique per venue
- Cannot delete venue with future bookings

---

### 5.6 `features/catalog`

**Purpose:** Bookable resources and services (catalog).

#### Module

- `CatalogModule`

#### Controllers

| Controller           | Routes                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ResourceController` | `GET /venues/:venueId/resources`, `POST/PATCH/DELETE /businesses/:businessId/resources/:resourceId`, `POST .../blocked-slots`       |
| `ServiceController`  | `GET /businesses/:businessId/services`, `GET /services/:serviceId`, `POST/PATCH/DELETE /businesses/:businessId/services/:serviceId` |

#### Services

| Service                   | Responsibility                                  |
| ------------------------- | ----------------------------------------------- |
| `ResourceService`         | Resource CRUD, category metadata                |
| `ServiceCatalogService`   | Service CRUD, resource linking                  |
| `ResourceBlockService`    | Maintenance block slots                         |
| `CategoryResourceService` | Football pitch / salon chair / table extensions |

#### Repositories

| Repository                  | Models                |
| --------------------------- | --------------------- |
| `ResourceRepository`        | `Resource`            |
| `ServiceRepository`         | `Service`             |
| `ServiceResourceRepository` | `ServiceResource`     |
| `ResourceBlockRepository`   | `ResourceBlockedSlot` |

#### DTOs

| DTO                                       | Direction         |
| ----------------------------------------- | ----------------- |
| `CreateResourceDto` / `UpdateResourceDto` | Request           |
| `ResourceResponseDto`                     | Response          |
| `CreateServiceDto` / `UpdateServiceDto`   | Request           |
| `ServiceResponseDto`                      | Response          |
| `CreateResourceBlockDto`                  | Request           |
| `ResourceBlockResponseDto`                | Response          |
| `ServiceQueryDto`                         | Query (`venueId`) |

#### Entities / Types

| Type               | Purpose                       |
| ------------------ | ----------------------------- |
| `ResourceEntity`   | Resource + category extension |
| `ServiceEntity`    | Service + linked resources    |
| `ResourceMetadata` | Category-specific JSON schema |

#### Guards

- `BusinessMemberGuard` on mutations

#### Validation

- Service `resourceIds` must belong to same venue
- Duration min 15 min, max 7 days
- Price positive integer (UZS)
- Resource block: no overlap with existing bookings

#### Exports

- `ResourceService`, `ServiceCatalogService`

---

### 5.7 `features/availability`

**Purpose:** Slot computation, Redis cache, hold TTL coordination.

#### Module

- `AvailabilityModule`

#### Controllers

| Controller               | Routes                                     |
| ------------------------ | ------------------------------------------ |
| `AvailabilityController` | `GET /businesses/:businessId/availability` |

#### Services

| Service                    | Responsibility                                       |
| -------------------------- | ---------------------------------------------------- |
| `AvailabilityService`      | Orchestrates slot computation                        |
| `SlotCalculatorService`    | Pure functions: hours − allocations − holds − blocks |
| `AvailabilityCacheService` | Redis cache-aside, 5-min TTL, invalidation hooks     |

#### Repositories

| Repository               | Models                                                    |
| ------------------------ | --------------------------------------------------------- |
| `AvailabilityRepository` | Reads allocations, holds, blocks, hours (read-only joins) |

#### DTOs

| DTO                       | Direction                                                    |
| ------------------------- | ------------------------------------------------------------ |
| `AvailabilityQueryDto`    | Query (`serviceId`, `resourceId`, `from`, `to`, `partySize`) |
| `AvailabilitySlotDto`     | Response item                                                |
| `AvailabilityResponseDto` | Response                                                     |

#### Entities / Types

| Type                  | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `TimeSlot`            | `{ startsAt, endsAt, resourceId, price, available }` |
| `AvailabilityContext` | Inputs for calculator                                |

#### Guards

- `@Public()` (active businesses only)

#### Validation

- Date range max 14 days
- `partySize` required for restaurant category

#### Exports

- `AvailabilityService`, `AvailabilityCacheService`

---

### 5.8 `features/booking`

**Purpose:** Holds, booking lifecycle, calendar, walk-in, check-in.

#### Module

- `BookingModule`

#### Controllers

| Controller                  | Routes                                                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SlotHoldController`        | `POST /bookings/holds`, `DELETE /bookings/holds/:holdId`                                                                                                                          |
| `BookingController`         | `POST /bookings`, `GET /bookings/me`, `GET /bookings/:bookingId`, `GET /bookings/reference/:referenceCode`, `POST /bookings/:bookingId/cancel`, `GET /bookings/:referenceCode/qr` |
| `BusinessBookingController` | `GET /businesses/:businessId/bookings`, `GET .../calendar`, `POST .../walk-in`, `POST .../:bookingId/check-in`, `.../complete`, `.../no-show`, `.../accept`, `.../reject`         |

#### Services

| Service                   | Responsibility                              |
| ------------------------- | ------------------------------------------- |
| `BookingService`          | Create, confirm, cancel, status transitions |
| `SlotHoldService`         | Redis lock, 10-min TTL, convert to booking  |
| `BookingPolicyService`    | Evaluates `policySnapshot` for cancel fees  |
| `BookingCalendarService`  | Day/week calendar aggregation               |
| `WalkInBookingService`    | Business-created bookings without hold      |
| `BookingReferenceService` | `RZ-YYYY-NNNNNN` generation                 |
| `BookingQrService`        | QR payload generation                       |
| `IntakeResponseService`   | Clinic form responses                       |

#### Repositories

| Repository                       | Models                      |
| -------------------------------- | --------------------------- |
| `SlotHoldRepository`             | `SlotHold`                  |
| `BookingRepository`              | `Booking`                   |
| `BookingLineItemRepository`      | `BookingLineItem`           |
| `BookingAllocationRepository`    | `BookingResourceAllocation` |
| `BookingStatusHistoryRepository` | `BookingStatusHistory`      |
| `BookingParticipantRepository`   | `BookingParticipant`        |
| `IntakeResponseRepository`       | `BookingIntakeResponse`     |

#### DTOs

| DTO                         | Direction       |
| --------------------------- | --------------- |
| `CreateHoldDto`             | Request         |
| `HoldResponseDto`           | Response        |
| `CreateBookingDto`          | Request         |
| `BookingResponseDto`        | Response        |
| `BookingDetailResponseDto`  | Response        |
| `BookingSummaryResponseDto` | Response (list) |
| `CancelBookingDto`          | Request         |
| `CancelBookingResponseDto`  | Response        |
| `WalkInBookingDto`          | Request         |
| `BookingQueryDto`           | Query           |
| `CalendarQueryDto`          | Query           |
| `CalendarResponseDto`       | Response        |
| `RejectBookingDto`          | Request         |
| `ParticipantDto`            | Nested          |
| `IntakeResponseDto`         | Nested          |

#### Entities / Types

| Type                      | Purpose                          |
| ------------------------- | -------------------------------- |
| `BookingEntity`           | Full booking with relations      |
| `BookingStatusTransition` | State machine definition         |
| `PolicySnapshot`          | Immutable policy at booking time |
| `CalendarEvent`           | Unified booking + block event    |

#### Guards

| Guard                 | Routes                         |
| --------------------- | ------------------------------ |
| `BookingOwnerGuard`   | Consumer booking detail/cancel |
| `BusinessMemberGuard` | Business booking routes        |

#### Validation

- Hold: max 3 active per user
- Confirm: hold not expired, idempotency key
- Cancel: policy window via `BookingPolicyService`
- Status transitions: enforced state machine

#### Exports

- `BookingService`, `SlotHoldService`

---

### 5.9 `features/payment`

**Purpose:** Payme/Click, ledger, refunds, payouts generation.

#### Module

- `PaymentModule`

#### Controllers

| Controller          | Routes                                                                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PaymentController` | `GET /bookings/:bookingId/payment`, `GET /payments/methods`, `POST /bookings/:bookingId/payment/initiate`, `GET /payments/:paymentId/status`, `GET /bookings/:bookingId/refunds` |

#### Services

| Service                   | Responsibility                               |
| ------------------------- | -------------------------------------------- |
| `PaymentService`          | Initiate, status, link to booking            |
| `PaymeAdapter`            | Invoice creation, sandbox/prod               |
| `ClickAdapter`            | Click API integration                        |
| `PaymentWebhookService`   | Verify signatures, idempotent processing     |
| `RefundService`           | Policy-based refund calculation & initiation |
| `LedgerService`           | Append-only `PaymentTransaction` writes      |
| `PayoutGenerationService` | Weekly payout job logic                      |
| `ReconciliationService`   | Nightly pending payment sweep                |

#### Repositories

| Repository                     | Models                         |
| ------------------------------ | ------------------------------ |
| `PaymentRepository`            | `Payment`                      |
| `PaymentTransactionRepository` | `PaymentTransaction`           |
| `RefundRepository`             | `Refund`                       |
| `PayoutRepository`             | `BusinessPayout`, `PayoutItem` |
| `CommissionRateRepository`     | `CommissionRate`               |

#### DTOs

| DTO                        | Direction                |
| -------------------------- | ------------------------ |
| `InitiatePaymentDto`       | Request                  |
| `PaymentResponseDto`       | Response                 |
| `PaymentStatusResponseDto` | Response                 |
| `PaymentMethodResponseDto` | Response                 |
| `RefundResponseDto`        | Response                 |
| `PaymeWebhookDto`          | Request (provider shape) |
| `ClickWebhookDto`          | Request (provider shape) |

#### Entities / Types

| Type                | Purpose                   |
| ------------------- | ------------------------- |
| `PaymentEntity`     | Payment + transactions    |
| `LedgerEntry`       | Transaction audit record  |
| `RefundCalculation` | Amount breakdown          |
| `ProviderAdapter`   | Interface for Payme/Click |

#### Guards

| Guard                   | Routes                  |
| ----------------------- | ----------------------- |
| `BookingOwnerGuard`     | Consumer payment routes |
| `WebhookSignatureGuard` | Webhook controllers     |

#### Validation

- `Idempotency-Key` required on initiate
- Amount must match booking deposit/full
- Return URLs HTTPS + allowlisted domain

#### Exports

- `PaymentService`, `RefundService`, `PaymentWebhookService`

---

### 5.10 `features/review`

**Purpose:** Verified reviews, reports, rating aggregation.

#### Module

- `ReviewModule`

#### Controllers

| Controller         | Routes                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `ReviewController` | `GET /businesses/:businessId/reviews`, `POST /bookings/:bookingId/review`, `PATCH/DELETE /reviews/:reviewId`, `POST /reviews/:reviewId/report` |

#### Services

| Service                    | Responsibility                                  |
| -------------------------- | ----------------------------------------------- |
| `ReviewService`            | Create, update, soft-delete                     |
| `ReviewReportService`      | User reports                                    |
| `RatingAggregationService` | Update `Business.averageRating` + `reviewCount` |

#### Repositories

| Repository               | Models         |
| ------------------------ | -------------- |
| `ReviewRepository`       | `Review`       |
| `ReviewReportRepository` | `ReviewReport` |

#### DTOs

| DTO                     | Direction               |
| ----------------------- | ----------------------- |
| `CreateReviewDto`       | Request                 |
| `UpdateReviewDto`       | Request                 |
| `ReviewResponseDto`     | Response                |
| `ReviewListResponseDto` | Response (with summary) |
| `ReportReviewDto`       | Request                 |
| `ReviewQueryDto`        | Query                   |

#### Entities / Types

| Type            | Purpose                        |
| --------------- | ------------------------------ |
| `ReviewEntity`  | Review with author public info |
| `RatingSummary` | Average + distribution         |

#### Guards

| Guard               | Routes                  |
| ------------------- | ----------------------- |
| `ReviewAuthorGuard` | PATCH/DELETE own review |

#### Validation

- One review per booking (DB unique + service check)
- Booking must be `completed`
- Review window: 30 days post-completion
- Edit window: 7 days post-create
- Rating 1–5 integer

---

### 5.11 `features/notification`

**Purpose:** In-app inbox, multi-channel delivery, preferences enforcement.

#### Module

- `NotificationModule`

#### Controllers

| Controller               | Routes                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `NotificationController` | `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`, `GET /notifications/unread-count` |

#### Services

| Service                         | Responsibility                       |
| ------------------------------- | ------------------------------------ |
| `NotificationService`           | Create in-app records, inbox queries |
| `NotificationDispatcherService` | Enqueue delivery jobs                |
| `NotificationTemplateService`   | uz/ru/en template rendering          |
| `SmsAdapter`                    | SMS provider                         |
| `TelegramNotificationAdapter`   | Bot message sender                   |
| `PushAdapter`                   | FCM/APNs                             |

#### Repositories

| Repository                       | Models                 |
| -------------------------------- | ---------------------- |
| `NotificationRepository`         | `Notification`         |
| `NotificationDeliveryRepository` | `NotificationDelivery` |

#### DTOs

| DTO                       | Direction |
| ------------------------- | --------- |
| `NotificationResponseDto` | Response  |
| `NotificationQueryDto`    | Query     |
| `UnreadCountResponseDto`  | Response  |

#### Entities / Types

| Type                  | Purpose             |
| --------------------- | ------------------- |
| `NotificationPayload` | Template variables  |
| `DeliveryResult`      | Adapter response    |
| `NotificationEvent`   | Internal event enum |

#### Processors (registered in worker)

| Processor                  | Queue               |
| -------------------------- | ------------------- |
| `NotificationProcessor`    | `notifications`     |
| `BookingReminderProcessor` | `booking-reminders` |

#### Validation

- Respects `UserNotificationPreference` before dispatch

#### Exports

- `NotificationDispatcherService`

---

### 5.12 `features/search`

**Purpose:** Business discovery, featured listings, slug resolution.

#### Module

- `SearchModule`

#### Controllers

| Controller         | Routes                                               |
| ------------------ | ---------------------------------------------------- |
| `SearchController` | `GET /businesses` (delegates query), `GET /featured` |

#### Services

| Service              | Responsibility                  |
| -------------------- | ------------------------------- |
| `SearchService`      | Filtered business search        |
| `FeaturedService`    | Active featured listings        |
| `SearchIndexService` | Materialized view refresh (M11) |

#### Repositories

| Repository                  | Models                              |
| --------------------------- | ----------------------------------- |
| `SearchRepository`          | `Business` + joins (read-optimized) |
| `FeaturedListingRepository` | `FeaturedListing`                   |

#### DTOs

| DTO                | Direction                  |
| ------------------ | -------------------------- |
| `SearchQueryDto`   | Query (extends pagination) |
| `FeaturedQueryDto` | Query                      |
| `SearchResultDto`  | Response item              |

#### Entities / Types

| Type             | Purpose                  |
| ---------------- | ------------------------ |
| `SearchFilters`  | Normalized filter object |
| `GeoBoundingBox` | Lat/lng/radius search    |

#### Guards

- `@Public()`

---

### 5.13 `features/admin`

**Purpose:** Verification queue, disputes, moderation, platform config, audit.

#### Module

- `AdminModule`

#### Controllers

| Controller                    | Routes                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `AdminOverviewController`     | `GET /admin/overview`                                                            |
| `AdminVerificationController` | `GET /admin/verifications`, `GET .../:id`, `POST .../approve`, `POST .../reject` |
| `AdminBookingController`      | `GET /admin/bookings`, `POST /admin/bookings/:id/cancel`                         |
| `AdminDisputeController`      | `GET /admin/disputes`, `GET .../:id`, `POST .../resolve`                         |
| `AdminReviewController`       | `GET /admin/reviews/flagged`, `POST /admin/reviews/:id/moderate`                 |
| `AdminFeaturedController`     | CRUD `/admin/featured-listings`                                                  |
| `AdminCommissionController`   | `GET/POST /admin/commission-rates`                                               |
| `AdminSettingsController`     | `GET/PUT /admin/settings/:key`                                                   |
| `AdminAuditController`        | `GET /admin/audit-logs`                                                          |
| `AdminPaymentController`      | `POST /admin/payments/:id/refund`                                                |
| `AdminBusinessController`     | `POST /admin/businesses/:id/suspend`, `POST .../reinstate`                       |

#### Services

| Service                    | Responsibility             |
| -------------------------- | -------------------------- |
| `AdminOverviewService`     | Dashboard aggregates       |
| `VerificationAdminService` | Approve/reject with audit  |
| `DisputeAdminService`      | Investigation & resolution |
| `ReviewModerationService`  | Hide/approve/delete        |
| `FeaturedAdminService`     | Featured CRUD              |
| `CommissionAdminService`   | Rate management            |
| `PlatformSettingsService`  | Key-value config           |
| `AuditLogService`          | Append-only audit writes   |
| `AdminRefundService`       | Manual refund override     |

#### Repositories

| Repository                  | Models                     |
| --------------------------- | -------------------------- |
| `AuditLogRepository`        | `AuditLog`                 |
| `DisputeRepository`         | `Dispute`                  |
| `FeaturedListingRepository` | `FeaturedListing` (shared) |
| `CommissionRateRepository`  | `CommissionRate` (shared)  |
| `PlatformSettingRepository` | `PlatformSetting`          |

#### DTOs

| DTO                        | Direction |
| -------------------------- | --------- |
| `AdminOverviewResponseDto` | Response  |
| `VerificationListQueryDto` | Query     |
| `ApproveVerificationDto`   | Request   |
| `RejectVerificationDto`    | Request   |
| `AdminCancelBookingDto`    | Request   |
| `ResolveDisputeDto`        | Request   |
| `ModerateReviewDto`        | Request   |
| `CreateFeaturedListingDto` | Request   |
| `CreateCommissionRateDto`  | Request   |
| `UpdatePlatformSettingDto` | Request   |
| `AuditLogQueryDto`         | Query     |
| `AdminRefundDto`           | Request   |
| `SuspendBusinessDto`       | Request   |

#### Entities / Types

| Type            | Purpose                |
| --------------- | ---------------------- |
| `AuditEntry`    | Immutable audit record |
| `DisputeEntity` | Full dispute context   |
| `AdminAction`   | Typed action enum      |

#### Guards

| Guard              | Routes                        |
| ------------------ | ----------------------------- |
| `AdminGuard`       | All `/admin/*`                |
| `IpAllowlistGuard` | Optional production hardening |

#### Validation

- Reject verification: reason + message required
- Audit log written on every mutation (via `AuditLogService` decorator/interceptor)

---

### 5.14 `features/telegram`

**Purpose:** Telegraf bot — thin HTTP/webhook layer delegating to feature services.

#### Module

- `TelegramModule`

#### Controllers

| Controller                  | Routes                                |
| --------------------------- | ------------------------------------- |
| `TelegramWebhookController` | `POST /telegram/webhook` (production) |

#### Services

| Service                  | Responsibility              |
| ------------------------ | --------------------------- |
| `TelegramBotService`     | Telegraf instance lifecycle |
| `TelegramSessionService` | Redis session store         |

#### Handlers (not HTTP — Telegraf modules)

| Handler module    | Commands / Scenes         |
| ----------------- | ------------------------- |
| `StartCommand`    | `/start`                  |
| `BookingsCommand` | `/bookings`               |
| `HelpCommand`     | `/help`                   |
| `BookingScene`    | Scene Wizard booking flow |

#### Repositories

- None — delegates to `BookingService`, `AuthService`, `NotificationService`

#### DTOs

| DTO                 | Direction                  |
| ------------------- | -------------------------- |
| `TelegramUpdateDto` | Webhook payload validation |

#### Entities / Types

| Type              | Purpose                   |
| ----------------- | ------------------------- |
| `TelegramSession` | Redis session shape       |
| `BotContext`      | Extended Telegraf context |

#### Guards / Middleware

| Middleware                    | Purpose             |
| ----------------------------- | ------------------- |
| `TelegramRateLimitMiddleware` | Per-user rate limit |
| `TelegramLoggingMiddleware`   | Action audit log    |
| `TelegramSessionMiddleware`   | Redis session       |

#### Validation

- initData validated in auth module for Mini App
- Command handlers ≤ 30 lines (delegate to services)

---

### 5.15 `webhooks`

**Purpose:** Isolated webhook endpoints with signature verification (separate from feature controllers for middleware isolation).

#### Module

- `WebhooksModule`

#### Controllers

| Controller               | Routes                 |
| ------------------------ | ---------------------- |
| `PaymeWebhookController` | `POST /webhooks/payme` |
| `ClickWebhookController` | `POST /webhooks/click` |

#### Services

- Delegates to `PaymentWebhookService`

#### Guards

| Guard                 | Purpose                      |
| --------------------- | ---------------------------- |
| `PaymeSignatureGuard` | HMAC verification            |
| `ClickSignatureGuard` | Click signature verification |

#### DTOs

- Provider-specific webhook DTOs (defined in payment feature, imported here)

---

## 6. Workers & processors

| Processor                    | Module       | Queue name           | Triggers                 |
| ---------------------------- | ------------ | -------------------- | ------------------------ |
| `NotificationProcessor`      | notification | `notifications`      | Booking events, OTP      |
| `BookingReminderProcessor`   | notification | `booking-reminders`  | Cron 24h/1h reminders    |
| `HoldExpiryProcessor`        | booking      | `hold-expiry`        | Expire slot holds        |
| `PaymentProcessor`           | payment      | `payments`           | Webhook retry            |
| `ReconciliationProcessor`    | payment      | `reconciliation`     | Nightly pending sweep    |
| `PayoutProcessor`            | payment      | `payouts`            | Weekly payout generation |
| `SearchIndexProcessor`       | search       | `search-index`       | MV refresh (M11)         |
| `RatingAggregationProcessor` | review       | `rating-aggregation` | Async rating recalc      |

Each processor extends `BaseProcessor` from `shared/queue/`:

- Idempotent job handling
- Retry with exponential backoff (5 attempts)
- Dead-letter queue on failure
- Structured logging + Sentry

---

## 7. Cross-cutting concerns

### 7.1 Global validation strategy

| Layer          | Tool                                    | Scope                                 |
| -------------- | --------------------------------------- | ------------------------------------- |
| HTTP input     | `class-validator` + `class-transformer` | All DTOs                              |
| Environment    | Zod schema in `env.validation.ts`       | Boot-time                             |
| Shared schemas | `packages/shared-validation`            | Phone, OTP, slug (frontend + backend) |
| Business rules | Service layer                           | State machines, policy evaluation     |
| Database       | Prisma + PG constraints                 | Uniqueness, FK, exclusion             |

### 7.2 ValidationPipe configuration

```
whitelist: true
transform: true
forbidNonWhitelisted: true
transformOptions: { enableImplicitConversion: false }
```

Custom validators:

- `@IsE164Phone()` — shared phone decorator
- `@IsBusinessCategory()` — enum from shared-constants
- `@IsFutureDate()` — booking dates
- `@IsValidUuid()` — route params

### 7.3 Transaction boundaries

| Operation            | Owner service                      | Pattern                                                        |
| -------------------- | ---------------------------------- | -------------------------------------------------------------- |
| Confirm booking      | `BookingService`                   | `$transaction`: hold → booking → allocation → history          |
| Payment webhook      | `PaymentWebhookService`            | `$transaction`: transaction → payment status → booking confirm |
| Cancel + refund      | `BookingService` + `RefundService` | Saga: cancel → enqueue refund job                              |
| Review publish       | `ReviewService`                    | `$transaction`: review → aggregate rating                      |
| Verification approve | `VerificationAdminService`         | `$transaction`: verification → business status → audit         |

### 7.4 Caching & invalidation

| Cache              | Service                    | TTL    | Invalidate on              |
| ------------------ | -------------------------- | ------ | -------------------------- |
| Availability slots | `AvailabilityCacheService` | 5 min  | Booking, hold, block write |
| Geo hierarchy      | `GeoService`               | 1 hour | Admin geo change           |
| Featured listings  | `FeaturedService`          | 15 min | Featured CRUD              |
| Platform settings  | `PlatformSettingsService`  | 5 min  | Settings update            |

### 7.5 Rate limiting

| Endpoint group                     | Limit                 | Store |
| ---------------------------------- | --------------------- | ----- |
| `POST /auth/otp/send`              | 3/hour/phone          | Redis |
| `POST /auth/otp/verify`            | 10/min/IP             | Redis |
| `GET /businesses/:id/availability` | 60/min/IP             | Redis |
| Public search                      | 120/min/IP            | Redis |
| Webhooks                           | None (signature auth) | —     |

Implementation: `@nestjs/throttler` with Redis storage or custom `RateLimitService`.

### 7.6 Audit logging

`AuditLogInterceptor` or explicit `AuditLogService.log()` calls on:

- All `/admin/*` mutations
- Verification approve/reject
- Dispute resolution
- Manual refund override
- Business suspend/reinstate

Captures: `actorId`, `action`, `entityType`, `entityId`, `oldValues`, `newValues`, `ipAddress`.

---

## 8. Module dependency graph

```
                    ┌─────────────┐
                    │  AppModule  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌────────────┐    ┌────────────┐
   │  Shared   │    │  Webhooks  │    │  Telegram  │
   │ (Prisma,  │    └─────┬──────┘    └─────┬──────┘
   │  Guards)  │          │                 │
   └─────┬─────┘          │                 │
         │                ▼                 │
         │          ┌──────────┐            │
         │          │ Payment  │◄───────────┤
         │          └────┬─────┘            │
         │               │                  │
    ┌────┴────────────────┼──────────────────┤
    ▼                     ▼                  ▼
┌────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐
│  Auth  │  │   User   │  │   Geo   │  │  Search  │
└───┬────┘  └──────────┘  └─────────┘  └──────────┘
    │
    ▼
┌──────────┐     ┌─────────┐     ┌────────────┐
│ Business │────►│  Venue  │────►│  Catalog   │
└────┬─────┘     └─────────┘     └─────┬──────┘
     │                                  │
     │         ┌──────────────┐         │
     └────────►│ Availability │◄────────┘
               └──────┬───────┘
                      ▼
               ┌─────────────┐
               │   Booking   │
               └──────┬──────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   ┌──────────┐ ┌───────────┐ ┌──────────────┐
   │ Payment  │ │  Review   │ │ Notification │
   └──────────┘ └───────────┘ └──────────────┘
                      │
                      ▼
                ┌──────────┐
                │  Admin   │
                └──────────┘
```

**Allowed cross-feature imports:**

| From           | May import                                                      |
| -------------- | --------------------------------------------------------------- |
| `booking`      | `availability`, `catalog`, `business`, `payment` (service only) |
| `payment`      | `booking` (service only)                                        |
| `review`       | `booking` (service only)                                        |
| `notification` | `user`, `booking` (service only)                                |
| `admin`        | all feature services (never repositories)                       |
| `telegram`     | `auth`, `booking`, `notification` (service only)                |
| `search`       | `business` (repository via SearchRepository only)               |

---

## 9. Legacy migration map

Current flat modules → target feature modules:

| Legacy path     | Target               | Action                                    |
| --------------- | -------------------- | ----------------------------------------- |
| `src/auth/`     | `features/auth/`     | Move + add OTP, session, repository layer |
| `src/orders/`   | —                    | **Delete** (legacy ordering domain)       |
| `src/prisma/`   | `shared/database/`   | Move                                      |
| `src/health/`   | `shared/health/`     | Move + add Redis check                    |
| `src/queue/`    | `shared/queue/`      | Move + rename processors                  |
| `src/storage/`  | `shared/storage/`    | Keep                                      |
| `src/telegram/` | `features/telegram/` | Refactor to scenes/commands               |
| `src/config/`   | `shared/config/`     | Move + add env validation                 |

---

## Appendix — Module count summary

| Category          | Count                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| Feature modules   | 14                                                                          |
| Webhook module    | 1                                                                           |
| Shared submodules | 8 (config, database, guards, interceptors, filters, health, queue, storage) |
| Controllers       | ~45                                                                         |
| Services          | ~65                                                                         |
| Repositories      | ~45                                                                         |
| DTOs              | ~120                                                                        |
| Entity/Types      | ~40                                                                         |
| Guards            | 10                                                                          |
| Interceptors      | 3                                                                           |
| Filters           | 3                                                                           |
| Processors        | 8                                                                           |

---

_Aligned with `docs/API.md`, `backend/prisma/schema.prisma`, and `.cursor/rules/architecture.mdc`._

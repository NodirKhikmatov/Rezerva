# Rezerva REST API Specification

**Version:** 1.0  
**Base URL:** `https://api.rezerva.uz/v1`  
**Content-Type:** `application/json` (unless noted)  
**Locale header:** `Accept-Language: uz | ru | en` (optional; defaults to user profile locale or `uz`)

---

## Table of contents

1. [Conventions](#conventions)
2. [Authentication](#1-authentication)
3. [Users](#2-users)
4. [Businesses](#3-businesses)
5. [Venues](#4-venues)
6. [Services](#5-services)
7. [Bookings](#6-bookings)
8. [Payments](#7-payments)
9. [Reviews](#8-reviews)
10. [Notifications](#9-notifications)
11. [Admin](#10-admin)
12. [Appendix — Public discovery & system](#appendix--public-discovery--system)

---

## Conventions

### Authentication header

```
Authorization: Bearer <access_token>
```

Web clients may alternatively use an httpOnly session cookie (`rezerva_session`) containing the refresh token; access tokens remain short-lived (15 minutes).

### Pagination

List endpoints accept query parameters:

| Param   | Type    | Default | Rules                 |
| ------- | ------- | ------- | --------------------- |
| `page`  | integer | `1`     | Min 1                 |
| `limit` | integer | `20`    | Min 1, max 100        |
| `sort`  | string  | varies  | e.g. `createdAt:desc` |

Paginated response envelope:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Standard error shape

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "One or more fields are invalid",
  "details": [{ "field": "phone", "message": "Must be a valid E.164 number" }],
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Common HTTP status codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 400  | Validation or malformed request         |
| 401  | Missing or invalid credentials          |
| 403  | Authenticated but not permitted         |
| 404  | Resource not found or not visible       |
| 409  | Conflict (slot taken, duplicate entity) |
| 422  | Business rule violation                 |
| 429  | Rate limit exceeded                     |
| 503  | Dependency unavailable                  |

### Idempotency

Payment and booking confirm endpoints accept:

```
Idempotency-Key: <uuid-v4>
```

Duplicate keys within 24 hours return the original response without side effects.

### Roles

| Role           | Scope                                   |
| -------------- | --------------------------------------- |
| `consumer`     | Default authenticated user              |
| `owner`        | Full business control                   |
| `manager`      | Business operations, no payout settings |
| `receptionist` | Calendar, check-in, walk-in bookings    |
| `admin`        | Platform operations                     |

---

## 1. Authentication

### 1.1 Send phone OTP

|            |                  |
| ---------- | ---------------- |
| **Method** | `POST`           |
| **URL**    | `/auth/otp/send` |

**Authentication:** Public (rate limited)

**Request body:**

```json
{
  "phone": "+998901234567",
  "locale": "uz"
}
```

**Validation:**

| Field    | Rules                                            |
| -------- | ------------------------------------------------ |
| `phone`  | Required; E.164; normalized to Uzbekistan `+998` |
| `locale` | Optional; enum `uz`, `ru`, `en`                  |

**Response `202 Accepted`:**

```json
{
  "message": "OTP sent",
  "expiresInSeconds": 300,
  "retryAfterSeconds": 60
}
```

**Possible errors:**

| Code                  | HTTP | Condition                            |
| --------------------- | ---- | ------------------------------------ |
| `VALIDATION_ERROR`    | 400  | Invalid phone format                 |
| `RATE_LIMIT_EXCEEDED` | 429  | More than 3 sends per phone per hour |
| `SMS_PROVIDER_ERROR`  | 503  | SMS gateway failure                  |

---

### 1.2 Verify phone OTP

|            |                    |
| ---------- | ------------------ |
| **Method** | `POST`             |
| **URL**    | `/auth/otp/verify` |

**Authentication:** Public (rate limited)

**Request body:**

```json
{
  "phone": "+998901234567",
  "code": "482910"
}
```

**Validation:**

| Field   | Rules                      |
| ------- | -------------------------- |
| `phone` | Required; E.164            |
| `code`  | Required; exactly 6 digits |

**Response `200 OK`:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "rt_abc123...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "+998901234567",
    "firstName": null,
    "lastName": null,
    "locale": "uz",
    "role": "consumer",
    "isNewUser": true
  }
}
```

**Possible errors:**

| Code                  | HTTP | Condition                   |
| --------------------- | ---- | --------------------------- |
| `VALIDATION_ERROR`    | 400  | Invalid code format         |
| `OTP_INVALID`         | 401  | Wrong code                  |
| `OTP_EXPIRED`         | 401  | Code older than 5 minutes   |
| `OTP_MAX_ATTEMPTS`    | 429  | More than 5 failed attempts |
| `RATE_LIMIT_EXCEEDED` | 429  | Too many verify attempts    |

---

### 1.3 Telegram Login

|            |                  |
| ---------- | ---------------- |
| **Method** | `POST`           |
| **URL**    | `/auth/telegram` |

**Authentication:** Public

**Request body:**

```json
{
  "id": 123456789,
  "first_name": "Ali",
  "last_name": "Karimov",
  "username": "alik",
  "photo_url": "https://t.me/i/userpic/320/abc.jpg",
  "auth_date": 1719000000,
  "hash": "a1b2c3..."
}
```

**Validation:**

| Field               | Rules                                   |
| ------------------- | --------------------------------------- |
| All Telegram fields | Required per Telegram Login Widget spec |
| `hash`              | HMAC-SHA256 verified against bot token  |
| `auth_date`         | Must be within last 24 hours            |

**Response `200 OK`:** Same shape as [1.2 Verify phone OTP](#12-verify-phone-otp).

**Possible errors:**

| Code                    | HTTP | Condition                        |
| ----------------------- | ---- | -------------------------------- |
| `TELEGRAM_HASH_INVALID` | 401  | Hash verification failed         |
| `TELEGRAM_AUTH_EXPIRED` | 401  | `auth_date` older than 24h       |
| `BOT_NOT_CONFIGURED`    | 503  | Bot token missing in environment |

---

### 1.4 Telegram Mini App auth

|            |                           |
| ---------- | ------------------------- |
| **Method** | `POST`                    |
| **URL**    | `/auth/telegram/mini-app` |

**Authentication:** Public

**Request body:**

```json
{
  "initData": "query_id=...&user=...&auth_date=...&hash=..."
}
```

**Validation:**

| Field      | Rules                                           |
| ---------- | ----------------------------------------------- |
| `initData` | Required; validated per Telegram Mini Apps spec |

**Response `200 OK`:** Same token envelope as [1.2](#12-verify-phone-otp).

**Possible errors:**

| Code                         | HTTP | Condition                    |
| ---------------------------- | ---- | ---------------------------- |
| `TELEGRAM_INIT_DATA_INVALID` | 401  | Invalid or tampered initData |
| `TELEGRAM_AUTH_EXPIRED`      | 401  | Expired auth_date            |

---

### 1.5 Refresh access token

|            |                 |
| ---------- | --------------- |
| **Method** | `POST`          |
| **URL**    | `/auth/refresh` |

**Authentication:** Refresh token (body or httpOnly cookie)

**Request body:**

```json
{
  "refreshToken": "rt_abc123..."
}
```

**Validation:**

| Field          | Rules                           |
| -------------- | ------------------------------- |
| `refreshToken` | Required if not sent via cookie |

**Response `200 OK`:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "rt_new456...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

**Possible errors:**

| Code                    | HTTP | Condition                          |
| ----------------------- | ---- | ---------------------------------- |
| `REFRESH_TOKEN_INVALID` | 401  | Unknown token                      |
| `REFRESH_TOKEN_REUSED`  | 401  | Rotation detected; session revoked |
| `SESSION_REVOKED`       | 401  | User logged out globally           |

---

### 1.6 Logout

|            |                |
| ---------- | -------------- |
| **Method** | `POST`         |
| **URL**    | `/auth/logout` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "refreshToken": "rt_abc123...",
  "allDevices": false
}
```

**Validation:**

| Field          | Rules                             |
| -------------- | --------------------------------- |
| `refreshToken` | Required unless cookie session    |
| `allDevices`   | Optional boolean; default `false` |

**Response `204 No Content`**

**Possible errors:**

| Code           | HTTP | Condition            |
| -------------- | ---- | -------------------- |
| `UNAUTHORIZED` | 401  | Invalid access token |

---

### 1.7 List active sessions

|            |                  |
| ---------- | ---------------- |
| **Method** | `GET`            |
| **URL**    | `/auth/sessions` |

**Authentication:** Bearer access token

**Request body:** None

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "session-uuid",
      "deviceLabel": "Chrome on macOS",
      "ipAddress": "203.0.113.10",
      "lastActiveAt": "2026-06-22T10:00:00Z",
      "createdAt": "2026-06-01T08:00:00Z",
      "isCurrent": true
    }
  ]
}
```

**Possible errors:**

| Code           | HTTP | Condition     |
| -------------- | ---- | ------------- |
| `UNAUTHORIZED` | 401  | Invalid token |

---

### 1.8 Revoke session

|            |                             |
| ---------- | --------------------------- |
| **Method** | `DELETE`                    |
| **URL**    | `/auth/sessions/:sessionId` |

**Authentication:** Bearer access token

**Request body:** None

**Response `204 No Content`**

**Possible errors:**

| Code           | HTTP | Condition                      |
| -------------- | ---- | ------------------------------ |
| `NOT_FOUND`    | 404  | Session not found or not owned |
| `UNAUTHORIZED` | 401  | Invalid token                  |

---

## 2. Users

### 2.1 Get current user profile

|            |             |
| ---------- | ----------- |
| **Method** | `GET`       |
| **URL**    | `/users/me` |

**Authentication:** Bearer access token

**Request body:** None

**Response `200 OK`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone": "+998901234567",
  "email": null,
  "firstName": "Ali",
  "lastName": "Karimov",
  "photoUrl": "https://cdn.rezerva.uz/avatars/abc.jpg",
  "locale": "uz",
  "role": "consumer",
  "identities": [
    { "provider": "phone", "providerId": "+998901234567" },
    { "provider": "telegram", "providerId": "123456789" }
  ],
  "createdAt": "2026-01-15T08:00:00Z",
  "updatedAt": "2026-06-20T12:00:00Z"
}
```

**Possible errors:**

| Code           | HTTP | Condition     |
| -------------- | ---- | ------------- |
| `UNAUTHORIZED` | 401  | Invalid token |

---

### 2.2 Update current user profile

|            |             |
| ---------- | ----------- |
| **Method** | `PATCH`     |
| **URL**    | `/users/me` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "firstName": "Ali",
  "lastName": "Karimov",
  "email": "ali@example.com",
  "locale": "ru"
}
```

**Validation:**

| Field       | Rules                                       |
| ----------- | ------------------------------------------- |
| `firstName` | Optional; 1–100 chars; trimmed              |
| `lastName`  | Optional; 1–100 chars; trimmed              |
| `email`     | Optional; valid email; unique platform-wide |
| `locale`    | Optional; enum `uz`, `ru`, `en`             |

**Response `200 OK`:** Updated user object (same shape as [2.1](#21-get-current-user-profile)).

**Possible errors:**

| Code                   | HTTP | Condition            |
| ---------------------- | ---- | -------------------- |
| `VALIDATION_ERROR`     | 400  | Invalid field values |
| `EMAIL_ALREADY_IN_USE` | 409  | Email taken          |

---

### 2.3 List user addresses

|            |                       |
| ---------- | --------------------- |
| **Method** | `GET`                 |
| **URL**    | `/users/me/addresses` |

**Authentication:** Bearer access token

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "addr-uuid",
      "label": "Home",
      "districtId": "district-uuid",
      "districtName": "Yunusabad",
      "regionId": "region-uuid",
      "street": "Amir Temur 15",
      "building": "42",
      "apartment": "7",
      "latitude": 41.311081,
      "longitude": 69.240562,
      "isDefault": true,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ]
}
```

**Possible errors:**

| Code           | HTTP | Condition     |
| -------------- | ---- | ------------- |
| `UNAUTHORIZED` | 401  | Invalid token |

---

### 2.4 Create address

|            |                       |
| ---------- | --------------------- |
| **Method** | `POST`                |
| **URL**    | `/users/me/addresses` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "label": "Home",
  "districtId": "district-uuid",
  "street": "Amir Temur 15",
  "building": "42",
  "apartment": "7",
  "latitude": 41.311081,
  "longitude": 69.240562,
  "isDefault": true
}
```

**Validation:**

| Field                    | Rules                       |
| ------------------------ | --------------------------- |
| `districtId`             | Required; must exist        |
| `street`                 | Required; 1–200 chars       |
| `building`               | Optional; max 20 chars      |
| `apartment`              | Optional; max 20 chars      |
| `latitude` / `longitude` | Optional; valid coordinates |
| `isDefault`              | Optional boolean            |

**Response `201 Created`:** Address object.

**Possible errors:**

| Code                 | HTTP | Condition        |
| -------------------- | ---- | ---------------- |
| `VALIDATION_ERROR`   | 400  | Invalid fields   |
| `DISTRICT_NOT_FOUND` | 404  | Unknown district |

---

### 2.5 Update address

|            |                                  |
| ---------- | -------------------------------- |
| **Method** | `PATCH`                          |
| **URL**    | `/users/me/addresses/:addressId` |

**Authentication:** Bearer access token (must own address)

**Request body:** Partial address fields (same validation as create).

**Response `200 OK`:** Updated address object.

**Possible errors:**

| Code        | HTTP | Condition         |
| ----------- | ---- | ----------------- |
| `NOT_FOUND` | 404  | Address not found |

---

### 2.6 Delete address

|            |                                  |
| ---------- | -------------------------------- |
| **Method** | `DELETE`                         |
| **URL**    | `/users/me/addresses/:addressId` |

**Authentication:** Bearer access token

**Response `204 No Content`**

**Possible errors:**

| Code        | HTTP | Condition         |
| ----------- | ---- | ----------------- |
| `NOT_FOUND` | 404  | Address not found |

---

### 2.7 List favorites

|            |                       |
| ---------- | --------------------- |
| **Method** | `GET`                 |
| **URL**    | `/users/me/favorites` |

**Authentication:** Bearer access token

**Query:** `page`, `limit`

**Response `200 OK`:**

```json
{
  "data": [
    {
      "businessId": "biz-uuid",
      "slug": "arena-football",
      "name": "Arena Football",
      "category": "football",
      "coverImageUrl": "https://cdn.rezerva.uz/...",
      "averageRating": 4.7,
      "reviewCount": 128,
      "districtName": "Chilanzar",
      "favoritedAt": "2026-06-10T14:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### 2.8 Add favorite

|            |                                   |
| ---------- | --------------------------------- |
| **Method** | `POST`                            |
| **URL**    | `/users/me/favorites/:businessId` |

**Authentication:** Bearer access token

**Request body:** None

**Response `201 Created`:**

```json
{
  "businessId": "biz-uuid",
  "favoritedAt": "2026-06-22T10:00:00Z"
}
```

**Possible errors:**

| Code                 | HTTP | Condition                           |
| -------------------- | ---- | ----------------------------------- |
| `BUSINESS_NOT_FOUND` | 404  | Business inactive or missing        |
| `ALREADY_FAVORITED`  | 409  | Idempotent — returns existing (200) |

---

### 2.9 Remove favorite

|            |                                   |
| ---------- | --------------------------------- |
| **Method** | `DELETE`                          |
| **URL**    | `/users/me/favorites/:businessId` |

**Authentication:** Bearer access token

**Response `204 No Content`**

---

### 2.10 Get notification preferences

|            |                                      |
| ---------- | ------------------------------------ |
| **Method** | `GET`                                |
| **URL**    | `/users/me/notification-preferences` |

**Authentication:** Bearer access token

**Response `200 OK`:**

```json
{
  "smsEnabled": true,
  "telegramEnabled": true,
  "pushEnabled": false,
  "bookingConfirmations": true,
  "bookingReminders": true,
  "promotions": false
}
```

---

### 2.11 Update notification preferences

|            |                                      |
| ---------- | ------------------------------------ |
| **Method** | `PATCH`                              |
| **URL**    | `/users/me/notification-preferences` |

**Authentication:** Bearer access token

**Request body:** Partial preference booleans.

**Response `200 OK`:** Updated preferences object.

---

## 3. Businesses

### 3.1 Search businesses (public)

|            |               |
| ---------- | ------------- |
| **Method** | `GET`         |
| **URL**    | `/businesses` |

**Authentication:** Public

**Query parameters:**

| Param                               | Rules                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `category`                          | Optional; enum `football`, `salon`, `restaurant`, `clinic`, `coworking`, `hotel` |
| `cityId`                            | Optional UUID                                                                    |
| `districtId`                        | Optional UUID                                                                    |
| `q`                                 | Optional; full-text search, max 100 chars                                        |
| `minRating`                         | Optional; 1–5                                                                    |
| `latitude`, `longitude`, `radiusKm` | Optional; geo filter                                                             |
| `page`, `limit`, `sort`             | Pagination                                                                       |

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "biz-uuid",
      "slug": "arena-football",
      "name": "Arena Football",
      "category": "football",
      "status": "active",
      "coverImageUrl": "https://cdn.rezerva.uz/...",
      "averageRating": 4.7,
      "reviewCount": 128,
      "districtName": "Chilanzar",
      "cityName": "Tashkent",
      "priceFrom": 150000,
      "currency": "UZS",
      "isFeatured": false
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

---

### 3.2 Get business by slug (public)

|            |                          |
| ---------- | ------------------------ |
| **Method** | `GET`                    |
| **URL**    | `/businesses/slug/:slug` |

**Authentication:** Public

**Response `200 OK`:**

```json
{
  "id": "biz-uuid",
  "slug": "arena-football",
  "name": "Arena Football",
  "description": "Premium football fields in Tashkent",
  "category": "football",
  "status": "active",
  "phone": "+998712345678",
  "averageRating": 4.7,
  "reviewCount": 128,
  "coverImageUrl": "https://cdn.rezerva.uz/...",
  "gallery": [
    {
      "id": "media-uuid",
      "url": "https://...",
      "isCover": true,
      "sortOrder": 0
    }
  ],
  "venues": [
    {
      "id": "venue-uuid",
      "name": "Main Branch",
      "address": "Chilanzar 9, Tashkent",
      "latitude": 41.2856,
      "longitude": 69.2034
    }
  ],
  "servicesSummary": [
    {
      "id": "svc-uuid",
      "name": "2-hour pitch rental",
      "durationMinutes": 120,
      "priceFrom": 300000
    }
  ],
  "policies": {
    "cancellationHoursBefore": 24,
    "cancellationFeePercent": 50,
    "depositPercent": 30,
    "requiresApproval": false
  },
  "workingHoursSummary": "Mon–Sun 08:00–23:00"
}
```

**Possible errors:**

| Code        | HTTP | Condition                             |
| ----------- | ---- | ------------------------------------- |
| `NOT_FOUND` | 404  | Slug not found or business not active |

---

### 3.3 Register business

|            |               |
| ---------- | ------------- |
| **Method** | `POST`        |
| **URL**    | `/businesses` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "name": "Arena Football",
  "category": "football",
  "phone": "+998712345678",
  "description": "Premium football fields"
}
```

**Validation:**

| Field         | Rules                                 |
| ------------- | ------------------------------------- |
| `name`        | Required; 2–150 chars                 |
| `category`    | Required; valid BusinessCategory enum |
| `phone`       | Required; E.164                       |
| `description` | Optional; max 2000 chars              |

**Response `201 Created`:**

```json
{
  "id": "biz-uuid",
  "slug": "arena-football",
  "name": "Arena Football",
  "category": "football",
  "status": "draft",
  "ownerId": "user-uuid",
  "onboardingStep": "profile",
  "createdAt": "2026-06-22T10:00:00Z"
}
```

**Possible errors:**

| Code                     | HTTP | Condition                 |
| ------------------------ | ---- | ------------------------- |
| `VALIDATION_ERROR`       | 400  | Invalid fields            |
| `CATEGORY_NOT_SUPPORTED` | 422  | Category not yet launched |

---

### 3.4 List my businesses

|            |                  |
| ---------- | ---------------- |
| **Method** | `GET`            |
| **URL**    | `/businesses/me` |

**Authentication:** Bearer access token

**Response `200 OK`:** Paginated list of businesses where user is a member.

---

### 3.5 Get business (member)

|            |                           |
| ---------- | ------------------------- |
| **Method** | `GET`                     |
| **URL**    | `/businesses/:businessId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`, `receptionist`)

**Response `200 OK`:** Full business object including onboarding progress, verification status, internal notes.

---

### 3.6 Update business profile

|            |                           |
| ---------- | ------------------------- |
| **Method** | `PATCH`                   |
| **URL**    | `/businesses/:businessId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:**

```json
{
  "name": "Arena Football Club",
  "description": "Updated description",
  "phone": "+998712345678",
  "email": "info@arena.uz",
  "website": "https://arena.uz"
}
```

**Validation:** Standard string/email/URL rules.

**Response `200 OK`:** Updated business object.

**Possible errors:**

| Code              | HTTP | Condition                              |
| ----------------- | ---- | -------------------------------------- |
| `FORBIDDEN`       | 403  | Insufficient role                      |
| `BUSINESS_LOCKED` | 422  | Cannot edit while pending verification |

---

### 3.7 Get onboarding progress

|            |                                      |
| ---------- | ------------------------------------ |
| **Method** | `GET`                                |
| **URL**    | `/businesses/:businessId/onboarding` |

**Authentication:** Bearer + BusinessMember

**Response `200 OK`:**

```json
{
  "currentStep": "resources",
  "completedSteps": ["category", "profile", "location"],
  "steps": [
    { "id": "category", "status": "completed" },
    { "id": "profile", "status": "completed" },
    { "id": "location", "status": "completed" },
    { "id": "resources", "status": "in_progress" },
    { "id": "services", "status": "pending" },
    { "id": "hours", "status": "pending" },
    { "id": "policies", "status": "pending" },
    { "id": "verification", "status": "pending" }
  ],
  "canSubmit": false
}
```

---

### 3.8 Advance onboarding step

|            |                                              |
| ---------- | -------------------------------------------- |
| **Method** | `PATCH`                                      |
| **URL**    | `/businesses/:businessId/onboarding/:stepId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:** Step-specific payload (validated per step).

Example for `policies` step:

```json
{
  "cancellationHoursBefore": 24,
  "cancellationFeePercent": 50,
  "depositPercent": 30,
  "requiresApproval": false,
  "noShowFeePercent": 100
}
```

**Response `200 OK`:** Updated onboarding progress.

**Possible errors:**

| Code                      | HTTP | Condition             |
| ------------------------- | ---- | --------------------- |
| `ONBOARDING_STEP_INVALID` | 422  | Prerequisites not met |
| `VALIDATION_ERROR`        | 400  | Step payload invalid  |

---

### 3.9 Submit for verification

|            |                                             |
| ---------- | ------------------------------------------- |
| **Method** | `POST`                                      |
| **URL**    | `/businesses/:businessId/onboarding/submit` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Request body:**

```json
{
  "documents": [{ "type": "business_license", "mediaId": "media-uuid" }],
  "notes": "Optional message to verifier"
}
```

**Response `200 OK`:**

```json
{
  "status": "pending_verification",
  "submittedAt": "2026-06-22T10:00:00Z"
}
```

**Possible errors:**

| Code                    | HTTP | Condition                   |
| ----------------------- | ---- | --------------------------- |
| `ONBOARDING_INCOMPLETE` | 422  | Required steps not finished |

---

### 3.10 List business members

|            |                                   |
| ---------- | --------------------------------- |
| **Method** | `GET`                             |
| **URL**    | `/businesses/:businessId/members` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "firstName": "Sardor",
      "lastName": "Aliyev",
      "role": "manager",
      "invitedAt": "2026-05-01T10:00:00Z",
      "acceptedAt": "2026-05-02T08:00:00Z"
    }
  ]
}
```

---

### 3.11 Invite staff member

|            |                                          |
| ---------- | ---------------------------------------- |
| **Method** | `POST`                                   |
| **URL**    | `/businesses/:businessId/members/invite` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Request body:**

```json
{
  "phone": "+998909876543",
  "role": "receptionist"
}
```

**Validation:**

| Field   | Rules                                                  |
| ------- | ------------------------------------------------------ |
| `phone` | Required; E.164                                        |
| `role`  | Required; enum `manager`, `receptionist` (not `owner`) |

**Response `201 Created`:** Invitation object with `status: pending`.

**Possible errors:**

| Code                    | HTTP | Condition             |
| ----------------------- | ---- | --------------------- |
| `MEMBER_ALREADY_EXISTS` | 409  | User already a member |
| `FORBIDDEN`             | 403  | Only owner can invite |

---

### 3.12 Update member role

|            |                                             |
| ---------- | ------------------------------------------- |
| **Method** | `PATCH`                                     |
| **URL**    | `/businesses/:businessId/members/:memberId` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Request body:** `{ "role": "manager" }`

**Response `200 OK`:** Updated member.

---

### 3.13 Remove member

|            |                                             |
| ---------- | ------------------------------------------- |
| **Method** | `DELETE`                                    |
| **URL**    | `/businesses/:businessId/members/:memberId` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Response `204 No Content`**

---

### 3.14 Request media upload URL

|            |                                            |
| ---------- | ------------------------------------------ |
| **Method** | `POST`                                     |
| **URL**    | `/businesses/:businessId/media/upload-url` |

**Authentication:** Bearer + BusinessMember

**Request body:**

```json
{
  "filename": "cover.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 2048000
}
```

**Validation:**

| Field       | Rules                                                      |
| ----------- | ---------------------------------------------------------- |
| `mimeType`  | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |
| `sizeBytes` | Max 5 MB images; 10 MB documents                           |

**Response `200 OK`:**

```json
{
  "uploadUrl": "https://supabase.../signed-url",
  "mediaId": "media-uuid",
  "expiresAt": "2026-06-22T10:15:00Z"
}
```

---

### 3.15 Confirm media upload

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `POST`                                  |
| **URL**    | `/businesses/:businessId/media/confirm` |

**Authentication:** Bearer + BusinessMember

**Request body:**

```json
{
  "mediaId": "media-uuid",
  "isCover": true,
  "sortOrder": 0
}
```

**Response `201 Created`:** Media record.

---

### 3.16 Delete media

|            |                                          |
| ---------- | ---------------------------------------- |
| **Method** | `DELETE`                                 |
| **URL**    | `/businesses/:businessId/media/:mediaId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Response `204 No Content`**

---

### 3.17 Get business analytics

|            |                                     |
| ---------- | ----------------------------------- |
| **Method** | `GET`                               |
| **URL**    | `/businesses/:businessId/analytics` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Query:** `from` (ISO date), `to` (ISO date), default last 30 days.

**Response `200 OK`:**

```json
{
  "period": { "from": "2026-05-23", "to": "2026-06-22" },
  "bookingsCount": 342,
  "completedCount": 310,
  "cancelledCount": 22,
  "noShowCount": 10,
  "revenueTotal": 98500000,
  "currency": "UZS",
  "cancellationRate": 0.064,
  "peakHours": [
    { "hour": 18, "bookings": 45 },
    { "hour": 19, "bookings": 52 }
  ]
}
```

---

### 3.18 List business payouts

|            |                                   |
| ---------- | --------------------------------- |
| **Method** | `GET`                             |
| **URL**    | `/businesses/:businessId/payouts` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Response `200 OK`:** Paginated payout summaries with commission breakdown.

---

## 4. Venues

> A **venue** is a physical location (`business_location`) belonging to a business. Bookable units (pitches, chairs, tables, rooms) are **resources** nested under venues.

### 4.1 List venues (public)

|            |                                  |
| ---------- | -------------------------------- |
| **Method** | `GET`                            |
| **URL**    | `/businesses/:businessId/venues` |

**Authentication:** Public (active businesses only)

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "venue-uuid",
      "name": "Main Branch",
      "addressLine": "Chilanzar 9",
      "districtName": "Chilanzar",
      "cityName": "Tashkent",
      "latitude": 41.2856,
      "longitude": 69.2034,
      "phone": "+998712345678",
      "isPrimary": true,
      "resourceCount": 3
    }
  ]
}
```

---

### 4.2 Get venue (public)

|            |                    |
| ---------- | ------------------ |
| **Method** | `GET`              |
| **URL**    | `/venues/:venueId` |

**Authentication:** Public

**Response `200 OK`:**

```json
{
  "id": "venue-uuid",
  "businessId": "biz-uuid",
  "businessSlug": "arena-football",
  "name": "Main Branch",
  "addressLine": "Chilanzar 9",
  "districtId": "district-uuid",
  "latitude": 41.2856,
  "longitude": 69.2034,
  "phone": "+998712345678",
  "workingHours": [
    {
      "dayOfWeek": 1,
      "openTime": "08:00",
      "closeTime": "23:00",
      "isClosed": false
    }
  ],
  "resources": [
    {
      "id": "resource-uuid",
      "name": "Pitch A",
      "type": "football_pitch",
      "capacity": 14,
      "surfaceType": "artificial_turf"
    }
  ]
}
```

---

### 4.3 Create venue

|            |                                  |
| ---------- | -------------------------------- |
| **Method** | `POST`                           |
| **URL**    | `/businesses/:businessId/venues` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:**

```json
{
  "name": "Second Branch",
  "districtId": "district-uuid",
  "addressLine": "Yunusabad 12",
  "latitude": 41.311081,
  "longitude": 69.240562,
  "phone": "+998712345679",
  "isPrimary": false
}
```

**Validation:**

| Field                    | Rules                   |
| ------------------------ | ----------------------- |
| `name`                   | Required; 2–150 chars   |
| `districtId`             | Required; valid UUID    |
| `addressLine`            | Required; max 300 chars |
| `latitude` / `longitude` | Required; valid range   |

**Response `201 Created`:** Venue object.

---

### 4.4 Update venue

|            |                                           |
| ---------- | ----------------------------------------- |
| **Method** | `PATCH`                                   |
| **URL**    | `/businesses/:businessId/venues/:venueId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:** Partial venue fields.

**Response `200 OK`:** Updated venue.

---

### 4.5 Delete venue

|            |                                           |
| ---------- | ----------------------------------------- |
| **Method** | `DELETE`                                  |
| **URL**    | `/businesses/:businessId/venues/:venueId` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Response `204 No Content`**

**Possible errors:**

| Code                        | HTTP | Condition                            |
| --------------------------- | ---- | ------------------------------------ |
| `VENUE_HAS_FUTURE_BOOKINGS` | 422  | Cannot delete with upcoming bookings |

---

### 4.6 Set venue working hours

|            |                                                         |
| ---------- | ------------------------------------------------------- |
| **Method** | `PUT`                                                   |
| **URL**    | `/businesses/:businessId/venues/:venueId/working-hours` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:**

```json
{
  "hours": [
    {
      "dayOfWeek": 1,
      "openTime": "08:00",
      "closeTime": "23:00",
      "isClosed": false
    },
    { "dayOfWeek": 0, "isClosed": true }
  ]
}
```

**Validation:**

| Field                    | Rules                                               |
| ------------------------ | --------------------------------------------------- |
| `dayOfWeek`              | 0–6 (Sun–Sat); one entry per day                    |
| `openTime` / `closeTime` | `HH:mm` 24h; `closeTime` > `openTime` unless closed |

**Response `200 OK`:** Updated hours array.

---

### 4.7 Add blocked date

|            |                                                         |
| ---------- | ------------------------------------------------------- |
| **Method** | `POST`                                                  |
| **URL**    | `/businesses/:businessId/venues/:venueId/blocked-dates` |

**Authentication:** Bearer + BusinessMember

**Request body:**

```json
{
  "date": "2026-12-31",
  "reason": "New Year closure"
}
```

**Response `201 Created`:** Blocked date record.

---

### 4.8 Remove blocked date

|            |                                                                        |
| ---------- | ---------------------------------------------------------------------- |
| **Method** | `DELETE`                                                               |
| **URL**    | `/businesses/:businessId/venues/:venueId/blocked-dates/:blockedDateId` |

**Authentication:** Bearer + BusinessMember

**Response `204 No Content`**

---

### 4.9 List resources at venue

|            |                              |
| ---------- | ---------------------------- |
| **Method** | `GET`                        |
| **URL**    | `/venues/:venueId/resources` |

**Authentication:** Public

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "resource-uuid",
      "name": "Pitch A",
      "type": "football_pitch",
      "status": "active",
      "capacity": 14,
      "metadata": {
        "surfaceType": "artificial_turf",
        "dimensions": "40x20m",
        "lighting": true
      }
    }
  ]
}
```

---

### 4.10 Create resource

|            |                                                     |
| ---------- | --------------------------------------------------- |
| **Method** | `POST`                                              |
| **URL**    | `/businesses/:businessId/venues/:venueId/resources` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:**

```json
{
  "name": "Pitch B",
  "type": "football_pitch",
  "capacity": 14,
  "metadata": {
    "surfaceType": "natural_grass",
    "dimensions": "40x20m"
  }
}
```

**Validation:**

| Field      | Rules                                          |
| ---------- | ---------------------------------------------- |
| `name`     | Required; 2–100 chars                          |
| `type`     | Required; category-specific resource type enum |
| `metadata` | Validated per category schema                  |

**Response `201 Created`:** Resource object.

---

### 4.11 Update resource

|            |                                                 |
| ---------- | ----------------------------------------------- |
| **Method** | `PATCH`                                         |
| **URL**    | `/businesses/:businessId/resources/:resourceId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Response `200 OK`:** Updated resource.

---

### 4.12 Delete resource

|            |                                                 |
| ---------- | ----------------------------------------------- |
| **Method** | `DELETE`                                        |
| **URL**    | `/businesses/:businessId/resources/:resourceId` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Possible errors:**

| Code                           | HTTP | Condition                  |
| ------------------------------ | ---- | -------------------------- |
| `RESOURCE_HAS_FUTURE_BOOKINGS` | 422  | Upcoming allocations exist |

---

### 4.13 Block resource time slot

|            |                                                               |
| ---------- | ------------------------------------------------------------- |
| **Method** | `POST`                                                        |
| **URL**    | `/businesses/:businessId/resources/:resourceId/blocked-slots` |

**Authentication:** Bearer + BusinessMember

**Request body:**

```json
{
  "startsAt": "2026-06-25T14:00:00+05:00",
  "endsAt": "2026-06-25T16:00:00+05:00",
  "reason": "Maintenance"
}
```

**Validation:** `endsAt` > `startsAt`; no overlap with existing bookings.

**Response `201 Created`:** Blocked slot record.

---

## 5. Services

### 5.1 List services (public)

|            |                                    |
| ---------- | ---------------------------------- |
| **Method** | `GET`                              |
| **URL**    | `/businesses/:businessId/services` |

**Authentication:** Public

**Query:** `venueId` (optional filter)

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "svc-uuid",
      "name": "2-hour pitch rental",
      "description": "Full pitch for 2 hours",
      "durationMinutes": 120,
      "price": 300000,
      "currency": "UZS",
      "pricingModel": "fixed",
      "isActive": true,
      "resourceIds": ["resource-uuid"],
      "venueId": "venue-uuid"
    }
  ]
}
```

---

### 5.2 Get service (public)

|            |                        |
| ---------- | ---------------------- |
| **Method** | `GET`                  |
| **URL**    | `/services/:serviceId` |

**Authentication:** Public

**Response `200 OK`:** Full service with linked resources and pricing rules.

---

### 5.3 Create service

|            |                                    |
| ---------- | ---------------------------------- |
| **Method** | `POST`                             |
| **URL**    | `/businesses/:businessId/services` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:**

```json
{
  "venueId": "venue-uuid",
  "name": "2-hour pitch rental",
  "description": "Full pitch rental",
  "durationMinutes": 120,
  "price": 300000,
  "currency": "UZS",
  "pricingModel": "fixed",
  "resourceIds": ["resource-uuid"],
  "maxPartySize": 14
}
```

**Validation:**

| Field             | Rules                                            |
| ----------------- | ------------------------------------------------ |
| `name`            | Required; 2–150 chars                            |
| `durationMinutes` | Required; min 15; max 10080 (7 days)             |
| `price`           | Required; positive integer (tiyin/smallest unit) |
| `resourceIds`     | Required; min 1; all belong to venue             |
| `pricingModel`    | enum `fixed`, `hourly`, `per_night`, `per_guest` |

**Response `201 Created`:** Service object.

---

### 5.4 Update service

|            |                                               |
| ---------- | --------------------------------------------- |
| **Method** | `PATCH`                                       |
| **URL**    | `/businesses/:businessId/services/:serviceId` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Response `200 OK`:** Updated service.

---

### 5.5 Delete service

|            |                                               |
| ---------- | --------------------------------------------- |
| **Method** | `DELETE`                                      |
| **URL**    | `/businesses/:businessId/services/:serviceId` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Response `204 No Content`** (soft delete)

---

### 5.6 Get availability slots

|            |                                        |
| ---------- | -------------------------------------- |
| **Method** | `GET`                                  |
| **URL**    | `/businesses/:businessId/availability` |

**Authentication:** Public

**Query parameters:**

| Param        | Rules                                   |
| ------------ | --------------------------------------- |
| `serviceId`  | Required UUID                           |
| `resourceId` | Optional; auto-assign if omitted        |
| `from`       | Required ISO date `YYYY-MM-DD`          |
| `to`         | Required; max 14-day range              |
| `partySize`  | Optional; required for restaurant/hotel |

**Response `200 OK`:**

```json
{
  "serviceId": "svc-uuid",
  "timezone": "Asia/Tashkent",
  "slots": [
    {
      "startsAt": "2026-06-25T18:00:00+05:00",
      "endsAt": "2026-06-25T20:00:00+05:00",
      "resourceId": "resource-uuid",
      "resourceName": "Pitch A",
      "price": 300000,
      "currency": "UZS",
      "available": true
    }
  ]
}
```

**Possible errors:**

| Code                 | HTTP | Condition                                    |
| -------------------- | ---- | -------------------------------------------- |
| `NO_SLOTS_AVAILABLE` | 200  | Empty `slots` array with message code `E-15` |
| `INVALID_DATE_RANGE` | 400  | Range exceeds 14 days                        |

---

## 6. Bookings

### Booking status flow

```
hold → pending_payment → confirmed → checked_in → completed
                      ↘ cancelled
                      ↘ no_show
```

### 6.1 Create slot hold

|            |                   |
| ---------- | ----------------- |
| **Method** | `POST`            |
| **URL**    | `/bookings/holds` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "businessId": "biz-uuid",
  "serviceId": "svc-uuid",
  "resourceId": "resource-uuid",
  "startsAt": "2026-06-25T18:00:00+05:00",
  "endsAt": "2026-06-25T20:00:00+05:00",
  "partySize": 10
}
```

**Validation:**

| Field                 | Rules                                          |
| --------------------- | ---------------------------------------------- |
| `serviceId`           | Required; active service                       |
| `resourceId`          | Required unless auto-assign                    |
| `startsAt` / `endsAt` | Required; must match service duration          |
| `partySize`           | Required for restaurant; within service limits |

**Response `201 Created`:**

```json
{
  "holdId": "hold-uuid",
  "expiresAt": "2026-06-22T10:10:00Z",
  "expiresInSeconds": 600,
  "serviceId": "svc-uuid",
  "resourceId": "resource-uuid",
  "startsAt": "2026-06-25T18:00:00+05:00",
  "endsAt": "2026-06-25T20:00:00+05:00",
  "price": 300000,
  "currency": "UZS",
  "depositAmount": 90000
}
```

**Possible errors:**

| Code                    | HTTP | Condition                   |
| ----------------------- | ---- | --------------------------- |
| `SLOT_UNAVAILABLE`      | 409  | Slot taken (`ER-08`)        |
| `HOLD_LIMIT_EXCEEDED`   | 422  | User has max 3 active holds |
| `BUSINESS_NOT_BOOKABLE` | 422  | Business not active         |

---

### 6.2 Release hold

|            |                           |
| ---------- | ------------------------- |
| **Method** | `DELETE`                  |
| **URL**    | `/bookings/holds/:holdId` |

**Authentication:** Bearer (must own hold)

**Response `204 No Content`**

---

### 6.3 Confirm booking (pay at venue)

|            |             |
| ---------- | ----------- |
| **Method** | `POST`      |
| **URL**    | `/bookings` |

**Authentication:** Bearer access token

**Headers:** `Idempotency-Key` (recommended)

**Request body:**

```json
{
  "holdId": "hold-uuid",
  "paymentMethod": "pay_at_venue",
  "notes": "Birthday party",
  "participants": [{ "name": "Ali", "phone": "+998901234567" }],
  "intakeResponses": []
}
```

**Validation:**

| Field             | Rules                          |
| ----------------- | ------------------------------ |
| `holdId`          | Required; valid unexpired hold |
| `paymentMethod`   | `pay_at_venue` or `online`     |
| `intakeResponses` | Required for clinic category   |

**Response `201 Created`:**

```json
{
  "id": "booking-uuid",
  "referenceCode": "RZ-2026-004821",
  "status": "confirmed",
  "businessId": "biz-uuid",
  "businessName": "Arena Football",
  "venueId": "venue-uuid",
  "serviceId": "svc-uuid",
  "resourceId": "resource-uuid",
  "startsAt": "2026-06-25T18:00:00+05:00",
  "endsAt": "2026-06-25T20:00:00+05:00",
  "totalAmount": 300000,
  "depositAmount": 0,
  "currency": "UZS",
  "paymentMethod": "pay_at_venue",
  "policySnapshot": {
    "cancellationHoursBefore": 24,
    "cancellationFeePercent": 50
  },
  "qrCodeUrl": "https://api.rezerva.uz/v1/bookings/RZ-2026-004821/qr",
  "createdAt": "2026-06-22T10:00:00Z"
}
```

**Possible errors:**

| Code               | HTTP | Condition                           |
| ------------------ | ---- | ----------------------------------- |
| `HOLD_EXPIRED`     | 422  | Hold TTL exceeded (`ER-09`)         |
| `SLOT_UNAVAILABLE` | 409  | Concurrent booking won slot         |
| `PAYMENT_REQUIRED` | 422  | Online payment required for deposit |

---

### 6.4 Confirm booking with online payment

|            |             |
| ---------- | ----------- |
| **Method** | `POST`      |
| **URL**    | `/bookings` |

Same as [6.3](#63-confirm-booking-pay-at-venue) with `"paymentMethod": "online"`.

**Response `201 Created`:** Booking with `"status": "pending_payment"` and nested payment redirect info (see [7.3](#73-initiate-payment)).

---

### 6.5 List my bookings

|            |                |
| ---------- | -------------- |
| **Method** | `GET`          |
| **URL**    | `/bookings/me` |

**Authentication:** Bearer access token

**Query:** `status` (upcoming|past|cancelled), `page`, `limit`

**Response `200 OK`:** Paginated booking summaries.

---

### 6.6 Get booking detail

|            |                        |
| ---------- | ---------------------- |
| **Method** | `GET`                  |
| **URL**    | `/bookings/:bookingId` |

**Authentication:** Bearer (consumer owner OR business member OR admin)

**Response `200 OK`:**

```json
{
  "id": "booking-uuid",
  "referenceCode": "RZ-2026-004821",
  "status": "confirmed",
  "timeline": [
    { "status": "confirmed", "at": "2026-06-22T10:00:00Z", "actor": "system" }
  ],
  "business": {
    "id": "biz-uuid",
    "name": "Arena Football",
    "slug": "arena-football"
  },
  "venue": {
    "id": "venue-uuid",
    "name": "Main Branch",
    "addressLine": "Chilanzar 9"
  },
  "lineItems": [
    {
      "serviceId": "svc-uuid",
      "name": "2-hour pitch rental",
      "durationMinutes": 120,
      "price": 300000
    }
  ],
  "allocations": [
    {
      "resourceId": "resource-uuid",
      "resourceName": "Pitch A",
      "startsAt": "...",
      "endsAt": "..."
    }
  ],
  "totalAmount": 300000,
  "payment": { "status": "paid", "provider": "payme", "paidAt": "..." },
  "canCancel": true,
  "canReview": false,
  "policySnapshot": { "cancellationHoursBefore": 24 },
  "qrCodeUrl": "https://..."
}
```

---

### 6.7 Get booking by reference code

|            |                                      |
| ---------- | ------------------------------------ |
| **Method** | `GET`                                |
| **URL**    | `/bookings/reference/:referenceCode` |

**Authentication:** Bearer (owner or business member)

**Response `200 OK`:** Same as [6.6](#66-get-booking-detail).

---

### 6.8 Cancel booking (consumer)

|            |                               |
| ---------- | ----------------------------- |
| **Method** | `POST`                        |
| **URL**    | `/bookings/:bookingId/cancel` |

**Authentication:** Bearer (booking owner)

**Request body:**

```json
{
  "reason": "Schedule conflict"
}
```

**Response `200 OK`:**

```json
{
  "id": "booking-uuid",
  "status": "cancelled",
  "cancellationFee": 150000,
  "refundAmount": 150000,
  "refundStatus": "pending"
}
```

**Possible errors:**

| Code                       | HTTP | Condition                   |
| -------------------------- | ---- | --------------------------- |
| `CANCELLATION_NOT_ALLOWED` | 422  | Outside policy window       |
| `BOOKING_NOT_CANCELLABLE`  | 422  | Already completed/cancelled |

---

### 6.9 List business bookings

|            |                                    |
| ---------- | ---------------------------------- |
| **Method** | `GET`                              |
| **URL**    | `/businesses/:businessId/bookings` |

**Authentication:** Bearer + BusinessMember

**Query:** `date`, `status`, `resourceId`, `page`, `limit`

**Response `200 OK`:** Paginated bookings for business.

---

### 6.10 Business calendar view

|            |                                    |
| ---------- | ---------------------------------- |
| **Method** | `GET`                              |
| **URL**    | `/businesses/:businessId/calendar` |

**Authentication:** Bearer + BusinessMember

**Query:** `view=day|week`, `date=YYYY-MM-DD`, `venueId`

**Response `200 OK`:**

```json
{
  "date": "2026-06-25",
  "view": "day",
  "resources": [
    {
      "resourceId": "resource-uuid",
      "resourceName": "Pitch A",
      "events": [
        {
          "type": "booking",
          "bookingId": "booking-uuid",
          "referenceCode": "RZ-2026-004821",
          "startsAt": "2026-06-25T18:00:00+05:00",
          "endsAt": "2026-06-25T20:00:00+05:00",
          "status": "confirmed",
          "customerName": "Ali Karimov"
        }
      ]
    }
  ]
}
```

---

### 6.11 Walk-in booking (business)

|            |                                            |
| ---------- | ------------------------------------------ |
| **Method** | `POST`                                     |
| **URL**    | `/businesses/:businessId/bookings/walk-in` |

**Authentication:** Bearer + BusinessMember

**Request body:**

```json
{
  "serviceId": "svc-uuid",
  "resourceId": "resource-uuid",
  "startsAt": "2026-06-25T18:00:00+05:00",
  "customerName": "Walk-in Guest",
  "customerPhone": "+998901234567",
  "paymentMethod": "pay_at_venue",
  "notes": "Paid cash at desk"
}
```

**Response `201 Created`:** Confirmed booking (no hold step).

---

### 6.12 Check in booking

|            |                                                        |
| ---------- | ------------------------------------------------------ |
| **Method** | `POST`                                                 |
| **URL**    | `/businesses/:businessId/bookings/:bookingId/check-in` |

**Authentication:** Bearer + BusinessMember

**Request body:** None

**Response `200 OK`:** `{ "status": "checked_in", "checkedInAt": "..." }`

**Possible errors:**

| Code                        | HTTP | Condition                |
| --------------------------- | ---- | ------------------------ |
| `INVALID_STATUS_TRANSITION` | 422  | Not in `confirmed` state |

---

### 6.13 Complete booking

|            |                                                        |
| ---------- | ------------------------------------------------------ |
| **Method** | `POST`                                                 |
| **URL**    | `/businesses/:businessId/bookings/:bookingId/complete` |

**Authentication:** Bearer + BusinessMember

**Response `200 OK`:** `{ "status": "completed" }`

---

### 6.14 Mark no-show

|            |                                                       |
| ---------- | ----------------------------------------------------- |
| **Method** | `POST`                                                |
| **URL**    | `/businesses/:businessId/bookings/:bookingId/no-show` |

**Authentication:** Bearer + BusinessMember

**Response `200 OK`:** `{ "status": "no_show" }`

---

### 6.15 Accept pending booking

|            |                                                      |
| ---------- | ---------------------------------------------------- |
| **Method** | `POST`                                               |
| **URL**    | `/businesses/:businessId/bookings/:bookingId/accept` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Response `200 OK`:** `{ "status": "confirmed" }`

Used when business has `requiresApproval: true`.

---

### 6.16 Reject pending booking

|            |                                                      |
| ---------- | ---------------------------------------------------- |
| **Method** | `POST`                                               |
| **URL**    | `/businesses/:businessId/bookings/:bookingId/reject` |

**Authentication:** Bearer + BusinessMember (`owner`, `manager`)

**Request body:** `{ "reason": "Fully booked" }`

**Response `200 OK`:** `{ "status": "cancelled" }` with automatic refund if paid.

---

### 6.17 Get booking QR code

|            |                               |
| ---------- | ----------------------------- |
| **Method** | `GET`                         |
| **URL**    | `/bookings/:referenceCode/qr` |

**Authentication:** Bearer (owner or business member)

**Response `200 OK`:** `image/png` binary or `{ "qrDataUrl": "data:image/png;base64,..." }`

---

## 7. Payments

### 7.1 Get payment for booking

|            |                                |
| ---------- | ------------------------------ |
| **Method** | `GET`                          |
| **URL**    | `/bookings/:bookingId/payment` |

**Authentication:** Bearer (booking owner or business member)

**Response `200 OK`:**

```json
{
  "id": "payment-uuid",
  "bookingId": "booking-uuid",
  "status": "pending",
  "amount": 90000,
  "currency": "UZS",
  "type": "deposit",
  "provider": null,
  "transactions": [],
  "createdAt": "2026-06-22T10:00:00Z"
}
```

Payment statuses: `pending`, `processing`, `paid`, `failed`, `refunded`, `partially_refunded`.

---

### 7.2 List payment methods (public config)

|            |                     |
| ---------- | ------------------- |
| **Method** | `GET`               |
| **URL**    | `/payments/methods` |

**Authentication:** Public

**Response `200 OK`:**

```json
{
  "data": [
    { "id": "payme", "name": "Payme", "enabled": true },
    { "id": "click", "name": "Click", "enabled": true },
    { "id": "pay_at_venue", "name": "Pay at venue", "enabled": true }
  ]
}
```

---

### 7.3 Initiate payment

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `POST`                                  |
| **URL**    | `/bookings/:bookingId/payment/initiate` |

**Authentication:** Bearer (booking owner)

**Headers:** `Idempotency-Key` (required)

**Request body:**

```json
{
  "provider": "payme",
  "returnUrl": "https://rezerva.uz/bookings/success",
  "cancelUrl": "https://rezerva.uz/bookings/cancel"
}
```

**Validation:**

| Field                     | Rules                               |
| ------------------------- | ----------------------------------- |
| `provider`                | enum `payme`, `click`               |
| `returnUrl` / `cancelUrl` | Required; HTTPS; allowlisted domain |

**Response `200 OK`:**

```json
{
  "paymentId": "payment-uuid",
  "status": "processing",
  "redirectUrl": "https://checkout.paycom.uz/...",
  "expiresAt": "2026-06-22T10:30:00Z"
}
```

**Possible errors:**

| Code                   | HTTP | Condition            |
| ---------------------- | ---- | -------------------- |
| `PAYMENT_ALREADY_PAID` | 409  | Booking already paid |
| `PROVIDER_UNAVAILABLE` | 503  | Gateway down         |

---

### 7.4 Poll payment status

|            |                               |
| ---------- | ----------------------------- |
| **Method** | `GET`                         |
| **URL**    | `/payments/:paymentId/status` |

**Authentication:** Bearer (booking owner)

**Response `200 OK`:**

```json
{
  "paymentId": "payment-uuid",
  "status": "paid",
  "paidAt": "2026-06-22T10:05:00Z",
  "bookingStatus": "confirmed",
  "receiptUrl": "https://..."
}
```

Used by checkout polling UI (`ER-22` state).

---

### 7.5 Payme webhook

|            |                   |
| ---------- | ----------------- |
| **Method** | `POST`            |
| **URL**    | `/webhooks/payme` |

**Authentication:** HMAC signature header (provider-specific)

**Request body:** Payme transaction payload (provider format).

**Response `200 OK`:** Provider acknowledgment.

**Possible errors:**

| Code                | HTTP | Condition                     |
| ------------------- | ---- | ----------------------------- |
| `INVALID_SIGNATURE` | 401  | HMAC verification failed      |
| `AMOUNT_MISMATCH`   | 422  | Amount does not match booking |

Idempotent: duplicate webhooks return 200 without double charge.

---

### 7.6 Click webhook

|            |                   |
| ---------- | ----------------- |
| **Method** | `POST`            |
| **URL**    | `/webhooks/click` |

**Authentication:** Click signature verification

**Request/Response:** Same pattern as [7.5](#75-payme-webhook).

---

### 7.7 List refunds for booking

|            |                                |
| ---------- | ------------------------------ |
| **Method** | `GET`                          |
| **URL**    | `/bookings/:bookingId/refunds` |

**Authentication:** Bearer (owner or business member or admin)

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "refund-uuid",
      "amount": 150000,
      "currency": "UZS",
      "status": "completed",
      "reason": "cancellation",
      "providerRefundId": "payme-ref-123",
      "createdAt": "2026-06-22T11:00:00Z"
    }
  ]
}
```

---

### 7.8 Get business payout detail

|            |                                             |
| ---------- | ------------------------------------------- |
| **Method** | `GET`                                       |
| **URL**    | `/businesses/:businessId/payouts/:payoutId` |

**Authentication:** Bearer + BusinessMember (`owner`)

**Response `200 OK`:**

```json
{
  "id": "payout-uuid",
  "periodStart": "2026-06-16",
  "periodEnd": "2026-06-22",
  "grossAmount": 12500000,
  "commissionAmount": 1250000,
  "netAmount": 11250000,
  "currency": "UZS",
  "status": "pending_transfer",
  "items": [
    {
      "bookingReference": "RZ-2026-004821",
      "grossAmount": 300000,
      "commissionAmount": 30000
    }
  ]
}
```

---

## 8. Reviews

### 8.1 List business reviews (public)

|            |                                   |
| ---------- | --------------------------------- |
| **Method** | `GET`                             |
| **URL**    | `/businesses/:businessId/reviews` |

**Authentication:** Public

**Query:** `page`, `limit`, `sort=rating:desc|createdAt:desc`

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "review-uuid",
      "rating": 5,
      "comment": "Excellent pitch quality",
      "isVerified": true,
      "authorFirstName": "Ali",
      "authorPhotoUrl": null,
      "createdAt": "2026-06-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 128, "totalPages": 7 },
  "summary": {
    "averageRating": 4.7,
    "distribution": { "5": 80, "4": 30, "3": 10, "2": 5, "1": 3 }
  }
}
```

Only published, non-flagged reviews returned publicly.

---

### 8.2 Create review

|            |                               |
| ---------- | ----------------------------- |
| **Method** | `POST`                        |
| **URL**    | `/bookings/:bookingId/review` |

**Authentication:** Bearer (booking owner)

**Request body:**

```json
{
  "rating": 5,
  "comment": "Great experience, will come again"
}
```

**Validation:**

| Field     | Rules                               |
| --------- | ----------------------------------- |
| `rating`  | Required; integer 1–5               |
| `comment` | Optional; 10–2000 chars if provided |

**Response `201 Created`:**

```json
{
  "id": "review-uuid",
  "bookingId": "booking-uuid",
  "businessId": "biz-uuid",
  "rating": 5,
  "comment": "Great experience, will come again",
  "isVerified": true,
  "status": "published",
  "createdAt": "2026-06-22T10:00:00Z"
}
```

**Possible errors:**

| Code                     | HTTP | Condition                          |
| ------------------------ | ---- | ---------------------------------- |
| `BOOKING_NOT_REVIEWABLE` | 422  | Booking not completed              |
| `REVIEW_ALREADY_EXISTS`  | 409  | One review per booking             |
| `REVIEW_WINDOW_EXPIRED`  | 422  | More than 30 days after completion |

---

### 8.3 Update own review

|            |                      |
| ---------- | -------------------- |
| **Method** | `PATCH`              |
| **URL**    | `/reviews/:reviewId` |

**Authentication:** Bearer (review author)

**Request body:** Partial `rating`, `comment` (within 7 days of creation).

**Response `200 OK`:** Updated review.

---

### 8.4 Delete own review

|            |                      |
| ---------- | -------------------- |
| **Method** | `DELETE`             |
| **URL**    | `/reviews/:reviewId` |

**Authentication:** Bearer (review author)

**Response `204 No Content`** (soft delete; triggers rating recalculation)

---

### 8.5 Report review

|            |                             |
| ---------- | --------------------------- |
| **Method** | `POST`                      |
| **URL**    | `/reviews/:reviewId/report` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "reason": "spam",
  "details": "Promotional content"
}
```

**Validation:** `reason` enum `spam`, `offensive`, `fake`, `other`

**Response `202 Accepted`**

---

## 9. Notifications

### 9.1 List notifications (inbox)

|            |                  |
| ---------- | ---------------- |
| **Method** | `GET`            |
| **URL**    | `/notifications` |

**Authentication:** Bearer access token

**Query:** `unreadOnly` (boolean), `page`, `limit`

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "notif-uuid",
      "type": "booking_confirmed",
      "title": "Booking confirmed",
      "body": "Your booking RZ-2026-004821 is confirmed for Jun 25 at 18:00",
      "channel": "in_app",
      "isRead": false,
      "metadata": { "bookingId": "booking-uuid" },
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 },
  "unreadCount": 3
}
```

---

### 9.2 Mark notification as read

|            |                                       |
| ---------- | ------------------------------------- |
| **Method** | `PATCH`                               |
| **URL**    | `/notifications/:notificationId/read` |

**Authentication:** Bearer access token

**Response `200 OK`:** `{ "id": "notif-uuid", "isRead": true }`

---

### 9.3 Mark all as read

|            |                           |
| ---------- | ------------------------- |
| **Method** | `POST`                    |
| **URL**    | `/notifications/read-all` |

**Authentication:** Bearer access token

**Response `200 OK`:** `{ "markedCount": 3 }`

---

### 9.4 Get unread count

|            |                               |
| ---------- | ----------------------------- |
| **Method** | `GET`                         |
| **URL**    | `/notifications/unread-count` |

**Authentication:** Bearer access token

**Response `200 OK`:** `{ "count": 3 }`

---

### 9.5 Register push device token

|            |                          |
| ---------- | ------------------------ |
| **Method** | `POST`                   |
| **URL**    | `/notifications/devices` |

**Authentication:** Bearer access token

**Request body:**

```json
{
  "platform": "web",
  "token": "fcm-or-apns-token",
  "deviceLabel": "Chrome on Android"
}
```

**Validation:** `platform` enum `web`, `ios`, `android`

**Response `201 Created`**

---

### 9.6 Remove device token

|            |                                    |
| ---------- | ---------------------------------- |
| **Method** | `DELETE`                           |
| **URL**    | `/notifications/devices/:deviceId` |

**Authentication:** Bearer access token

**Response `204 No Content`**

---

### 9.7 Send test notification (staging only)

|            |                       |
| ---------- | --------------------- |
| **Method** | `POST`                |
| **URL**    | `/notifications/test` |

**Authentication:** Bearer + admin role; disabled in production

**Request body:** `{ "channel": "sms", "template": "booking_confirmed" }`

**Response `202 Accepted`**

---

## 10. Admin

> All `/admin/*` routes require JWT with `role: admin`. Optional IP allowlist in production.

### 10.1 Admin dashboard overview

|            |                   |
| ---------- | ----------------- |
| **Method** | `GET`             |
| **URL**    | `/admin/overview` |

**Authentication:** Admin

**Response `200 OK`:**

```json
{
  "pendingVerifications": 12,
  "openDisputes": 3,
  "bookingsToday": 847,
  "gmvToday": 425000000,
  "currency": "UZS",
  "activeBusinesses": 342,
  "newUsersToday": 156
}
```

---

### 10.2 List verification queue

|            |                        |
| ---------- | ---------------------- |
| **Method** | `GET`                  |
| **URL**    | `/admin/verifications` |

**Authentication:** Admin

**Query:** `status=pending|approved|rejected`, `page`, `limit`

**Response `200 OK`:** Paginated verification submissions with business summary and documents.

---

### 10.3 Get verification detail

|            |                                        |
| ---------- | -------------------------------------- |
| **Method** | `GET`                                  |
| **URL**    | `/admin/verifications/:verificationId` |

**Authentication:** Admin

**Response `200 OK`:** Full submission with document URLs, business onboarding data, submitter info.

---

### 10.4 Approve business verification

|            |                                                |
| ---------- | ---------------------------------------------- |
| **Method** | `POST`                                         |
| **URL**    | `/admin/verifications/:verificationId/approve` |

**Authentication:** Admin

**Request body:**

```json
{
  "notes": "Documents verified"
}
```

**Response `200 OK`:**

```json
{
  "businessId": "biz-uuid",
  "status": "active",
  "approvedAt": "2026-06-22T10:00:00Z"
}
```

Audit log entry created automatically.

---

### 10.5 Reject business verification

|            |                                               |
| ---------- | --------------------------------------------- |
| **Method** | `POST`                                        |
| **URL**    | `/admin/verifications/:verificationId/reject` |

**Authentication:** Admin

**Request body:**

```json
{
  "reason": "invalid_license",
  "message": "Business license expired. Please upload a current document."
}
```

**Validation:** `reason` required; `message` required (shown to business owner).

**Response `200 OK`:** `{ "status": "rejected" }`

---

### 10.6 List all bookings (admin)

|            |                   |
| ---------- | ----------------- |
| **Method** | `GET`             |
| **URL**    | `/admin/bookings` |

**Authentication:** Admin

**Query:** `referenceCode`, `businessId`, `userId`, `status`, `from`, `to`, `page`, `limit`

**Response `200 OK`:** Paginated bookings with admin fields.

---

### 10.7 Force cancel booking (admin)

|            |                                     |
| ---------- | ----------------------------------- |
| **Method** | `POST`                              |
| **URL**    | `/admin/bookings/:bookingId/cancel` |

**Authentication:** Admin

**Request body:**

```json
{
  "reason": "fraud_suspected",
  "refundOverride": "full",
  "notes": "Internal note"
}
```

**Validation:** `refundOverride` enum `none`, `partial`, `full`

**Response `200 OK`:** Cancelled booking with refund initiation.

---

### 10.8 List disputes

|            |                   |
| ---------- | ----------------- |
| **Method** | `GET`             |
| **URL**    | `/admin/disputes` |

**Authentication:** Admin

**Query:** `status=open|investigating|resolved`, `page`, `limit`

**Response `200 OK`:** Paginated disputes.

---

### 10.9 Get dispute detail

|            |                              |
| ---------- | ---------------------------- |
| **Method** | `GET`                        |
| **URL**    | `/admin/disputes/:disputeId` |

**Authentication:** Admin

**Response `200 OK`:** Dispute with booking, payment, messages, evidence.

---

### 10.10 Resolve dispute

|            |                                      |
| ---------- | ------------------------------------ |
| **Method** | `POST`                               |
| **URL**    | `/admin/disputes/:disputeId/resolve` |

**Authentication:** Admin

**Request body:**

```json
{
  "resolution": "refund_customer",
  "refundAmount": 300000,
  "notes": "Service not delivered as described"
}
```

**Validation:** `resolution` enum `refund_customer`, `favor_business`, `split`, `no_action`

**Response `200 OK`:** Resolved dispute with linked refund if applicable.

---

### 10.11 List flagged reviews

|            |                          |
| ---------- | ------------------------ |
| **Method** | `GET`                    |
| **URL**    | `/admin/reviews/flagged` |

**Authentication:** Admin

**Response `200 OK`:** Paginated reviews with report details.

---

### 10.12 Moderate review

|            |                                     |
| ---------- | ----------------------------------- |
| **Method** | `POST`                              |
| **URL**    | `/admin/reviews/:reviewId/moderate` |

**Authentication:** Admin

**Request body:**

```json
{
  "action": "hide",
  "reason": "spam"
}
```

**Validation:** `action` enum `approve`, `hide`, `delete`

**Response `200 OK`**

---

### 10.13 List featured listings

|            |                            |
| ---------- | -------------------------- |
| **Method** | `GET`                      |
| **URL**    | `/admin/featured-listings` |

**Authentication:** Admin

**Response `200 OK`:** Active and scheduled featured entries.

---

### 10.14 Create featured listing

|            |                            |
| ---------- | -------------------------- |
| **Method** | `POST`                     |
| **URL**    | `/admin/featured-listings` |

**Authentication:** Admin

**Request body:**

```json
{
  "businessId": "biz-uuid",
  "cityId": "city-uuid",
  "category": "football",
  "startsAt": "2026-07-01T00:00:00Z",
  "endsAt": "2026-07-31T23:59:59Z",
  "sortOrder": 1
}
```

**Response `201 Created`**

---

### 10.15 Update featured listing

|            |                                        |
| ---------- | -------------------------------------- |
| **Method** | `PATCH`                                |
| **URL**    | `/admin/featured-listings/:featuredId` |

**Authentication:** Admin

**Response `200 OK`**

---

### 10.16 Delete featured listing

|            |                                        |
| ---------- | -------------------------------------- |
| **Method** | `DELETE`                               |
| **URL**    | `/admin/featured-listings/:featuredId` |

**Authentication:** Admin

**Response `204 No Content`**

---

### 10.17 List commission rates

|            |                           |
| ---------- | ------------------------- |
| **Method** | `GET`                     |
| **URL**    | `/admin/commission-rates` |

**Authentication:** Admin

**Response `200 OK`:**

```json
{
  "data": [
    {
      "category": "football",
      "ratePercent": 10,
      "effectiveFrom": "2026-01-01"
    },
    { "category": "salon", "ratePercent": 12, "effectiveFrom": "2026-01-01" }
  ]
}
```

---

### 10.18 Create commission rate

|            |                           |
| ---------- | ------------------------- |
| **Method** | `POST`                    |
| **URL**    | `/admin/commission-rates` |

**Authentication:** Admin

**Request body:**

```json
{
  "category": "hotel",
  "ratePercent": 15,
  "effectiveFrom": "2026-08-01"
}
```

**Validation:** New rates apply to bookings created after `effectiveFrom` only.

**Response `201 Created`**

---

### 10.19 List platform settings

|            |                   |
| ---------- | ----------------- |
| **Method** | `GET`             |
| **URL**    | `/admin/settings` |

**Authentication:** Admin

**Response `200 OK`:**

```json
{
  "data": [
    { "key": "hold_ttl_minutes", "value": "10" },
    { "key": "max_active_holds_per_user", "value": "3" }
  ]
}
```

---

### 10.20 Update platform setting

|            |                        |
| ---------- | ---------------------- |
| **Method** | `PUT`                  |
| **URL**    | `/admin/settings/:key` |

**Authentication:** Admin

**Request body:** `{ "value": "15" }`

**Response `200 OK`**

---

### 10.21 Search audit logs

|            |                     |
| ---------- | ------------------- |
| **Method** | `GET`               |
| **URL**    | `/admin/audit-logs` |

**Authentication:** Admin

**Query:** `entityType`, `entityId`, `actorId`, `action`, `from`, `to`, `page`, `limit`

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "audit-uuid",
      "actorId": "admin-user-uuid",
      "actorEmail": "admin@rezerva.uz",
      "action": "verification.approve",
      "entityType": "business",
      "entityId": "biz-uuid",
      "oldValues": { "status": "pending_verification" },
      "newValues": { "status": "active" },
      "ipAddress": "203.0.113.10",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1000, "totalPages": 20 }
}
```

---

### 10.22 Manual refund override

|            |                                     |
| ---------- | ----------------------------------- |
| **Method** | `POST`                              |
| **URL**    | `/admin/payments/:paymentId/refund` |

**Authentication:** Admin

**Request body:**

```json
{
  "amount": 300000,
  "reason": "dispute_resolution",
  "notes": "Approved by support ticket #4521"
}
```

**Response `200 OK`:** Refund record with provider status.

**Possible errors:**

| Code            | HTTP | Condition                                   |
| --------------- | ---- | ------------------------------------------- |
| `REFUND_FAILED` | 422  | Provider rejected; queued for manual review |

---

### 10.23 Suspend business

|            |                                         |
| ---------- | --------------------------------------- |
| **Method** | `POST`                                  |
| **URL**    | `/admin/businesses/:businessId/suspend` |

**Authentication:** Admin

**Request body:** `{ "reason": "policy_violation", "message": "..." }`

**Response `200 OK`:** `{ "status": "suspended" }`

---

### 10.24 Reinstate business

|            |                                           |
| ---------- | ----------------------------------------- |
| **Method** | `POST`                                    |
| **URL**    | `/admin/businesses/:businessId/reinstate` |

**Authentication:** Admin

**Response `200 OK`:** `{ "status": "active" }`

---

## Appendix — Public discovery & system

### A.1 Health check

|            |           |
| ---------- | --------- |
| **Method** | `GET`     |
| **URL**    | `/health` |

**Authentication:** Public

**Response `200 OK`:**

```json
{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "timestamp": "2026-06-22T10:00:00Z"
}
```

**Response `503 Service Unavailable`:** when any dependency fails.

---

### A.2 List countries

|            |                  |
| ---------- | ---------------- |
| **Method** | `GET`            |
| **URL**    | `/geo/countries` |

**Authentication:** Public

**Response `200 OK`:** `{ "data": [{ "id": "...", "code": "UZ", "name": "O'zbekiston" }] }`

---

### A.3 List regions by country

|            |                                     |
| ---------- | ----------------------------------- |
| **Method** | `GET`                               |
| **URL**    | `/geo/countries/:countryId/regions` |

**Authentication:** Public

---

### A.4 List districts by region

|            |                                    |
| ---------- | ---------------------------------- |
| **Method** | `GET`                              |
| **URL**    | `/geo/regions/:regionId/districts` |

**Authentication:** Public

---

### A.5 List cities (active markets)

|            |               |
| ---------- | ------------- |
| **Method** | `GET`         |
| **URL**    | `/geo/cities` |

**Authentication:** Public

**Response `200 OK`:**

```json
{
  "data": [
    {
      "id": "city-uuid",
      "name": "Tashkent",
      "slug": "tashkent",
      "isActive": true
    },
    {
      "id": "city-uuid-2",
      "name": "Samarkand",
      "slug": "samarkand",
      "isActive": true
    }
  ]
}
```

---

### A.6 Featured businesses (consumer homepage)

|            |             |
| ---------- | ----------- |
| **Method** | `GET`       |
| **URL**    | `/featured` |

**Authentication:** Public

**Query:** `cityId`, `category`

**Response `200 OK`:** List of featured business cards (same shape as search results).

---

### A.7 Accept staff invitation

|            |                              |
| ---------- | ---------------------------- |
| **Method** | `POST`                       |
| **URL**    | `/invitations/:token/accept` |

**Authentication:** Bearer (invited user's phone must match)

**Response `200 OK`:** `{ "businessId": "...", "role": "receptionist" }`

---

## Error code reference

| Code                       | HTTP | Domain       |
| -------------------------- | ---- | ------------ |
| `VALIDATION_ERROR`         | 400  | All          |
| `UNAUTHORIZED`             | 401  | Auth         |
| `OTP_INVALID`              | 401  | Auth         |
| `OTP_EXPIRED`              | 401  | Auth         |
| `REFRESH_TOKEN_REUSED`     | 401  | Auth         |
| `FORBIDDEN`                | 403  | All          |
| `NOT_FOUND`                | 404  | All          |
| `SLOT_UNAVAILABLE`         | 409  | Bookings     |
| `REVIEW_ALREADY_EXISTS`    | 409  | Reviews      |
| `HOLD_EXPIRED`             | 422  | Bookings     |
| `CANCELLATION_NOT_ALLOWED` | 422  | Bookings     |
| `ONBOARDING_INCOMPLETE`    | 422  | Businesses   |
| `BOOKING_NOT_REVIEWABLE`   | 422  | Reviews      |
| `RATE_LIMIT_EXCEEDED`      | 429  | Auth, public |
| `PROVIDER_UNAVAILABLE`     | 503  | Payments     |

---

## Versioning & changelog

| Version | Date       | Notes                                                     |
| ------- | ---------- | --------------------------------------------------------- |
| 1.0     | 2026-06-22 | Initial specification aligned with Rezerva roadmap M0–M10 |

Future breaking changes will be introduced under `/v2` with a minimum 6-month deprecation window for `/v1`.

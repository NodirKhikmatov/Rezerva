# Rezerva Telegram Bot — Architecture

**Stack:** Telegraf 4 · `@telegraf/session` · Redis · NestJS integration  
**Scope:** Consumer-facing bot for discovery, booking, booking management, and notification delivery  
**Principle:** Thin bot layer — all business logic lives in feature services (`BookingService`, `AuthService`, `NotificationService`)

This document defines scenes, middleware, commands, callbacks, Redis state, error handling, notifications, and folder structure. No implementation code.

---

## Table of contents

1. [Overview](#1-overview)
2. [Runtime modes](#2-runtime-modes)
3. [Folder structure](#3-folder-structure)
4. [NestJS integration](#4-nestjs-integration)
5. [Bot context & session model](#5-bot-context--session-model)
6. [Redis state design](#6-redis-state-design)
7. [Middleware pipeline](#7-middleware-pipeline)
8. [Commands](#8-commands)
9. [Scenes (Scene Wizard)](#9-scenes-scene-wizard)
10. [Callbacks & keyboards](#10-callbacks--keyboards)
11. [Notifications](#11-notifications)
12. [Error handling](#12-error-handling)
13. [Security & rate limiting](#13-security--rate-limiting)
14. [Observability](#14-observability)
15. [Phased rollout](#15-phased-rollout)

---

## 1. Overview

### Purpose

The Telegram bot is a **conversational front-end** to the Rezerva API. It enables users to:

- Authenticate via Telegram identity (linked to platform `User`)
- Browse football venues (M2 launch vertical)
- Complete a full booking flow without leaving Telegram
- View upcoming/past bookings and cancel within policy
- Receive booking confirmations and reminders via Telegram messages
- Deep-link to the web app / Mini App for advanced flows

### Architecture diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Telegram Platform                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ webhook / long polling
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  features/telegram/                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────────┐ │
│  │ Middleware   │→ │ Commands /  │→ │ Actions & Keyboards      │ │
│  │ Pipeline     │  │ Scenes      │  │ (callback_query handlers)│ │
│  └──────────────┘  └──────┬──────┘  └────────────┬─────────────┘ │
│                           │                       │              │
│                    ┌──────▼───────────────────────▼──────┐       │
│                    │         BotOrchestrator             │       │
│                    │  (validates, maps TG user → User)   │       │
│                    └──────┬──────────────────────────────┘       │
└───────────────────────────┼────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐
  │ AuthService │   │BookingService│   │NotificationService│
  └─────────────┘   └─────────────┘   └─────────────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
                    ┌───────────────┐
                    │ Redis (state) │
                    │ PostgreSQL    │
                    └───────────────┘
```

### Design rules

| Rule                        | Rationale                                |
| --------------------------- | ---------------------------------------- |
| Handlers ≤ 30 lines         | Delegate to orchestrator/services        |
| No Prisma in handlers       | Repository access via services only      |
| All state in Redis          | Horizontally scalable, survives restarts |
| Every action validated      | Input from Telegram is untrusted         |
| Every action logged         | Audit trail + debugging                  |
| Scenes for multi-step flows | Booking requires wizard UX               |
| Commands for entry points   | Predictable navigation                   |

---

## 2. Runtime modes

| Mode             | Environment        | Transport                   | Registration           |
| ---------------- | ------------------ | --------------------------- | ---------------------- |
| **Long polling** | Local dev, staging | `bot.launch()`              | Manual start           |
| **Webhook**      | Production         | `POST /v1/telegram/webhook` | `setWebhook` on deploy |

### Webhook configuration

| Setting              | Value                                         |
| -------------------- | --------------------------------------------- |
| URL                  | `https://api.rezerva.uz/v1/telegram/webhook`  |
| Secret token         | `TELEGRAM_WEBHOOK_SECRET` header validation   |
| Allowed updates      | `message`, `callback_query`, `my_chat_member` |
| Drop pending updates | `true` on deploy                              |
| Max connections      | 40                                            |

### Graceful shutdown

On SIGTERM/SIGINT:

1. Stop accepting new updates (`bot.stop()`)
2. Drain in-flight handlers (30s timeout)
3. Persist scene state to Redis (automatic via session middleware)
4. Close Redis connection

---

## 3. Folder structure

```
backend/src/features/telegram/
│
├── telegram.module.ts                 # NestJS module; conditional import
├── telegram-bot.service.ts            # Telegraf lifecycle, register handlers
├── telegram-webhook.controller.ts     # POST /telegram/webhook (production)
├── telegram-orchestrator.service.ts   # Maps TG user → platform User, coordinates flows
├── telegram-session.service.ts        # Redis session read/write helpers
├── telegram-locale.service.ts         # uz/ru copy resolution from user locale
│
├── types/
│   ├── bot-context.type.ts            # Extended Telegraf Context
│   ├── session-data.type.ts           # Redis session shape
│   ├── scene-state.type.ts            # Per-scene wizard state
│   └── callback-data.type.ts          # Typed callback payload parser
│
├── constants/
│   ├── commands.constants.ts          # Command names & descriptions
│   ├── callback-prefixes.constants.ts # CB query namespace prefixes
│   ├── scene-ids.constants.ts         # Scene registration IDs
│   └── redis-keys.constants.ts        # Key patterns & TTLs
│
├── middleware/
│   ├── index.ts                       # composeMiddleware pipeline
│   ├── session.middleware.ts          # Redis-backed @telegraf/session
│   ├── auth.middleware.ts             # Resolve/link platform User
│   ├── locale.middleware.ts           # Set ctx.locale from User or TG language
│   ├── rate-limit.middleware.ts     # Per-user Redis counter
│   ├── logging.middleware.ts          # Structured action log
│   ├── error-boundary.middleware.ts   # Catch handler errors → user message
│   └── scene-reset.middleware.ts      # /cancel global scene exit
│
├── commands/
│   ├── index.ts                       # registerCommands(bot)
│   ├── start.command.ts               # /start — welcome + link account
│   ├── help.command.ts                # /help — command list + support
│   ├── book.command.ts                # /book — enter booking scene
│   ├── bookings.command.ts            # /bookings — list upcoming
│   ├── cancel.command.ts              # /cancel — exit current scene
│   └── settings.command.ts            # /settings — notification prefs (M5)
│
├── scenes/
│   ├── index.ts                       # Stage registration
│   ├── booking/
│   │   ├── booking.scene.ts           # Scene Wizard root
│   │   ├── steps/
│   │   │   ├── select-category.step.ts
│   │   │   ├── select-business.step.ts
│   │   │   ├── select-service.step.ts
│   │   │   ├── select-date.step.ts
│   │   │   ├── select-slot.step.ts
│   │   │   ├── hold-countdown.step.ts
│   │   │   ├── confirm-summary.step.ts
│   │   │   └── success.step.ts
│   │   └── booking-scene.guard.ts     # Step transition validation
│   │
│   ├── booking-detail/
│   │   ├── booking-detail.scene.ts    # View single booking + cancel
│   │   └── steps/
│   │       ├── detail-view.step.ts
│   │       └── cancel-confirm.step.ts
│   │
│   └── settings/
│       ├── settings.scene.ts          # Toggle Telegram notifications
│       └── steps/
│           └── preferences.step.ts
│
├── actions/
│   ├── index.ts                       # registerActions(bot)
│   ├── navigation.actions.ts          # back, home, dismiss
│   ├── booking-list.actions.ts        # paginate /bookings inline
│   ├── booking-detail.actions.ts      # open booking, cancel flow
│   ├── slot-picker.actions.ts         # date nav, slot selection callbacks
│   ├── hold.actions.ts                # extend hold (disabled), release hold
│   └── settings.actions.ts            # toggle notification prefs
│
├── keyboards/
│   ├── main-menu.keyboard.ts          # Persistent reply keyboard (optional)
│   ├── inline/
│   │   ├── category.keyboard.ts
│   │   ├── business-list.keyboard.ts
│   │   ├── service-list.keyboard.ts
│   │   ├── date-picker.keyboard.ts
│   │   ├── slot-grid.keyboard.ts
│   │   ├── confirm.keyboard.ts
│   │   ├── booking-card.keyboard.ts
│   │   └── pagination.keyboard.ts
│   └── builders/
│       ├── callback-data.builder.ts   # Encode/decode CB payloads (≤64 bytes)
│       └── keyboard-layout.util.ts    # 2-col / 1-col layout helpers
│
├── messages/
│   ├── templates/
│   │   ├── welcome.message.ts
│   │   ├── help.message.ts
│   │   ├── booking-confirmed.message.ts
│   │   ├── booking-reminder.message.ts
│   │   ├── hold-expired.message.ts
│   │   ├── slot-unavailable.message.ts
│   │   └── error.message.ts
│   └── formatters/
│       ├── booking.formatter.ts       # Reference code, date, price formatting
│       ├── price.formatter.ts         # UZS display
│       └── duration.formatter.ts
│
├── notifications/
│   ├── telegram-notification.adapter.ts   # Outbound: send to chat_id
│   ├── notification-template.registry.ts  # Map NotificationType → template
│   ├── inbound-notification.handler.ts    # Process queued TG delivery jobs
│   └── deep-link.builder.ts               # t.me/bot?start=booking_<id>
│
├── validation/
│   ├── callback-data.validator.ts     # Parse & validate CB payloads
│   ├── scene-input.validator.ts       # Text input in scenes (if any)
│   └── telegram-user.validator.ts     # from.id, username sanity checks
│
├── errors/
│   ├── bot-error.codes.ts             # ER-08, ER-09, etc.
│   ├── bot-error.class.ts             # Typed bot errors
│   └── error-message.resolver.ts      # Code → localized user message
│
└── dto/
    └── telegram-update.dto.ts         # Webhook body validation
```

---

## 4. NestJS integration

### Module wiring

```
TelegramModule
  imports:   [AuthModule, BookingModule, NotificationModule, UserModule, ConfigModule]
  providers: [TelegramBotService, TelegramOrchestratorService, TelegramSessionService,
              TelegramLocaleService, TelegramNotificationAdapter, ...handlers as providers]
  controllers: [TelegramWebhookController]
  exports:   [TelegramNotificationAdapter]
```

### Boot sequence

1. `TelegramBotService.onModuleInit()` — create Telegraf instance
2. Register middleware pipeline (order matters — see §7)
3. Register commands, actions, scenes (Stage)
4. If `NODE_ENV === production` → register webhook via controller
5. Else → `bot.launch()` long polling

### Dependency injection pattern

Handlers are NestJS providers injected with services:

```
StartCommand
  → TelegramOrchestratorService
  → TelegramLocaleService
  → AuthService
```

Handlers receive services via factory or `TelegramBotService` passes deps at registration time. **Handlers never instantiate services directly.**

---

## 5. Bot context & session model

### Extended context (`BotContext`)

Extends Telegraf `Context` with:

| Field       | Type                        | Source                    |
| ----------- | --------------------------- | ------------------------- |
| `session`   | `SessionData`               | Redis session middleware  |
| `scene`     | `SceneState`                | Telegraf scene session    |
| `user`      | `AuthenticatedUser \| null` | Auth middleware           |
| `locale`    | `uz \| ru \| en`            | Locale middleware         |
| `requestId` | `string`                    | Logging middleware (UUID) |

### Session data shape (`SessionData`)

```
SessionData {
  telegramId: number
  userId: string | null          # Platform User UUID (null until linked)
  locale: Locale
  lastCommand: string | null
  lastActivityAt: ISO8601
  bookingDraft: BookingDraft | null   # Partial booking during scene
  pagination: {
    bookings: { page: number }
    businesses: { page: number, category: string }
  }
}
```

### Booking draft (in-scene transient state)

```
BookingDraft {
  category: BusinessCategory
  businessId: string
  businessSlug: string
  businessName: string
  venueId: string
  serviceId: string
  serviceName: string
  resourceId: string | null
  startsAt: ISO8601
  endsAt: ISO8601
  price: number
  currency: string
  holdId: string | null
  holdExpiresAt: ISO8601 | null
  partySize: number | null
}
```

Draft is cleared on: successful booking, `/cancel`, hold expiry, scene timeout.

---

## 6. Redis state design

### Key namespaces

| Key pattern                   | Purpose                           | TTL              |
| ----------------------------- | --------------------------------- | ---------------- |
| `tg:session:{telegramId}`     | Telegraf session JSON             | 7 days (sliding) |
| `tg:scene:{telegramId}`       | Active scene + step + scene state | 30 min (sliding) |
| `tg:rate:{telegramId}`        | Action counter                    | 60 sec window    |
| `tg:rate:global:{telegramId}` | Daily message cap                 | 24 hours         |
| `tg:hold:reminder:{holdId}`   | Hold expiry warning sent flag     | 10 min           |
| `tg:link:{telegramId}`        | Pending account link token        | 5 min            |

### Session storage adapter

Uses `@telegraf/session` with custom Redis store:

| Operation         | Behavior                           |
| ----------------- | ---------------------------------- |
| `get(key)`        | JSON parse; return `{}` if missing |
| `set(key, value)` | JSON stringify; SET with EX TTL    |
| `delete(key)`     | On `/cancel` or account unlink     |

### TTL & expiry policy

| Event                | Action                                        |
| -------------------- | --------------------------------------------- |
| Any user message     | Refresh session TTL (sliding 7d)              |
| Scene step change    | Refresh scene TTL (sliding 30m)               |
| Scene idle 30m       | Auto-leave scene; notify user; clear draft    |
| Hold created         | Store `holdId` in draft; schedule expiry job  |
| Hold expired (ER-09) | Clear draft slot fields; show re-pick message |

### Concurrency

- Session updates use Redis `WATCH`/`MULTI` or Lua script for atomic read-modify-write on `bookingDraft`
- Prevents race when user taps two slot buttons quickly

---

## 7. Middleware pipeline

Middleware executes **top to bottom**. Order is fixed:

```
1. error-boundary      # Outermost catch — always runs last on error
2. logging             # Assign requestId, log incoming update type
3. session             # Load/save Redis session
4. rate-limit          # Reject spam before heavy work
5. auth                # Resolve platform User from telegramId
6. locale              # Set ctx.locale
7. scene-reset         # Global /cancel handler registration
8. [commands/scenes/actions handlers]
```

### Middleware specifications

#### `session.middleware`

- Backed by Redis via `TelegramSessionService`
- Stores `SessionData` under `tg:session:{telegramId}`
- Scene state stored separately under `tg:scene:{telegramId}` via Telegraf Stage config

#### `auth.middleware`

- Lookup `UserIdentity` where `provider = telegram` and `providerId = ctx.from.id`
- If found → attach `ctx.user`
- If not found → attempt silent link via `TelegramOrchestratorService.linkTelegramUser()`
- On first `/start` → create User + UserIdentity if not exists
- Never block unauthenticated users from `/start` and `/help`

#### `rate-limit.middleware`

- Increment `tg:rate:{telegramId}` per update
- Limits: 30 actions/minute/user, 500 actions/day/user
- On exceed → reply once with cooldown message; drop update
- Exempt: webhook retries from Telegram (dedupe by `update_id`)

#### `logging.middleware`

- Log: `requestId`, `telegramId`, `updateType`, `command|callback|scene`, `durationMs`
- PII rule: log `telegramId`, never log phone or full name in info logs
- Errors → Sentry + structured error log

#### `locale.middleware`

- Priority: `User.locale` → `ctx.from.language_code` (map `uz`/`ru`) → default `uz`
- Attach `ctx.locale` for template resolution

#### `error-boundary.middleware`

- Wraps `next()` in try/catch
- Maps typed `BotError` → localized message (see §12)
- Unknown errors → generic message + Sentry
- Always clears loading states (edit message or answer callback query)

#### `scene-reset.middleware`

- Registers global `/cancel` command handler
- Leaves current scene, clears `bookingDraft`, confirms to user

---

## 8. Commands

All commands registered with BotFather descriptions (uz + ru).

| Command     | Auth required | Handler file          | Behavior                                                                                   |
| ----------- | ------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `/start`    | No            | `start.command.ts`    | Welcome message; link/create account; show main actions keyboard; handle deep-link payload |
| `/help`     | No            | `help.command.ts`     | Command list, support contact, link to web app                                             |
| `/book`     | Yes           | `book.command.ts`     | Enter `booking` scene at `select-category` step                                            |
| `/bookings` | Yes           | `bookings.command.ts` | List upcoming bookings (inline paginated); tap → detail scene                              |
| `/cancel`   | No            | `cancel.command.ts`   | Leave active scene; release hold if any; clear draft                                       |
| `/settings` | Yes           | `settings.command.ts` | Enter `settings` scene (M5)                                                                |

### Deep-link payloads (`/start` parameter)

| Payload                   | Action                                     |
| ------------------------- | ------------------------------------------ |
| `booking_{referenceCode}` | Open booking detail scene                  |
| `business_{slug}`         | Enter booking scene pre-select business    |
| `verify_{token}`          | Staff invitation accept (delegates to API) |
| _(empty)_                 | Standard welcome                           |

### Command handler contract

Each command handler:

1. Validates `ctx.from` exists
2. Calls single orchestrator method
3. Sends/edits one message with inline keyboard
4. Returns within 30 lines
5. Does not call Prisma directly

---

## 9. Scenes (Scene Wizard)

Uses `telegraf/scenes` with `Scenes.WizardScene` for linear flows and `Scenes.BaseScene` for hub navigation.

### Scene registry

| Scene ID         | Type   | Entry trigger              | Exit conditions                    |
| ---------------- | ------ | -------------------------- | ---------------------------------- |
| `booking`        | Wizard | `/book`, `CB:book_start`   | Success, `/cancel`, error, timeout |
| `booking-detail` | Wizard | `/bookings` tap, deep link | Back, cancel complete, `/cancel`   |
| `settings`       | Base   | `/settings`                | Back to idle                       |

### Booking scene — step flow

```
select-category
    ↓ user picks "Football" (M2: only football enabled)
select-business
    ↓ paginated list from SearchService
select-service
    ↓ services for business
select-date
    ↓ 7-day inline date picker
select-slot
    ↓ AvailabilityService → slot grid callbacks
hold-countdown
    ↓ SlotHoldService.create → show 10:00 countdown
confirm-summary
    ↓ show price, policy, confirm/cancel buttons
success
    ↓ BookingService.confirm → reference code + QR link
    → leave scene
```

### Step specifications

| Step              | User input                   | Service calls                     | Validation                     | On error                        |
| ----------------- | ---------------------------- | --------------------------------- | ------------------------------ | ------------------------------- |
| `select-category` | Inline callback              | —                                 | Category in allowed list       | Show "coming soon" for disabled |
| `select-business` | Inline callback + pagination | `SearchService.search()`          | businessId UUID, status active | Empty → E-15 message            |
| `select-service`  | Inline callback              | `ServiceCatalogService.list()`    | serviceId belongs to business  | Retry list                      |
| `select-date`     | Inline callback              | —                                 | Date within 14 days, not past  | Invalid date message            |
| `select-slot`     | Inline callback              | `AvailabilityService.getSlots()`  | Slot still available           | ER-08 slot taken                |
| `hold-countdown`  | Auto + callback              | `SlotHoldService.create()`        | Hold created                   | ER-08 / ER-09                   |
| `confirm-summary` | Confirm callback             | `BookingService.createFromHold()` | Hold valid, idempotency        | ER-09 expired                   |
| `success`         | —                            | —                                 | —                              | —                               |

### Hold countdown step

- Edit message every 60s with remaining time (or single message with timestamp)
- On confirm → `BookingService.createFromHold({ paymentMethod: pay_at_venue })`
- On expiry job fires → push ER-09 message; rewind to `select-slot`
- On `/cancel` → `SlotHoldService.release(holdId)`

### Booking detail scene

| Step             | Actions available                                           |
| ---------------- | ----------------------------------------------------------- |
| `detail-view`    | Show status timeline, venue, time, reference, QR button     |
| `cancel-confirm` | Policy summary → confirm cancel → `BookingService.cancel()` |

Cancel only shown when `canCancel = true` from booking detail response.

### Scene guards (`booking-scene.guard.ts`)

Before each step transition:

- Verify required draft fields populated
- Verify user still authenticated
- Verify hold not expired (steps after hold)
- Reject skip attempts (wizard enforces order)

### Scene timeout

- 30 minutes idle → auto-leave scene
- Release active hold
- Send "Session expired, tap /book to start again"

---

## 10. Callbacks & keyboards

### Callback data encoding

Telegram limit: **64 bytes** per `callback_data`.

Format: `{prefix}:{action}:{id}:{page}`

| Prefix | Namespace      | Example                                 |
| ------ | -------------- | --------------------------------------- |
| `cat`  | Category pick  | `cat:pick:football`                     |
| `biz`  | Business list  | `biz:pick:{uuid}`                       |
| `bizp` | Business page  | `bizp:page:2:football`                  |
| `svc`  | Service pick   | `svc:pick:{uuid}`                       |
| `dt`   | Date pick      | `dt:pick:2026-06-25`                    |
| `slt`  | Slot pick      | `slt:pick:{resourceId}:{epoch}`         |
| `hld`  | Hold action    | `hld:confirm` / `hld:release`           |
| `bkg`  | Booking action | `bkg:view:{uuid}` / `bkg:cancel:{uuid}` |
| `bkgp` | Bookings page  | `bkgp:page:1`                           |
| `nav`  | Navigation     | `nav:back` / `nav:home`                 |
| `set`  | Settings       | `set:tg:on` / `set:tg:off`              |

Parser in `callback-data.builder.ts` validates prefix + UUID format before routing.

### Action handler registry

| File                        | Handles prefixes | Responsibility                          |
| --------------------------- | ---------------- | --------------------------------------- |
| `navigation.actions.ts`     | `nav`            | Back step, exit scene, dismiss keyboard |
| `slot-picker.actions.ts`    | `dt`, `slt`      | Date navigation, slot selection         |
| `hold.actions.ts`           | `hld`            | Confirm booking, release hold           |
| `booking-list.actions.ts`   | `bkgp`, `bkg`    | Paginate list, open detail              |
| `booking-detail.actions.ts` | `bkg:cancel`     | Cancel confirmation flow                |
| `settings.actions.ts`       | `set`            | Toggle preferences                      |

### Action handler contract

1. `await ctx.answerCbQuery()` — always answer within 30s (loading toast if slow)
2. Parse callback via `CallbackDataValidator`
3. Invalid payload → silent ignore + log warning
4. Delegate to orchestrator
5. Edit message in place (prefer `editMessageText` over new message)

### Keyboard layout rules

| Context                      | Layout                            |
| ---------------------------- | --------------------------------- |
| Category list                | 1 column                          |
| Business list                | 1 column + pagination row         |
| Date picker                  | 7 columns (week row) or 3 columns |
| Slot grid                    | 2 columns max                     |
| Confirm/Cancel               | 2 columns side by side            |
| Destructive (cancel booking) | Confirm on separate message       |

All button labels localized via `TelegramLocaleService`.

---

## 11. Notifications

### Outbound (bot → user)

The bot acts as a **delivery adapter** for the notification system — it does not own notification logic.

```
BookingService / ReminderCron
    → NotificationDispatcherService.enqueue({ channel: telegram, userId, type, payload })
        → BullMQ notifications queue
            → NotificationProcessor
                → TelegramNotificationAdapter.send()
                    → bot.telegram.sendMessage(chatId, text, { reply_markup })
```

### Supported notification types (Telegram channel)

| Type                    | Template                       | Trigger                        |
| ----------------------- | ------------------------------ | ------------------------------ |
| `booking_confirmed`     | `booking-confirmed.message.ts` | Booking confirmed              |
| `booking_cancelled`     | Custom                         | Consumer or business cancel    |
| `booking_reminder_24h`  | `booking-reminder.message.ts`  | Cron scheduler                 |
| `booking_reminder_1h`   | `booking-reminder.message.ts`  | Cron scheduler                 |
| `hold_expiring`         | Hold warning (5 min left)      | Hold TTL job                   |
| `payment_received`      | Receipt summary                | Payment webhook success        |
| `payment_failed`        | Retry link to web checkout     | Payment failure                |
| `verification_approved` | Business owner notice          | Admin approve (future B2B bot) |
| `staff_invitation`      | Accept link                    | Member invite                  |

### Chat ID resolution

1. Lookup `UserIdentity` where `provider = telegram` for `userId`
2. `providerId` = Telegram chat ID (`from.id`)
3. If no identity or `telegramEnabled = false` in preferences → skip (status: `skipped`)
4. If bot blocked by user (403) → mark delivery failed; do not retry

### Message format

- MarkdownV2 or HTML (pick one globally — recommend HTML for simpler escaping)
- Include: reference code, business name, date/time (Asia/Tashkent), venue address
- Action buttons: "View booking" → deep link, "Open in app" → Mini App URL
- QR: link to `https://rezerva.uz/bookings/{referenceCode}` (not inline image in v1)

### Inbound (user → bot)

Not used for notifications — user initiates via commands/scenes only. No free-text parsing in v1 except future support chat (M6+).

### Preference enforcement

Before every outbound send:

```
UserNotificationPreference.telegramEnabled === true
AND UserNotificationPreference.bookingConfirmations (or matching flag)
```

Checked in `TelegramNotificationAdapter` — not in processor.

---

## 12. Error handling

### Error taxonomy

| Code               | User message (uz)                   | Recoverable | Scene behavior                        |
| ------------------ | ----------------------------------- | ----------- | ------------------------------------- |
| `ER-08`            | Slot bandi — boshqa vaqt tanlang    | Yes         | Rewind to `select-slot`               |
| `ER-09`            | Band qilish muddati tugadi          | Yes         | Rewind to `select-slot`; release hold |
| `ER-10`            | Avtorizatsiya kerak — /start bosing | Yes         | Leave scene                           |
| `ER-11`            | Juda ko'p so'rov — biroz kuting     | Yes         | Stay; no state change                 |
| `ER-22`            | To'lov kutilmoqda...                | Yes         | Link to web checkout                  |
| `E-15`             | Bo'sh jadval — boshqa sana tanlang  | Yes         | Stay on date/slot step                |
| `BOT_UNKNOWN`      | Xatolik yuz berdi. /help            | No          | Leave scene; log Sentry               |
| `BOT_SERVICE_DOWN` | Xizmat vaqtincha ishlamayapti       | No          | Stay; retry button                    |

### Error flow

```
Handler throws BotError { code, details }
    → error-boundary.middleware catches
    → ErrorMessageResolver.resolve(code, locale)
    → answerCbQuery (if callback) with toast
    → editMessageText or reply with error + recovery keyboard
    → LoggingMiddleware logs code + requestId (not stack to user)
    → Sentry capture if code === BOT_UNKNOWN or 5xx from service
```

### Service error mapping

| API HTTP             | Bot code         |
| -------------------- | ---------------- |
| 409 SLOT_UNAVAILABLE | ER-08            |
| 422 HOLD_EXPIRED     | ER-09            |
| 401                  | ER-10            |
| 429                  | ER-11            |
| 503                  | BOT_SERVICE_DOWN |
| 500                  | BOT_UNKNOWN      |

Mapping done in `TelegramOrchestratorService` — single mapping layer.

### Callback query errors

Always call `ctx.answerCbQuery({ text, show_alert })` even on failure — prevents Telegram loading spinner stuck.

### Hold expiry async path

Hold expiry handled by worker, not bot process:

1. `HoldExpiryProcessor` expires hold in DB
2. Enqueues `hold_expiring` / post-expiry notification
3. If user still in `hold-countdown` step → next interaction triggers ER-09 via scene guard

---

## 13. Security & rate limiting

| Threat                    | Mitigation                                             |
| ------------------------- | ------------------------------------------------------ |
| Webhook spoofing          | `X-Telegram-Bot-Api-Secret-Token` header validation    |
| Callback tampering        | Validate UUID + ownership before action                |
| Cross-user booking access | Orchestrator verifies `booking.userId === ctx.user.id` |
| Replay updates            | Dedupe `update_id` in Redis (60s TTL)                  |
| Spam                      | Rate limit middleware                                  |
| Oversized callback_data   | Parser rejects > 64 bytes                              |
| Token in messages         | Never send JWT in Telegram messages; use deep links    |

### Authorization matrix

| Action          | Check                                     |
| --------------- | ----------------------------------------- |
| View booking    | Owner OR skip (admin not in consumer bot) |
| Cancel booking  | Owner + `canCancel` from policy           |
| Create booking  | Authenticated user                        |
| Change settings | Authenticated user, own preferences       |

---

## 14. Observability

### Metrics (Prometheus / Grafana)

| Metric                              | Labels                     |
| ----------------------------------- | -------------------------- |
| `telegram_updates_total`            | `type`, `command`          |
| `telegram_handler_duration_ms`      | `handler`, `scene`, `step` |
| `telegram_errors_total`             | `code`                     |
| `telegram_notifications_sent_total` | `type`, `status`           |
| `telegram_active_scenes`            | `scene_id`                 |

### Structured log fields

```
requestId, telegramId, userId, updateType, handler, sceneId, step,
durationMs, errorCode, callbackPrefix
```

### Alerting

| Condition                             | Alert     |
| ------------------------------------- | --------- |
| Error rate > 5% over 5m               | PagerDuty |
| Webhook 5xx                           | PagerDuty |
| Notification delivery fail rate > 10% | Slack     |
| Redis session errors                  | PagerDuty |

---

## 15. Phased rollout

| Phase  | Milestone | Deliverables                                                                              |
| ------ | --------- | ----------------------------------------------------------------------------------------- |
| **P0** | M2        | `/start`, `/help`, `/book` football scene, `/bookings`, `/cancel`, webhook, Redis session |
| **P1** | M3        | Payment failure notifications, checkout deep links                                        |
| **P2** | M5        | `/settings`, reminder notifications (24h/1h), hold expiry warnings                        |
| **P3** | M5        | Mini App deep links in messages, `initData` auth cross-link                               |
| **P4** | M7+       | Salon/restaurant scene branches, multi-vertical category step                             |

### P0 acceptance criteria (from roadmap)

- [ ] No handler file exceeds 30 lines
- [ ] Session stored in Redis, survives process restart
- [ ] User completes football booking end-to-end in bot
- [ ] Webhook registered in production
- [ ] All user actions logged with requestId
- [ ] ER-08 and ER-09 states handled with recovery UX

---

## Appendix A — Orchestrator public API

`TelegramOrchestratorService` is the **single entry point** for handlers:

| Method                                  | Used by            |
| --------------------------------------- | ------------------ |
| `handleStart(ctx, payload?)`            | `/start`           |
| `linkTelegramUser(ctx)`                 | auth middleware    |
| `listUpcomingBookings(ctx, page)`       | `/bookings`        |
| `getBookingDetail(ctx, bookingId)`      | detail scene       |
| `searchBusinesses(ctx, category, page)` | booking step       |
| `listServices(ctx, businessId)`         | booking step       |
| `getAvailableSlots(ctx, draft, date)`   | booking step       |
| `createHold(ctx, draft, slot)`          | booking step       |
| `confirmBooking(ctx, draft)`            | booking step       |
| `cancelBooking(ctx, bookingId, reason)` | detail scene       |
| `releaseHold(ctx, holdId)`              | `/cancel`, timeout |
| `updateNotificationPrefs(ctx, prefs)`   | settings scene     |
| `mapServiceError(error)`                | All handlers       |

---

## Appendix B — Environment variables

| Variable                    | Required | Purpose                   |
| --------------------------- | -------- | ------------------------- |
| `TELEGRAM_BOT_TOKEN`        | Yes      | Bot API token             |
| `TELEGRAM_BOT_USERNAME`     | Yes      | Deep links, Login widget  |
| `TELEGRAM_WEBHOOK_SECRET`   | Prod     | Webhook validation        |
| `TELEGRAM_WEBHOOK_URL`      | Prod     | Registered webhook URL    |
| `REDIS_HOST` / `REDIS_PORT` | Yes      | Session + rate limit      |
| `FRONTEND_URL`              | Yes      | Mini App / web deep links |

---

_Aligned with `.cursor/rules/telegram.mdc`, `docs/API.md`, `docs/BACKEND_ARCHITECTURE.md`, and M5 roadmap issues._

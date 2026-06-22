# Rezerva UI Component Inventory

**Design system:** Apple-inspired minimal · 8px grid · Rounded XL · Geist Sans · Primary `#2563EB`  
**Stack:** shadcn/ui · Tailwind CSS 4 · Lucide icons · Framer Motion (micro-interactions)  
**Location convention:** Primitives in `shared/components/ui/` · Composites in `shared/components/` or `features/*/components/`

This document inventories every UI component: variants, states, props contract, accessibility, and usage context. No implementation code.

---

## Table of contents

1. [Design tokens](#1-design-tokens)
2. [Component index](#2-component-index)
3. [Buttons](#3-buttons)
4. [Inputs](#4-inputs)
5. [Cards](#5-cards)
6. [Calendar](#6-calendar)
7. [Booking Card](#7-booking-card)
8. [Venue Card](#8-venue-card)
9. [Rating](#9-rating)
10. [Search](#10-search)
11. [Navbar](#11-navbar)
12. [Sidebar](#12-sidebar)
13. [Modal](#13-modal)
14. [Toast](#14-toast)
15. [Loading](#15-loading)
16. [Empty States](#16-empty-states)
17. [Skeletons](#17-skeletons)
18. [Appendix — Bottom sheets & dialogs](#18-appendix--bottom-sheets--dialogs)

---

## 1. Design tokens

| Token                  | Light     | Dark      | Usage                   |
| ---------------------- | --------- | --------- | ----------------------- |
| `--primary`            | `#2563EB` | `#3B82F6` | CTAs, links, active nav |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary         |
| `--background`         | `#FFFFFF` | `#0A0A0A` | Page background         |
| `--foreground`         | `#171717` | `#FAFAFA` | Body text               |
| `--muted`              | `#F5F5F5` | `#262626` | Subtle backgrounds      |
| `--muted-foreground`   | `#737373` | `#A3A3A3` | Secondary text          |
| `--destructive`        | `#DC2626` | `#EF4444` | Cancel, delete, errors  |
| `--success`            | `#16A34A` | `#22C55E` | Confirmed, paid         |
| `--warning`            | `#D97706` | `#F59E0B` | Hold expiring, pending  |
| `--border`             | `#E5E5E5` | `#404040` | Dividers, inputs        |
| `--radius-xl`          | `12px`    | `12px`    | Cards, modals           |
| `--radius-2xl`         | `16px`    | `16px`    | Bottom sheets           |
| Spacing unit           | `8px`     | `8px`     | All padding/margins     |

Typography scale: `text-xs` (12) · `text-sm` (14) · `text-base` (16) · `text-lg` (18) · `text-xl` (20) · `text-2xl` (24) · `text-3xl` (30).

---

## 2. Component index

| Component             | File path                                               | Type      | Milestone |
| --------------------- | ------------------------------------------------------- | --------- | --------- |
| Button                | `shared/components/ui/button.tsx`                       | Primitive | M0        |
| IconButton            | `shared/components/ui/icon-button.tsx`                  | Primitive | M0        |
| Input                 | `shared/components/ui/input.tsx`                        | Primitive | M0        |
| PhoneInput            | `features/auth/components/phone-input.tsx`              | Composite | M0        |
| OtpInput              | `features/auth/components/otp-input.tsx`                | Composite | M0        |
| Card                  | `shared/components/ui/card.tsx`                         | Primitive | M0        |
| Calendar              | `shared/components/ui/calendar.tsx`                     | Primitive | M2        |
| AvailabilityCalendar  | `features/booking/components/availability-calendar.tsx` | Composite | M2        |
| BookingCard           | `features/booking/components/booking-card.tsx`          | Composite | M2        |
| VenueCard             | `features/search/components/venue-card.tsx`             | Composite | M2        |
| BusinessCard          | `features/search/components/business-card.tsx`          | Composite | M2        |
| Rating                | `shared/components/ui/rating.tsx`                       | Primitive | M4        |
| RatingStars           | `features/review/components/rating-stars.tsx`           | Composite | M4        |
| SearchBar             | `features/search/components/search-bar.tsx`             | Composite | M2        |
| FilterSheet           | `features/search/components/filter-sheet.tsx`           | Composite | M4        |
| ConsumerHeader        | `shared/components/layout/consumer-header.tsx`          | Composite | M0        |
| MobileTabBar          | `shared/components/navigation/mobile-tab-bar.tsx`       | Composite | M0        |
| BusinessSidebar       | `features/business/components/business-sidebar.tsx`     | Composite | M1        |
| AdminSidebar          | `features/admin/components/admin-sidebar.tsx`           | Composite | M10       |
| Dialog                | `shared/components/ui/dialog.tsx`                       | Primitive | M0        |
| Sheet                 | `shared/components/ui/sheet.tsx`                        | Primitive | M0        |
| Drawer                | `shared/components/ui/drawer.tsx`                       | Primitive | M2        |
| Toast                 | `shared/components/ui/sonner.tsx`                       | Primitive | M0        |
| Spinner               | `shared/components/ui/spinner.tsx`                      | Primitive | M0        |
| EmptyState            | `shared/components/feedback/empty-state.tsx`            | Composite | M0        |
| Skeleton              | `shared/components/ui/skeleton.tsx`                     | Primitive | M0        |
| _…see sections below_ |                                                         |           |           |

**Legend:** Primitive = shadcn base · Composite = domain-specific assembly

---

## 3. Buttons

### 3.1 `Button`

**Path:** `shared/components/ui/button.tsx`  
**Base:** shadcn Button + CVA variants

| Variant       | Visual              | Use case                        |
| ------------- | ------------------- | ------------------------------- |
| `default`     | Filled primary blue | Primary CTA: Book, Confirm, Pay |
| `secondary`   | Filled muted gray   | Secondary actions: View details |
| `outline`     | Border only         | Tertiary: Filter, Sort          |
| `ghost`       | No background       | Toolbar, icon-adjacent text     |
| `destructive` | Red fill            | Cancel booking, Delete resource |
| `link`        | Underline text      | Inline navigation               |

| Size      | Height | Padding | Use case                 |
| --------- | ------ | ------- | ------------------------ |
| `sm`      | 32px   | 12px    | Compact lists, tables    |
| `default` | 40px   | 16px    | Standard forms           |
| `lg`      | 48px   | 24px    | Mobile sticky footer CTA |
| `icon`    | 40×40  | —       | Icon-only actions        |

**States:** default · hover · active · focus-visible (ring) · disabled · loading (spinner replaces label)

**Props contract:**

| Prop                     | Type       | Notes                    |
| ------------------------ | ---------- | ------------------------ |
| `variant`                | enum       | See table                |
| `size`                   | enum       | See table                |
| `loading`                | boolean    | Disables + shows Spinner |
| `fullWidth`              | boolean    | `w-full` on mobile CTAs  |
| `leftIcon` / `rightIcon` | LucideIcon | 16px inline              |
| `asChild`                | boolean    | Slot for Link wrapper    |

**Accessibility:** Native `<button>` or `role="button"`; `aria-busy` when loading; min touch target 44×44 on mobile.

**Used in:** All flows — booking confirm (C-38), login (C-50), checkout (C-40), onboarding (B-04+).

---

### 3.2 `IconButton`

**Path:** `shared/components/ui/icon-button.tsx`

| Variant   | Use case               |
| --------- | ---------------------- |
| `default` | Favorite toggle (C-55) |
| `ghost`   | Close, back, menu      |
| `outline` | Map zoom controls      |

**States:** Same as Button + `pressed` for toggles (`aria-pressed`).

---

### 3.3 `ButtonGroup`

**Path:** `shared/components/ui/button-group.tsx`

Horizontal group for slot grid time pills, party size selector (C-35). Single selection (`role="radiogroup"`).

---

### 3.4 `StickyFooter`

**Path:** `shared/components/layout/sticky-footer.tsx`

Fixed bottom bar with primary CTA + optional secondary. Safe-area inset for iOS. Used in booking flow (C-30–C-38).

| Slot  | Content        |
| ----- | -------------- |
| Left  | Price summary  |
| Right | Primary Button |

---

## 4. Inputs

### 4.1 `Input`

**Path:** `shared/components/ui/input.tsx`

| Variant   | Use case                       |
| --------- | ------------------------------ |
| `default` | Text, email, name              |
| `search`  | Left search icon, clear button |

**States:** default · focus · error (red border + message) · disabled · read-only

**Props contract:**

| Prop                       | Notes                      |
| -------------------------- | -------------------------- |
| `label`                    | Associated Label component |
| `error`                    | Error message string       |
| `hint`                     | Helper text below          |
| `leftAddon` / `rightAddon` | Icons, prefixes            |

**Accessibility:** `<label htmlFor>` · `aria-invalid` · `aria-describedby` for error/hint.

---

### 4.2 `PhoneInput`

**Path:** `features/auth/components/phone-input.tsx`

| Feature    | Detail             |
| ---------- | ------------------ |
| Prefix     | Fixed `+998` badge |
| Mask       | `XX XXX XX XX`     |
| Validation | E.164 on blur      |

Used: C-50 login, staff invite (B-settings).

---

### 4.3 `OtpInput`

**Path:** `features/auth/components/otp-input.tsx`

| Feature  | Detail                      |
| -------- | --------------------------- |
| Cells    | 6 separate inputs           |
| Behavior | Auto-advance, paste support |
| Timer    | Resend countdown (60s)      |

Used: C-51 verify.

---

### 4.4 `Textarea`

**Path:** `shared/components/ui/textarea.tsx`

Booking notes, review comment (C-59), dispute notes. Max length indicator.

---

### 4.5 `Select`

**Path:** `shared/components/ui/select.tsx`

District picker, category filter, business role selector. Native-feel on mobile via Sheet fallback.

---

### 4.6 `Checkbox` / `Switch`

**Paths:** `shared/components/ui/checkbox.tsx`, `switch.tsx`

Notification preferences (C-57), onboarding policies acceptance, multi-service selector (BS-04).

---

### 4.7 `FormField`

**Path:** `shared/components/ui/form.tsx`

React Hook Form wrapper: Label + Control + Error + Hint. Used across all forms.

---

## 5. Cards

### 5.1 `Card`

**Path:** `shared/components/ui/card.tsx`

| Part          | Purpose                      |
| ------------- | ---------------------------- |
| `CardHeader`  | Title + description + action |
| `CardContent` | Main body                    |
| `CardFooter`  | Actions row                  |

**Variants:**

| Variant       | Visual                               |
| ------------- | ------------------------------------ |
| `default`     | White/dark bg, border, radius-xl     |
| `elevated`    | Subtle shadow (hover on interactive) |
| `interactive` | Hover scale + cursor pointer         |
| `outline`     | Border only, no fill                 |

---

### 5.2 `CategoryCard`

**Path:** `features/search/components/category-card.tsx`

| Content | Detail                    |
| ------- | ------------------------- |
| Icon    | Category illustration     |
| Label   | Football, Salon, etc.     |
| Size    | Square, 2-col mobile grid |

Used: C-01 homepage, C-02 category landing.

---

### 5.3 `ServiceCard`

**Path:** `features/booking/components/service-card.tsx`

| Content   | Detail                       |
| --------- | ---------------------------- |
| Name      | Service title                |
| Duration  | e.g. "2 soat"                |
| Price     | Formatted UZS                |
| Selection | Radio/check border highlight |

Used: C-31, BS-04 service selector.

---

### 5.4 `PaymentMethodCard`

**Path:** `features/payment/components/payment-method-card.tsx`

Payme / Click / Pay-at-venue logos. Selected state with primary border. Used: C-40, BS-07.

---

### 5.5 `StatCard`

**Path:** `features/business/components/stat-card.tsx`

Dashboard metric: label, value, trend arrow. Used: B-20, A-02.

---

## 6. Calendar

### 6.1 `Calendar`

**Path:** `shared/components/ui/calendar.tsx`

**Base:** shadcn Calendar (react-day-picker)

| Mode     | Use case                  |
| -------- | ------------------------- |
| `single` | Pick booking date (C-33)  |
| `range`  | Hotel check-in/out (C-36) |

**Props contract:**

| Prop        | Notes                           |
| ----------- | ------------------------------- |
| `disabled`  | Past dates, blocked dates       |
| `modifiers` | Highlight available/unavailable |
| `locale`    | uz / ru / en week start         |

---

### 6.2 `AvailabilityCalendar`

**Path:** `features/booking/components/availability-calendar.tsx`

Horizontal scroll week strip OR month grid with availability dots.

| State     | Visual          |
| --------- | --------------- |
| Available | Default         |
| Limited   | Amber dot       |
| Full      | Muted, disabled |
| Selected  | Primary ring    |

Used: C-33 booking date step.

---

### 6.3 `SlotPicker` / `SlotGrid`

**Paths:** `features/booking/components/slot-picker.tsx`, `slot-grid.tsx`

| Layout        | Breakpoint |
| ------------- | ---------- |
| 2-column grid | Mobile     |
| 3–4 column    | Desktop    |

Each slot pill shows time + price. States: available · selected · unavailable · loading (L-07).

Used: C-33, ER-08 (retry state).

---

### 6.4 `CalendarDayView` / `CalendarWeekView`

**Paths:** `features/business/components/calendar-day-view.tsx`, `calendar-week-view.tsx`

Business dashboard resource timeline. Rows = resources, columns = time. Booking blocks color-coded by status.

Used: B-22, B-23.

---

### 6.5 `DateRangePicker`

**Path:** `features/booking/components/date-range-picker.tsx`

Dual calendar for hotel stays. Shows night count + total. Used: C-36, BS-14.

---

## 7. Booking Card

### 7.1 `BookingCard`

**Path:** `features/booking/components/booking-card.tsx`

**Used:** C-52 my bookings list, B-21 inbox, Telegram /bookings.

| Section | Content                           |
| ------- | --------------------------------- |
| Header  | Business name + StatusBadge       |
| Body    | Date/time, venue, service summary |
| Footer  | Reference code, price, chevron    |

**Variants:**

| Variant    | Context                    |
| ---------- | -------------------------- |
| `compact`  | List item, single row meta |
| `default`  | Standard card              |
| `expanded` | Include thumbnail          |

**States by booking status:**

| Status             | Badge color       | Icon          |
| ------------------ | ----------------- | ------------- |
| `confirmed`        | success green     | Check         |
| `pending_payment`  | warning amber     | Clock         |
| `pending_approval` | warning amber     | Hourglass     |
| `checked_in`       | primary blue      | UserCheck     |
| `completed`        | muted gray        | CheckCheck    |
| `cancelled`        | destructive red   | X             |
| `no_show`          | destructive muted | AlertTriangle |

**Interactive:** Tap → navigate to detail (C-53) or open DR-01 drawer (business).

---

### 7.2 `StatusBadge`

**Path:** `features/booking/components/status-badge.tsx`

Pill badge mapped from `BookingStatus` enum. i18n labels.

---

### 7.3 `BookingTimeline`

**Path:** `features/booking/components/booking-timeline.tsx`

Vertical stepper of status history. Used: C-53 detail.

---

### 7.4 `HoldBanner`

**Path:** `features/booking/components/hold-banner.tsx`

Sticky warning bar: "Slot reserved" + CountdownTimer. Used: C-33–C-38, ER-09.

---

### 7.5 `HoldCountdown`

**Path:** `features/booking/components/hold-countdown.tsx`

MM:SS countdown. `aria-live="polite"`. Pulses under 2 min. Used with HoldBanner.

---

### 7.6 `BookingStepper`

**Path:** `features/booking/components/booking-stepper.tsx`

4-step horizontal progress: Service → Date → Slot → Confirm. Used: C-30–C-38.

---

## 8. Venue Card

### 8.1 `VenueCard` / `BusinessCard`

**Path:** `features/search/components/venue-card.tsx` (alias `BusinessCard`)

**Used:** C-01, C-03 search, C-04 map list, C-55 favorites, map popover.

| Section | Content                                  |
| ------- | ---------------------------------------- |
| Image   | Cover 16:9, lazy load, fallback gradient |
| Badge   | Featured · Open now · Category           |
| Title   | Business name, 1 line truncate           |
| Meta    | District · distance · price from         |
| Rating  | RatingStars + review count               |
| Action  | FavoriteButton (heart overlay)           |

**Variants:**

| Variant    | Layout                           |
| ---------- | -------------------------------- |
| `grid`     | Vertical card, full width mobile |
| `list`     | Horizontal thumb + content       |
| `map`      | Compact for map sidebar          |
| `featured` | Larger, carousel slide (C-01)    |

**States:** default · hover (elevated shadow) · skeleton (L-04) · favorited (filled heart).

---

### 8.2 `FeaturedCarousel`

**Path:** `features/search/components/featured-carousel.tsx`

Horizontal snap scroll of featured VenueCards. Used: C-01.

---

## 9. Rating

### 9.1 `RatingStars`

**Path:** `features/review/components/rating-stars.tsx`

| Mode      | Use case                           |
| --------- | ---------------------------------- |
| `display` | Read-only, half-star support (4.7) |
| `input`   | Interactive 1–5 selection (C-59)   |

**Sizes:** `sm` (14px) · `md` (18px) · `lg` (24px)

**Accessibility:** Input mode uses `role="slider"` or radio group; display uses `aria-label="4.7 out of 5"`.

---

### 9.2 `RatingSummary`

**Path:** `features/review/components/rating-summary.tsx`

Average score + bar distribution (5→1). Used on business profile (C-20).

---

### 9.3 `VerifiedBadge`

**Path:** `features/review/components/verified-badge.tsx`

"Verified visit" checkmark on reviews from completed bookings.

---

## 10. Search

### 10.1 `SearchBar`

**Path:** `features/search/components/search-bar.tsx`

| Variant  | Context                      |
| -------- | ---------------------------- |
| `hero`   | Large, homepage C-01         |
| `header` | Compact in ConsumerHeader    |
| `page`   | Full-width on search results |

**Features:** Debounced input · clear button · submit on Enter · optional voice (future).

---

### 10.2 `FilterSheet` (BS-01)

**Path:** `features/search/components/filter-sheet.tsx`

Bottom Sheet on mobile, Sidebar panel on desktop.

| Filter      | Control                        |
| ----------- | ------------------------------ |
| Category    | Chip group                     |
| District    | Select                         |
| Rating min  | Star threshold                 |
| Price range | Dual slider                    |
| Sort        | Radio: rating, distance, price |

Apply / Reset footer buttons. Used: C-03, C-04.

---

### 10.3 `SearchResultsList`

**Path:** `features/search/components/search-results-list.tsx`

Virtualized or paginated list of VenueCards. Empty → E-01. Loading → L-04 grid.

---

### 10.4 `CategoryGrid`

**Path:** `features/search/components/category-grid.tsx`

2×3 grid of CategoryCards. Used: C-01.

---

### 10.5 `CitySelector`

**Path:** `features/geo/components/city-selector.tsx`

Dropdown/chip for Tashkent, Samarkand (M11). Persists to cookie.

---

## 11. Navbar

### 11.1 `ConsumerHeader`

**Path:** `shared/components/layout/consumer-header.tsx`

| Zone   | Desktop                    | Mobile    |
| ------ | -------------------------- | --------- |
| Left   | Logo                       | Logo      |
| Center | SearchBar (compact)        | —         |
| Right  | City · Favorites · Account | Menu icon |

**States:** transparent (hero overlap) · solid (scrolled) · authenticated (avatar) · guest (Login link).

---

### 11.2 `MobileTabBar`

**Path:** `shared/components/navigation/mobile-tab-bar.tsx`

Fixed bottom nav (< md breakpoint):

| Tab      | Icon     | Route       |
| -------- | -------- | ----------- |
| Home     | Home     | `/`         |
| Search   | Search   | `/search`   |
| Bookings | Calendar | `/bookings` |
| Account  | User     | `/account`  |

Active tab: primary color. Hidden during booking flow (StickyFooter replaces).

---

### 11.3 `BusinessTopBar`

**Path:** `features/business/components/business-top-bar.tsx`

Business name · BusinessSwitcher · notifications bell · user menu. Used in `(business)` layout.

---

### 11.4 `MiniAppHeader`

**Path:** `features/mini-app/components/mini-app-header.tsx`

Compact back button + title. Integrates Telegram BackButton. Used: T-01–T-08.

---

### 11.5 `Breadcrumbs`

**Path:** `shared/components/navigation/breadcrumbs.tsx`

Desktop only. Booking flow, admin pages.

---

## 12. Sidebar

### 12.1 `BusinessSidebar`

**Path:** `features/business/components/business-sidebar.tsx`

| Item      | Route                | Roles          |
| --------- | -------------------- | -------------- |
| Dashboard | `/dashboard`         | all            |
| Calendar  | `/calendar`          | all            |
| Bookings  | `/bookings`          | all            |
| Services  | `/catalog/services`  | owner, manager |
| Resources | `/catalog/resources` | owner, manager |
| Analytics | `/analytics`         | owner, manager |
| Payouts   | `/payouts`           | owner          |
| Staff     | `/settings/staff`    | owner          |
| Settings  | `/settings`          | owner, manager |

**Behavior:** Collapsible to icon rail on tablet. Active item primary highlight. Mobile → Sheet overlay.

---

### 12.2 `AdminSidebar`

**Path:** `features/admin/components/admin-sidebar.tsx`

Overview · Verifications · Bookings · Disputes · Featured · Audit. Used: A-02–A-15.

---

### 12.3 `FilterSidebar`

**Path:** `features/search/components/filter-sidebar.tsx`

Desktop inline filters — same fields as FilterSheet (BS-01).

---

## 13. Modal

### 13.1 `Dialog`

**Path:** `shared/components/ui/dialog.tsx`

Centered modal. Desktop-first confirmations.

| Size      | Max width |
| --------- | --------- |
| `sm`      | 400px     |
| `default` | 480px     |
| `lg`      | 640px     |

**Used by:** D-03 cancel booking · D-04/D-05 delete confirm · D-07/D-08/D-09 admin · D-11 payment failed · D-12 leave guard.

---

### 13.2 `Sheet`

**Path:** `shared/components/ui/sheet.tsx`

Slide-over panel from right (desktop) or bottom (mobile).

**Used by:** FilterSheet (BS-01) · ServiceDrawer (B-30) · ResourceDrawer (B-31) · PaymentSheet (BS-07) · QuickBookSheet (BS-12).

---

### 13.3 `Drawer`

**Path:** `shared/components/ui/drawer.tsx`

Mobile-native bottom drawer (vaul). Booking detail DR-01 on business calendar tap.

---

### 13.4 `AlertDialog`

**Path:** `shared/components/ui/alert-dialog.tsx`

Destructive confirmations — no click-outside dismiss. Delete resource, cancel booking.

---

### 13.5 Dialog inventory

| ID   | Component                   | Title (uz)               | Actions                  |
| ---- | --------------------------- | ------------------------ | ------------------------ |
| D-03 | `CancelBookingDialog`       | Bronni bekor qilish      | Cancel / Confirm cancel  |
| D-04 | `DeleteServiceDialog`       | Xizmatni o'chirish       | Cancel / Delete          |
| D-05 | `DeleteResourceDialog`      | Resursni o'chirish       | Cancel / Delete          |
| D-07 | `ApproveVerificationDialog` | Tasdiqlash               | Cancel / Approve         |
| D-08 | `RejectVerificationDialog`  | Rad etish                | Cancel / Reject + reason |
| D-09 | `ResolveDisputeDialog`      | Nizoni hal qilish        | Cancel / Resolve         |
| D-11 | `PaymentFailedDialog`       | To'lov amalga oshmadi    | Retry / Change method    |
| D-12 | `LeaveConfirmDialog`        | Saqlanmagan o'zgarishlar | Stay / Leave             |

---

## 14. Toast

### 14.1 `Toaster` (Sonner)

**Path:** `shared/components/ui/sonner.tsx`

| Variant   | Icon  | Use case                 |
| --------- | ----- | ------------------------ |
| `default` | Info  | Generic feedback         |
| `success` | Check | Booking confirmed, saved |
| `error`   | X     | API failure              |
| `warning` | Alert | Hold expiring soon       |

**Behavior:** Bottom-right desktop · top-center mobile · auto-dismiss 4s · swipe dismiss · max 3 stacked.

**Hook:** `useToast()` from `shared/hooks/use-toast.ts`

**Examples:**

- "Bron tasdiqlandi" — success after confirm
- "Vaqt band" — error ER-08
- "Profil yangilandi" — success after save

---

## 15. Loading

### 15.1 `Spinner`

**Path:** `shared/components/ui/spinner.tsx`

| Size | Use case          |
| ---- | ----------------- |
| `sm` | Inline in Button  |
| `md` | Card center       |
| `lg` | Full-page overlay |

---

### 15.2 `LoadingOverlay`

**Path:** `shared/components/feedback/loading-overlay.tsx`

Semi-transparent backdrop + Spinner + optional message. Payment processing (ER-22).

---

### 15.3 `PaymentProcessing`

**Path:** `features/payment/components/payment-processing.tsx`

Full-page: Spinner + "To'lov kutilmoqda..." + polling indicator. Used: C-41, ER-22.

---

### 15.4 `Progress`

**Path:** `shared/components/ui/progress.tsx`

Onboarding wizard progress bar (B-04–B-12). Upload progress for media.

---

### 15.5 `PullToRefresh`

**Path:** `shared/components/feedback/pull-to-refresh.tsx`

Client wrapper for bookings list refresh on mobile.

---

## 16. Empty States

### 16.1 `EmptyState`

**Path:** `shared/components/feedback/empty-state.tsx`

| Prop          | Purpose             |
| ------------- | ------------------- |
| `icon`        | Lucide illustration |
| `title`       | Primary message     |
| `description` | Secondary hint      |
| `action`      | Optional Button CTA |

---

### 16.2 Empty state inventory

| ID   | Component alias  | Title (uz)            | CTA                 | Screen |
| ---- | ---------------- | --------------------- | ------------------- | ------ |
| E-01 | `EmptySearch`    | Natija topilmadi      | Filtrlarni tozalash | C-03   |
| E-02 | `EmptyBookings`  | Bronlar yo'q          | Bron qilish         | C-52   |
| E-06 | `EmptyInbox`     | Yangi bronlar yo'q    | —                   | B-21   |
| E-07 | `EmptyServices`  | Xizmatlar yo'q        | Xizmat qo'shish     | B-30   |
| E-08 | `EmptyResources` | Resurslar yo'q        | Resurs qo'shish     | B-31   |
| E-10 | `EmptyAnalytics` | Ma'lumot yetarli emas | —                   | B-50   |
| E-11 | `EmptyPayouts`   | To'lovlar yo'q        | —                   | B-52   |
| E-15 | `EmptySlots`     | Bo'sh jadval          | Boshqa sana         | C-33   |

---

### 16.3 `ErrorState`

**Path:** `shared/components/feedback/error-state.tsx`

Recoverable errors with retry button. Maps ER-\* codes to localized copy.

| Code    | Title             | Action              |
| ------- | ----------------- | ------------------- |
| ER-08   | Vaqt band         | Boshqa slot tanlash |
| ER-09   | Vaqt tugadi       | Qayta tanlash       |
| ER-22   | To'lov kutilmoqda | — (polling)         |
| Generic | Xatolik yuz berdi | Qayta urinish       |

---

## 17. Skeletons

### 17.1 `Skeleton`

**Path:** `shared/components/ui/skeleton.tsx`

Base pulsing block. `animate-pulse` on `--muted` background.

---

### 17.2 Skeleton inventory

| ID   | Component                | Layout mimics         |
| ---- | ------------------------ | --------------------- |
| L-04 | `VenueCardSkeleton`      | VenueCard grid item   |
| L-07 | `SlotGridSkeleton`       | 6 slot pills in 2-col |
| L-15 | `AnalyticsChartSkeleton` | Chart + stat row      |

---

### 17.3 Composite skeletons

| Component                  | Path                                                        | Used while loading |
| -------------------------- | ----------------------------------------------------------- | ------------------ |
| `VenueCardSkeleton`        | `shared/components/feedback/venue-card-skeleton.tsx`        | Search results     |
| `BookingCardSkeleton`      | `shared/components/feedback/booking-card-skeleton.tsx`      | Bookings list      |
| `BusinessProfileSkeleton`  | `shared/components/feedback/business-profile-skeleton.tsx`  | C-20               |
| `SlotGridSkeleton`         | `features/booking/components/slot-grid-skeleton.tsx`        | C-33               |
| `FeaturedCarouselSkeleton` | `features/search/components/featured-carousel-skeleton.tsx` | C-01               |
| `CalendarSkeleton`         | `features/business/components/calendar-skeleton.tsx`        | B-22               |
| `FormSkeleton`             | `shared/components/feedback/form-skeleton.tsx`              | Onboarding step    |

**Rule:** Skeleton layout must match final component dimensions to prevent layout shift (CLS).

---

## 18. Appendix — Bottom sheets & dialogs

### Bottom sheet inventory (BS-\*)

| ID    | Component               | Purpose                  |
| ----- | ----------------------- | ------------------------ |
| BS-01 | `FilterSheet`           | Search filters           |
| BS-02 | `SortSheet`             | Sort options             |
| BS-04 | `ServiceSelectorSheet`  | Multi-service salon pick |
| BS-07 | `PaymentSheet`          | Payment method selection |
| BS-12 | `QuickBookSheet`        | Business walk-in booking |
| BS-14 | `RoomTypeSheet`         | Hotel room type picker   |
| BS-15 | `GuestCountSheet`       | Hotel guest count        |
| BS-16 | `IntakeFormSheet`       | Clinic intake fields     |
| BS-17 | `DepositExplainerSheet` | Restaurant deposit info  |

---

### Badge & chip primitives

| Component | Path                              | Use                    |
| --------- | --------------------------------- | ---------------------- |
| `Badge`   | `shared/components/ui/badge.tsx`  | Status, category, new  |
| `Chip`    | `shared/components/ui/chip.tsx`   | Filter tags, removable |
| `Avatar`  | `shared/components/ui/avatar.tsx` | User, business logo    |

---

### Avatar & media

| Component           | Path                                              | Use                       |
| ------------------- | ------------------------------------------------- | ------------------------- |
| `ImageWithFallback` | `shared/components/ui/image-with-fallback.tsx`    | Venue cover, gallery      |
| `Gallery`           | `features/business/components/gallery.tsx`        | Business profile carousel |
| `QRCodeDisplay`     | `features/booking/components/qr-code-display.tsx` | C-42, C-53                |

---

### Implementation priority

| Phase   | Components to build                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| **M0**  | Button, Input, PhoneInput, OtpInput, Card, Dialog, Toast, Skeleton, EmptyState, ConsumerHeader, MobileTabBar |
| **M2**  | VenueCard, BookingCard, Calendar, SlotGrid, HoldBanner, HoldCountdown, BookingStepper, Drawer, StickyFooter  |
| **M3**  | PaymentMethodCard, PaymentProcessing, PaymentFailedDialog                                                    |
| **M4**  | RatingStars, FilterSheet, RatingSummary, FavoriteButton                                                      |
| **M5**  | NotificationInbox, MiniAppHeader                                                                             |
| **M6**  | BusinessSidebar, CalendarDayView, QuickBookSheet, StatCard                                                   |
| **M10** | AdminSidebar, DocumentPreview                                                                                |

---

### shadcn components to install

```
button input label card dialog sheet drawer alert-dialog
select checkbox switch textarea form badge avatar skeleton
calendar progress tabs separator dropdown-menu popover sonner
scroll-area tooltip collapsible sidebar command
```

---

_Aligned with `.cursor/rules/ui.mdc`, `docs/FRONTEND_ARCHITECTURE.md`, and Rezerva roadmap screen IDs (C-_, B-_, E-_, L-_, D-_, BS-_)._

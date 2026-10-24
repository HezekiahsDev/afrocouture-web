# AfroCouture AI — Product & Implementation Plan

_Last updated: 2026-10-24. This document describes what is built, how it is deployed, and what comes next.
Detailed API contracts for orders, payments, chat and AI Studio live in
`afrocouture-api/docs/orders-payments-ai-contract.md`; the visual language lives in `docs/DESIGN.md`._

## Goal

A marketplace for bespoke African fashion that connects three groups:

- **Customers** — commission garments from verified artisans, buy fabric, keep a fit profile.
- **Artisans (tailors)** — get verified, receive commissions, get paid through escrow.
- **Fabric merchants** — get verified, list fabric (with wholesale price breaks), ship to artisans, get paid through escrow.

### Content principle

Every claim on the site must be true and backed by data or a working feature. No invented statistics, badges,
"AI precision" numbers, biometric/liveness claims or escrow promises before the escrow exists. Sample catalogue
data is allowed only when flagged `isSample` and labelled as illustrative in the UI; it is never shown as verified.

## Stack & hosting

| Layer       | Technology                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web         | Next.js 16 (App Router, Cache Components, Turbopack) · TypeScript · Tailwind CSS 4 · `next/font` (Plus Jakarta Sans + Inter)                                                                      |
| API         | NestJS 12 · TypeORM 0.3 · PostgreSQL 16 · Redis 7 · Socket.IO                                                                                                                                     |
| Auth        | Email + password; sign-up verified by a 6-digit emailed code; JWT access + rotating refresh tokens (sha256-hashed in Postgres)                                                                    |
| Email       | SMTP via nodemailer (same `MAIL_*` setup as dali-be); console output when `MAIL_HOST` is empty                                                                                                    |
| Files       | Cloudinary, uploaded through `POST /uploads` (purpose-scoped, 10 MB)                                                                                                                              |
| Payments    | Paystack — transactions into platform escrow, transfers out to artisans/merchants, refunds                                                                                                        |
| AI images   | Google Vertex AI Imagen, results stored on Cloudinary                                                                                                                                             |
| Web hosting | Vercel — https://afrocouture.vercel.app (also afrocouture-web.vercel.app)                                                                                                                         |
| API hosting | VPS `164.68.103.109`: NestJS under PM2 (port 3001) behind nginx + Let's Encrypt at https://afrocouture-api.alcance.ng; Postgres (`127.0.0.1:5437`) and Redis (`127.0.0.1:6384`) in Docker Compose |

## Repositories

```
stitch_design_iteration_workspace/
├── afrocouture-web/   # Next.js app (Vercel)          docs/: PLAN.md, DESIGN.md
└── afrocouture-api/   # NestJS API (VPS, pnpm deploy) docs/: orders-payments-ai-contract.md
```

## Decisions log

| Decision          | Choice                                                                                                                                                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-up / sign-in | Email OTP verification on sign-up; email + password sign-in; forgot-password by emailed code                                                                                                                                                                                                                                    |
| Roles             | customer · tailor · merchant (self-service, switchable) · admin (created with `pnpm admin:create`)                                                                                                                                                                                                                              |
| Verification      | Artisan KYC and merchant verification are submitted for **admin review** (draft → pending → approved / rejected with a reason emailed to the applicant)                                                                                                                                                                         |
| Payments & escrow | **Paystack now.** Customer pays the full quote into platform escrow; merchant payouts release when the artisan confirms the fabric arrived; artisan payout releases when the customer approves delivery (auto-approve after `AUTO_APPROVE_DAYS`, default 7); disputes are resolved by an admin (release or full/partial refund) |
| Platform fee      | `PLATFORM_FEE_PERCENT` (default 0), shown as its own line and charged to the customer                                                                                                                                                                                                                                           |
| Schema changes    | Migrations only (`synchronize` off everywhere)                                                                                                                                                                                                                                                                                  |
| Sample data       | `pnpm seed` / `pnpm seed --remove`; flagged `isSample`, never verified, cannot receive orders                                                                                                                                                                                                                                   |
| AI Studio         | Vertex AI Imagen, per-user daily limit (`AI_DAILY_LIMIT`), safety filter on, watermark on                                                                                                                                                                                                                                       |
| Abuse protection  | Redis-backed rate limits on sign-in, sign-up, code and reset endpoints, uploads and AI generation                                                                                                                                                                                                                               |
| Mobile            | Its own phase (Phase 7), after the web product is complete                                                                                                                                                                                                                                                                      |

## What exists today

### Pages (web)

| Route                                                     | Purpose                                                                               | Status                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/marketplace`                                            | Discover: styles, artisans, fabrics from the API; search `?q=`; city/category filters | Done                                               |
| `/tailors`                                                | Artisan directory with city filter and saving                                         | Done, with commission CTA                          |
| `/fabric-explorer`                                        | Fabric catalogue + detail, quantity stepper, add to selection                         | Done, with wholesale tier pricing                  |
| `/saved`                                                  | Your selection: saved fabrics (quantities, estimated total) and artisans              | Done                                               |
| `/onboarding`                                             | Choose customer / artisan / merchant                                                  | Done                                               |
| `/onboarding/fit-profile`                                 | Measurements (in/cm), fit preference, reference photos, delivery address              | Done                                               |
| `/onboarding/tailor-kyc`                                  | Artisan profile, identity, guild (optional), payout account; submit for review        | Done, with Paystack bank list + account-name check |
| `/onboarding/merchant-verification`                       | Business, CAC, quality declaration, payout account; submit for review                 | Done (same)                                        |
| `/signup`, `/verify-email`, `/signin`, `/forgot-password` | Accounts                                                                              | Done                                               |

### API (summary)

Auth (`/auth/register`, `/verify-email`, `/resend-verification`, `/login`, `/refresh`, `/logout`, `/forgot-password`,
`/reset-password`, `/me`) · users (`PATCH /users/me`, `/users/me/role`) · uploads · tailors (public list/detail,
`/tailors/me/profile`, `/tailors/me/submit`) · merchants (`/merchants/me/profile`, `/submit`) · fabrics (public list,
categories, detail; merchant `mine`/create/update/delete) · styles · saved items · measurements (`/measurements/me`) ·
admin verification queue and review. Full list: `afrocouture-api/README.md`.

### Data model

`users`, `otps`, `tailor_profiles`, `merchant_profiles`, `fabrics`, `styles`, `saved_items`, `customer_fit_profiles`
(+ Phase 4–5: `orders`, `order_items`, `order_events`, `escrow_transactions`, `chat_messages`, `ai_designs`).
Entities in `afrocouture-api/src/**/entities` are the source of truth.

## Roadmap

### Phase 1 — Foundation ✅

Repos, Docker Compose (Postgres + Redis), NestJS + Next.js scaffolds, design tokens, UI primitives, API client.

### Phase 2 — Accounts & onboarding ✅

OTP sign-up, sign-in, password reset, roles; fit profile; artisan KYC and merchant verification with admin review;
Cloudinary uploads; migrations; seed; admin creation script.

### Phase 3 — Marketplace ✅

Marketplace, artisan directory, fabric explorer and selection on live data; account-aware navigation; honest copy.
Deployed: web on Vercel, API on the VPS behind nginx/HTTPS.

### Phase 4 — Commissions, payments & chat ✅ (deployed)

- [x] Orders API: request → quote/decline → pay (Paystack) → milestones (Placed → Cutting → Fitting → Delivery) → deliver → approve / dispute
- [x] Escrow ledger, merchant payouts on fabric receipt, artisan payout on approval, auto-approve job, refunds
- [x] Paystack: initialize/verify, signed webhook, bank list, account-name resolution, transfer recipients, transfers, refunds
- [x] Real-time order chat (Socket.IO `/chat`) with system messages for every order event
- [x] Wholesale price tiers on fabrics (merchant-defined), applied in the explorer and at order time
- [x] Web: commission request from an artisan (fabrics from selection, fit profile, brief, references), `/orders`, `/orders/[id]` (tracker, escrow summary, Paystack checkout, chat, actions per role), payment callback page
- [x] Web: merchant fabric management (`/merchant/fabrics`) with price tiers; merchant shipping view
- [x] Web: Paystack bank picker + automatic account-name check in KYC and merchant forms
- [x] Admin web: verification review, disputes, failed payouts (`/admin`)
- [x] Rate limiting (Redis) on auth, uploads and AI

### Phase 5 — AI Design Studio ⏸ (built; deferred until Vertex credentials are ready)
While `NEXT_PUBLIC_AI_STUDIO_ENABLED` is unset, `/ai-studio` shows "coming soon", the nav shows a "Soon" badge, and the
Discover idea box opens a commission with the idea as the brief, where customers upload photos of the style they want.
To launch: set the Vertex env on the API, set `NEXT_PUBLIC_AI_STUDIO_ENABLED=true` on Vercel, redeploy the web.

- [x] `/ai-studio`: prompt + garment/occasion/fabric/colour chips → up to 4 Imagen variations; history and saved designs; daily quota display
- [x] "Commission this design" → order request with the design attached

### Phase 6 — Hardening

- [ ] API integration tests in the repo (the end-to-end scripts used during development move into `test/`)
- [ ] Observability (structured logs, error alerts), backups for Postgres
- [ ] Reviews & ratings on artisan profiles from completed orders
- [ ] Notifications centre (in-app) in addition to email

### Phase 7 — Mobile (Defer)

React Native app reusing the API; designs from the original Stitch mobile exports.

## Running & deploying

- **Local:** see `afrocouture-api/README.md` (Docker Compose, `pnpm migration:run`, `pnpm seed`, `pnpm start:dev`) and
  `afrocouture-web` (`pnpm dev`, `NEXT_PUBLIC_API_URL`).
- **API deploy:** `pnpm deploy` (commits, pushes, builds locally, uploads `dist` and `.env`, restarts PM2). Then on the server:
  `pnpm migration:run` when a release contains migrations.
- **Web deploy:** `vercel deploy --prod` from `afrocouture-web` (updates both Vercel URLs).
- **New env for Phase 4–5:** `PAYSTACK_SECRET_KEY`, `PAYMENT_CALLBACK_URL`, `PLATFORM_FEE_PERCENT`, `AUTO_APPROVE_DAYS`,
  `VERTEX_AI_PROJECT_ID`, `VERTEX_AI_LOCATION`, `VERTEX_IMAGEN_MODEL`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `AI_DAILY_LIMIT`.
  Paystack dashboard: webhook URL `https://afrocouture-api.alcance.ng/payments/paystack/webhook`; Transfers enabled with
  OTP for transfers turned off (so payouts can be automatic).

## Verification checklist (per release)

1. `afrocouture-api`: `pnpm test`, `pnpm lint`, `pnpm build`; end-to-end scripts against a local Postgres/Redis.
2. `afrocouture-web`: `npx tsc --noEmit`, `pnpm lint`, `pnpm build`; browser checks at 1440 px and 390 px (no horizontal scroll, pages scroll).
3. Flows: sign up as each role → onboarding → admin approval → browse → save → commission → pay (Paystack test mode) → milestones → chat → deliver → approve → payouts; dispute → admin resolution.
4. Copy review against the content principle above.

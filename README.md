# Move to AI

Move to AI is a premium B2B SaaS foundation designed to turn business process
visibility into a prioritized AI opportunity portfolio. The current MVP focuses on:

- a white-first enterprise visual system
- trilingual product shell from day one: English, French, Spanish
- aggressive freemium-to-Pro-to-Enterprise commercial framing
- a clean Next.js + Prisma + Auth.js-ready architecture

## Architecture summary

- `app/(marketing)` contains the acquisition surfaces: landing, pricing, request-demo, legal placeholders
- `app/(auth)` contains localized login and signup
- `app/(app)/app/*` contains the authenticated shell under `/app`
- `modules/*` contains business-domain modules with isolated `domain/`, `server/`, `ui/`, `model/`, and `tests/` folders when relevant
- `components/brand`, `components/marketing`, `components/navigation`, `components/app`, `components/auth`, `components/ui` contain reusable visual building blocks
- `lib/i18n` contains locale detection and dictionaries
- `prisma/schema.prisma` contains the initial multi-workspace SaaS schema foundation

## Modular monolith architecture

Move to AI stays a single Next.js application, a single Prisma schema, a single MySQL database, and a single deployment unit. The code is being reorganized as a modular monolith:

- `app/` routes stay thin and focus on params, guards, and rendering
- `modules/<domain>/server` contains server-side use cases and query orchestration
- `modules/<domain>/domain` contains pure TypeScript business logic with no React, Prisma, or Next.js imports
- `modules/<domain>/ui` contains domain-specific React components
- `modules/<domain>/model` contains DTOs, filters, and view models
- `server/*` acts as a temporary compatibility layer where needed during migration

Current refactor status:

- `opportunities` is split into dedicated use cases under `modules/opportunities/server`
- scoring rules and badge derivation live under `modules/scoring/domain`
- plan checks and feature gates live under `modules/plans/domain`
- business-structure reads are split into `modules/business-structure/server`

## Project tree

```text
app/
  (marketing)/
    page.tsx
    pricing/page.tsx
    request-demo/page.tsx
    legal/
      privacy/page.tsx
      terms/page.tsx
      cookies/page.tsx
  (auth)/
    login/page.tsx
    signup/page.tsx
  onboarding/
    page.tsx
    process-focus/page.tsx
  (app)/
    app/
      layout.tsx
      page.tsx
      domains/
        page.tsx
        [id]/page.tsx
      opportunities/page.tsx
      processes/
        page.tsx
        [id]/page.tsx
      portfolio/page.tsx
      value/page.tsx
      governance/page.tsx
      analytics/page.tsx
      settings/page.tsx
  api/auth/[...nextauth]/route.ts
  globals.css
  layout.tsx
components/
  app/
  auth/
  brand/
  layout/
  i18n/
  marketing/
  navigation/
  providers/
  shared/
  ui/
modules/
  auth/
    model/
  workspace/
    model/
  business-structure/
    model/
    server/
  opportunities/
    model/
    server/
    ui/
  scoring/
    domain/
    model/
    tests/
  portfolio/
    model/
    server/
    ui/
  governance/
    model/
    server/
    ui/
  value-tracking/
    model/
    server/
    ui/
  plans/
    domain/
    model/
    ui/
  ai-assistant/
    model/
  shared/
    model/
lib/
  auth.ts
  design-tokens.ts
  navigation.ts
  prisma.ts
  scoring.ts
  utils.ts
  i18n/
prisma/
  schema.prisma
server/
  auth.ts
  business-structure.ts
  opportunities.ts
Dockerfile
docker-compose.yml
deploy/nginx/movetoai.conf.example
```

## Install and local startup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```powershell
Copy-Item .env.example .env
```

3. Start MySQL:

```bash
docker compose up -d mysql
```

4. Push the Prisma schema:

```bash
npm run prisma:push
```

5. Seed demo data:

```bash
npm run db:seed
```

6. Start the app in development:

```bash
npm run dev
```

Open `http://localhost:3000`.

Development notes:

- `next dev` writes its cache to `.next-dev`
- `next build` keeps using `.next`
- this avoids stale manifest collisions between local dev and production builds on Windows

## Environment variables

Minimum local env values:

```env
DATABASE_URL="mysql://movetoai:movetoai@localhost:3306/movetoai"
PORT="3000"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

Notes:

- `DATABASE_URL` should point to `localhost` for local dev and to `mysql` inside Docker Compose
- keep `AUTH_SECRET` and `NEXTAUTH_SECRET` long and random outside local demo use
- `AUTH_URL` and `NEXTAUTH_URL` should match the public app URL in each environment

## Prisma notes

Useful commands during schema work:

```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:generate
npm run prisma:push
```

After the first migration or `prisma db push`, seed at least:

- `SubscriptionPlan` records for `FREE`, `PRO`, and `ENTERPRISE`
- related `PlanFeature` and `PlanLimit` records for feature gating and quotas
- base `Permission` records
- workspace `Role` records mapped to permissions

## Onboarding behavior

The authenticated onboarding flow now has two lightweight steps:

- `/onboarding` creates the first workspace when a user has no active membership yet
- `/onboarding/process-focus` appears on the first app access after a workspace exists and asks the user to choose exactly 5 existing processes to improve with AI

Process-focus onboarding behavior:

- it loads only processes already stored in the current workspace
- it requires exactly 5 selected processes before continuing
- the selection is stored on the user through a simple join table
- once completed, the user is redirected to `/app` and the step is not shown again
- if the workspace has no processes yet, the empty state CTA completes the step and sends the user to `/app/processes`

After schema changes, apply them locally before trying the new onboarding step:

```bash
npm run prisma:push
```

## Demo seed

To load the commercial demo dataset:

```bash
npm run db:seed
```

`npm run db:seed` reads `.env` when present and falls back to `.env.example` for the local default MySQL URL.

The seed creates:

- 1 demo tenant and 1 demo workspace
- 2 business units
- 8 domains, 20 capabilities, 30 processes
- 50 AI opportunities with scoring, decisions, comments, risks, and compliance checks
- 10 initiatives with milestones and realized value tracking
- plan catalog data for `FREE`, `PRO`, and `ENTERPRISE`
- enterprise quotas plus a seeded `freePreview` limit state for upgrade nudges

## Demo credentials

Shared password for the standard seeded demo users:

```text
MoveToAI!2026
```

Recommended accounts:

- `admin@movetoai.app` - Platform admin
- `emma.collins@movetoai.demo` - Super admin
- `julien.morel@movetoai.demo` - Workspace admin
- `sofia.alvarez@movetoai.demo` - Architect
- `marcus.reed@movetoai.demo` - AI portfolio manager
- `claire.dubois@movetoai.demo` - Business owner
- `liam.chen@movetoai.demo` - Business owner
- `diego.herrera@movetoai.demo` - Reviewer
- `nina.patel@movetoai.demo` - Viewer

Dedicated admin demo user:

```text
admin@movetoai.app / Admin123!
```

## Minimal auth

- `POST /api/auth/signup` creates a Prisma `User` and hashes the password with PBKDF2.
- Auth.js credentials login validates the stored password hash and creates the session.
- [middleware.ts](C:/bluepilot-ai/middleware.ts) protects `/app` and redirects unauthenticated users to `/login`.
- The auth flow stays intentionally small: no advanced RBAC layer and no workspace switching.

## Minimal onboarding

- Logged-in users without an active workspace are redirected from `/app` to `/onboarding`.
- `/onboarding` lets the user create the first workspace only.
- After workspace creation, the user is redirected back to `/app`.
- Logged-in users who already have a workspace go directly to `/app`.

Test flow:

1. Sign up at `/signup`.
2. Log in at `/login`.
3. If the account has no workspace, you are redirected to `/onboarding`.
4. Create the first workspace.
5. You are redirected to `/app`.

## Minimal roles and permissions

System roles:

- `SUPER_ADMIN`
- `WORKSPACE_ADMIN`
- `ARCHITECT`
- `AI_PORTFOLIO_MANAGER`
- `BUSINESS_OWNER`
- `REVIEWER`
- `VIEWER`

Role and permission checks stay server-side in [server/permissions.ts](C:/bluepilot-ai/server/permissions.ts).

Protected routes in this step:

- `/app/domains` requires `business-structure.manage`
- `/app/domains/[id]` requires `business-structure.manage`
- `/app/processes` requires `business-structure.manage`
- `/app/processes/[id]` requires `business-structure.manage`
- `/app/portfolio` requires `opportunities.manage` or `analytics.view`
- `/app/governance` requires `governance.manage` or `analytics.view`
- `/app/value` requires `initiatives.manage` or `analytics.view`
- `/app/settings` requires `settings.manage`

When access is denied, the user is redirected to `/unauthorized`.

## Domains and processes

- `/app/domains` provides a filterable business domain view with capability, process, and opportunity counts.
- `/app/domains/[id]` shows related capabilities, related processes, and an AI opportunity preview.
- `/app/processes` provides a filterable process view with owner, business unit, supporting applications, data sources, pain points, and linked AI opportunities.
- `/app/processes/[id]` adds process context, supporting systems, pain points, linked opportunities, and next-best-action prompts.
- The route pages now consume dedicated server use cases from `modules/business-structure/server`.

## Opportunities

- `/app/opportunities` provides a simple server-rendered table of AI opportunities.
- The list supports lightweight filters for domain, process, and status.
- `/app/opportunities/[id]` shows a clean detail page focused on summary, business context, AI proposal, score, and status.
- Opportunity reads and filter parsing now live under `modules/opportunities/server`.
- Opportunity-specific UI now lives under `modules/opportunities/ui`.

## Portfolio

- `/app/portfolio` provides a lightweight prioritized view of AI opportunities.
- Opportunities are grouped into `Quick Wins`, `Strategic Bets`, and `High Risk`.
- The page uses server-side summary cards plus a simple grouped table to keep the module fast and readable.

## Value tracking

- `/app/value` provides a lightweight initiative value view linked back to opportunities where available.
- Summary cards show total expected value, total realized value, and adoption overview.
- The table shows initiative or opportunity, expected ROI, realized ROI, adoption, and status.
- Value reads and formatting stay isolated under `modules/value-tracking`.

## Scoring

- Scoring rules are isolated under `modules/scoring/domain`.
- The current engine stays intentionally simple: business value, data readiness, technical feasibility, risk, and time to value.
- The reusable output is a score out of 100 plus a priority badge: `QUICK_WIN`, `STRATEGIC_BET`, or `HIGH_RISK`.

## Routes

- `/`
- `/pricing`
- `/request-demo`
- `/login`
- `/signup`
- `/onboarding`
- `/unauthorized`
- `/legal/privacy`
- `/legal/terms`
- `/legal/cookies`
- `/app`
- `/app/portfolio`
- `/app/value`
- `/app/domains`
- `/app/domains/[id]`
- `/app/opportunities`
- `/app/processes`
- `/app/processes/[id]`
- `/app/governance`
- `/app/analytics`
- `/app/settings`

## Internationalization notes

- default locale: English
- fallback locale: English
- supported locales: English, French, Spanish
- browser language is auto-detected when no locale cookie exists
- the language switcher is visible in marketing pages and the app shell
- all visible product copy is sourced from `lib/i18n`

## Docker

Build and start the full local stack:

```bash
docker compose up --build
```

The Compose app container runs `npm run prisma:push` on startup so the schema is applied automatically.

If you also want demo data inside Docker:

```bash
docker compose exec app npm run db:seed
```

## Production-style build and run

Build the app locally:

```bash
npm run build
```

Run the production server locally:

```bash
npm run start
```

## Nginx example

A minimal reverse-proxy example is available in [movetoai.conf.example](C:/bluepilot-ai/deploy/nginx/movetoai.conf.example).
Use it as a starting point in front of the app container or a standalone `npm run start` deployment.

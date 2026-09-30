# Lumora V0

Lumora is a mobile-first personal self-reflection and life-direction system built on the original ImOK Ionic/Angular + Laravel starter.

This V0 is intentionally **AI-free**. There are no LLM calls, prompts, embeddings, vector databases, agents, or semantic-memory services. The product value comes from structured check-ins, goals, explicit user-managed memory, transparent rule-based observations, and weekly reviews.

## What is implemented

- Clerk sign-in/sign-up and the starter's Laravel JWT/webhook integration
- Calm Lumora mobile UI and bottom navigation
- Onboarding with life areas, reflection style, and 1–3 active goals
- Daily check-in with mood, energy, life areas, goal links, energizers, drainers, and notes
- Goals with progress, editing, archiving, and small next-step actions
- Personal memory that is created, edited, pinned, and deleted only by the user
- `InsightEngine` abstraction with a deterministic `RuleBasedInsightEngine`
- Patterns for recurring mood, life-area/state co-occurrence, life-area/energy association, repeated energizers/drainers, goal momentum, and goals needing attention
- Pattern evidence, confidence, and user confirm/dismiss feedback
- Weekly review with check-in frequency, mood distribution, average energy, life areas, energizers/drainers, action counts, goal progress, patterns, and a selected weekly focus
- Check-in and weekly-review history
- Privacy-oriented account UI for inspecting/deleting personal memories and check-ins
- Laravel Nova/admin foundation retained from the starter

## Stack

Frontend: Ionic 9, Angular 22, Capacitor 8, TypeScript, Clerk.

Backend: Laravel 12, SQLite locally / MySQL-ready, Clerk JWT + webhook auth, Laravel Nova 5, Spatie roles.

## Requirements

- Node 22.22.3+ (`.nvmrc` is `22`)
- PHP 8.2+ (the Composer platform is pinned to PHP 8.3.10)
- Composer 2
- A Clerk application
- A Laravel Nova licence/auth token, because the inherited starter includes Nova

## First run

### 1. Frontend

```bash
nvm use 22
npm install
```

Create or use a Clerk development application, then place its publishable key in:

```text
src/environments/environment.ts
```

The value is `clerkPublishableKey`.

Start the PWA:

```bash
npm start
```

Frontend: `http://localhost:4200`

### 2. Backend

```bash
cd laravel
composer config http-basic.nova.laravel.com <nova-email> <nova-license-key>
composer install
cp .env.example .env
php artisan key:generate
```

Fill the Clerk values in `laravel/.env`:

```text
CLERK_PUBLISHABLE_KEY=
CLERK_JWKS_URL=
CLERK_WEBHOOK_SECRET=
```

For local development the database defaults to SQLite. Then:

```bash
php artisan migrate --seed
php artisan serve
```

Backend: `http://localhost:8000`

Nova: `http://localhost:8000/nova`

The frontend development environment should use:

```text
apiUrl: 'http://localhost:8000/api'
```

### 3. Clerk webhook

Configure the Clerk webhook endpoint as:

```text
https://<reachable-api-host>/api/clerk/webhook
```

Subscribe to:

- `user.created`
- `user.updated`
- `user.deleted`

A webhook cannot reach `localhost`, so use a tunnel for local sign-up or point Clerk at a development backend reachable from the internet.

## Core data model

- `life_areas`
- `user_preferences`
- `user_life_areas`
- `goals`
- `checkins`
- `checkin_life_area`
- `checkin_goal`
- `memories`
- `actions`
- `patterns`
- `weekly_reviews`

All product endpoints live behind the existing Clerk middleware and scope records through the authenticated user.

## Rule-based insight architecture

The backend binds:

```text
App\Contracts\InsightEngine
        ↓
App\Services\RuleBasedInsightEngine
```

Product controllers and weekly reviews depend on the interface rather than on an AI implementation. A future `AIInsightEngine` or `HybridInsightEngine` can therefore be added behind the same boundary without changing the current domain/UI contract.

Pattern language is deliberately observational. Lumora says that two things **appeared together** or that something **has tended to coincide** with lower/higher energy. It does not infer diagnoses or psychological causes.

## Useful endpoints

```text
GET    /api/life-areas
GET    /api/onboarding
POST   /api/onboarding
GET    /api/dashboard

GET/POST/PUT/DELETE /api/checkins
GET/POST/PUT/DELETE /api/goals
GET/POST/PUT/DELETE /api/actions
GET/POST/PUT/DELETE /api/memories

GET    /api/patterns
PUT    /api/patterns/{id}/feedback

GET    /api/weekly-reviews/current
GET    /api/weekly-reviews
PUT    /api/weekly-reviews/{id}
```

## Checks

Frontend:

```bash
npm run typecheck
npm run lint
```

Backend:

```bash
cd laravel
composer lint
composer test
```

End-to-end tests use Playwright. Authenticated specs need a saved Clerk session:

```bash
npm run e2e:auth
npm run e2e
```

## Product boundary

Lumora V0 is a self-reflection and life-direction tool. It does not diagnose conditions and is not a replacement for psychotherapy, medical care, or emergency support.

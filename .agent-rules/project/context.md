# Project Context

- This is **Lumora**: a mobile-first personal self-reflection and life-direction PWA built from the ImOK starter.
  The current V0 intentionally contains no AI/LLM functionality. Core product features are onboarding, daily check-ins, goals/actions, user-managed memory, deterministic pattern detection, and weekly reviews.
- Do not edit `.env` files unless specifically requested.
- Treat authentication credentials, customer identity and contact fields as sensitive.
- Do not store sensitive data in logs or expose it in responses.
- Frontend (repo root): Angular 22, Ionic 9, Capacitor 8, standalone components, signals.
  - Ionic 9 exports everything from `@ionic/angular` (no `/standalone` subpath).
  - Build: `@angular/build:application`, output `www` (flat, `browser: ""`).
  - Lint: ESLint flat config `eslint.config.js` with `angular-eslint`. Unit tests: Vitest.
  - Node 22.22+ or 24.15+ is required by the Angular CLI; use `nvm use 22`.
- Backend (`laravel/`): Laravel 12, PHP `^8.2` with composer platform pinned to 8.3.10, Nova 5
  (`laravel/nova`), Spatie roles via `sereny/nova-permissions`, `firebase/php-jwt` **7.x**,
  `svix/svix`, `predis/predis`. Local DB is SQLite (`database/database.sqlite`).
- Authentication: Clerk. Frontend `ngx-clerk` **1.x** (signals API: `provideClerk`, `ClerkService`,
  `canActivateClerk`, `catchAllRoute`, `<clerk-sign-in>`, `<clerk-sign-up>`). Backend verifies the
  Clerk session JWT against the JWKS URL and syncs users through a Svix-signed webhook.
- Most routes are protected by the Clerk guard; only `/auth/*` is public.
- Frontend development uses `npm start` on port 4200 (Angular default) or `ionic serve` on 8100.
- Backend API fields use snake_case; frontend services normalize them to camelCase.
- Environment files: `src/environments/environment.ts` (dev), `environment.prod.ts` (placeholders
  `${CLERK_PUBLISHABLE_KEY}` and `${BUILD_NUMBER}` are replaced by CI).
- Main branch is `master`.
- Library docs for offline use: `docs/vendor/ngx-clerk-v1-llms-full.md` (ngx-clerk 1.x) and the
  READMEs under `laravel/vendor/firebase/php-jwt` and `laravel/vendor/svix/svix`.

## MCP usage

- Use an MCP only when the current task needs it. Never call one by default.
- Library or framework APIs (Angular, Ionic, Capacitor, Laravel, packages): check `context7` before relying on memory.
- Angular work: use `angular-cli` for current Angular APIs and best practices.
- Code inspection: use `phpstorm` for inspections, errors and symbol usages. It works only while PhpStorm is open.
- Prefer version-specific MCP answers over memory.
- If an MCP is unavailable, say so and continue without it.

## Commits

- Always include the ActiveCollab task number: `feat #<task_number>: short description`.
- Never add `Co-Authored-By` or any other AI attribution line.
- The coding agent never commits.

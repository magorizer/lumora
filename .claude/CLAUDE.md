# Project instructions — Lumora

The **ImOK dev toolset** — portable specs, copied unchanged between projects (project facts stay below):

@coding-agent-workflow.md
@info-and-testing.md
@ac-workflow.md

## Project facts

### What this is

**Lumora** — a personal self-reflection and life-direction PWA built from the ImOK starter: an Ionic/Angular
frontend and a Laravel/Nova backend with Clerk authentication wired on both sides. The current V0 includes
onboarding, daily check-ins, goals/actions, user-managed memory, deterministic pattern detection, and weekly reviews. It intentionally has no AI/LLM functionality.

Built 2026-09-30 from the stock generators (`ionic start … --type=angular-standalone`,
`composer create-project laravel/laravel`) plus `laravel/nova`, `sereny/nova-permissions`,
`firebase/php-jwt` 7, `svix/svix`, `predis/predis`, and `ngx-clerk` 1.x. The Clerk/Nova
integration is modelled on Barter Bridge and Regio (their repos are the reference when in doubt).
`README.md` is the user-facing guide: Clerk dashboard steps, env table, how to start a project.

### ActiveCollab

| Setting | Value |
|---|---|
| Project | — (none yet; set when the starter becomes a client project) |

### Coding agent

| Setting | Value |
|---|---|
| Agent | **Codex on `gpt-5.6-luna`** (primary) · **Junie** (secondary/fallback, `~/.local/bin/junie`) |
| Launcher | Codex: `codex exec` from Claude's shell (below). Junie: `.claude/open-junie-plan.sh <plan>` (Mac) or `.claude/open-junie-plan.ps1 -PlanPath <plan>` (Windows). |
| Plans folder | `docs/junie/` · archive `docs/junie/done/` · index `docs/junie/INDEX.md` |
| Id prefix | `JP-###` |
| Expected branch | `master` |

- Roles: Claude plans and reviews; **Codex (luna), Junie and Magor write app code**. Claude never edits source.
- Codex reads `AGENTS.md`; the shared project rules it lists live in `.agent-rules/project/` —
  `context.md` (facts, safety, MCP usage), `css-scss.md`, `testing.md`. Follow them too.
- Use Junie instead of Codex only when the user names Junie, the Codex CLI fails to start twice in
  a row, or a review/second-opinion pass must not share Codex's context. Say which agent is dispatched.

**Codex dispatch (primary).** Never on any other model — the global `~/.codex/config.toml` default is sol.
- Node: run `nvm use 22` first (Angular CLI 22 needs Node 22.22+); the Codex process inherits PATH.
- First dispatch on a plan, in the background:
  `codex exec -m gpt-5.6-luna -c model_reasoning_effort=medium -c service_tier=priority -s workspace-write -C <project dir> -o <last-message-file> - < <prompt-file>`
  (the prompt is the one `.claude/open-junie-plan.sh` builds, prefixed with "Read `AGENTS.md`").
- Follow-up rounds: `codex exec resume --last` (or the session id from the run header) with the fix prompt.
- `resume` does **not** inherit the model. It rejects `-m`, `-s`, `-C` and `-o`, and falls back to
  `~/.codex/config.toml`, which is sol. Force it with `-c`, run from the project directory, and
  redirect stdout:
  `codex exec resume --last -c model=gpt-5.6-luna -c model_reasoning_effort=medium -c service_tier=priority - < <prompt-file> > <log-file> 2>&1`
- Always check the run header's `model:` line before letting a round continue. On 2026-09-28 a
  resume silently ran as sol.
- The sandbox has **no network**: every npm/composer package a plan needs must be installed by
  Claude before dispatch. Plans say so in their ground rules.
- Known Codex failure modes: authorization written to fail open (`?? true`); extra scope not in the
  plan; a deviation recorded in the plan instead of raised as `BLOCKED`; claiming validation passed
  without output; committing despite "do not commit" (check `git log --oneline -3`); block-scoped
  variables read from an outer closure and wrong arguments to shared helpers — read every new call site.

### Stack

- **Frontend** (repo root): Angular 22, Ionic 9 (all imports from `@ionic/angular`), Capacitor 8
  (`capacitor.config.ts`, `webDir: www`, no native platforms added yet). `@angular/build:application`,
  flat output `www`. ESLint flat config + `angular-eslint`, Vitest. Auth via **Clerk** (`ngx-clerk` 1.x).
- **Backend** (`laravel/`): Laravel 12, PHP ^8.2 (composer platform 8.3.10), Nova 5, Spatie roles
  through `sereny/nova-permissions`, Clerk JWT verification (`firebase/php-jwt` 7) and Svix webhooks.
  Local DB is SQLite. Nova credentials are in `laravel/auth.json` (git-ignored).
- Backend fields are snake_case; frontend services normalize to camelCase.
- Every future Mailable/Notification should be `ShouldQueue` — **no queue worker means no mail, silently**.

### Environments & access

None yet. Local only: `npm start` (Angular dev server, port 4200) and `php artisan serve` (8000).

## Conventions

- Spacing and dimensions are multiples of 4px; prefer global utilities in `src/theme` over per-component SCSS.
- Do not edit `.env` files unless asked. Never commit Clerk or Nova credentials.
- Commits: `feat #<AC task number>: short description`; no AI attribution lines.

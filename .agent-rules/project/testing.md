# Testing Rules

Load this file only for testing/check/review work.

- Do not run tests unless the user explicitly requests them in the current turn.
- Do not run manual production builds; the dev server is the check.
- Ask the user to test whatever needs manual verification.
- Linters remain the normal final check when the workflow allows them.
- Frontend lint command: `npm run lint` (needs Node 22.22+; run `nvm use 22` first).
- Backend lint command: `cd laravel && composer lint` (Pint, `--test`), `composer lint:fix` to apply.
- Type check without building: `npx tsc -p tsconfig.app.json --noEmit`.
- Playwright (`playwright.config.ts`, specs in `e2e/`): `npm run e2e`, `npm run e2e:ui`, `npm run e2e:report`.
  It auto-starts `npm start` on port 4200, always runs **headed**, uses Google Chrome by default and
  `E2E_DEVICE=iphone` for iPhone 13 / WebKit.
- Protected routes need a saved Clerk session in `auth.json` (git-ignored); create or refresh it with
  `npm run e2e:auth`. Specs skip themselves when it is missing.
- Claude runs Playwright; the coding agent never does.
- Prefer stable user-visible text and roles for end-to-end selectors.

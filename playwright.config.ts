import { existsSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright end-to-end config for ImOK.
 *
 * Auth: tests reuse a saved Clerk session from `auth.json` (git-ignored).
 * Regenerate it with `npm run e2e:auth` (opens a browser, log in, then close it).
 * Refresh `auth.json` when the Clerk session expires.
 *
 * Browser: real Google Chrome by default. E2E_DEVICE=iphone switches to the iPhone 13 / WebKit
 * emulation.
 */
const baseURL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';
const storagePath = process.env['E2E_STORAGE'] ?? 'auth.json';
const storageState = existsSync(storagePath) ? storagePath : undefined;
const iphone = process.env['E2E_DEVICE'] === 'iphone';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? [['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    storageState,
    headless: false,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    iphone
      ? {
          // Mobile-first PWA: iPhone emulation (Mobile Safari / WebKit, the engine
          // the app runs under on iOS via Capacitor's WKWebView).
          name: 'iPhone 13',
          use: { ...devices['iPhone 13'] },
        }
      : {
          name: 'chrome',
          use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
  ],
  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});

import { existsSync } from 'node:fs';

import { expect, test } from '@playwright/test';

import { watchApiErrors } from './helpers/ionic';

const storagePath = process.env['E2E_STORAGE'] ?? 'auth.json';

test.use({ viewport: { width: 402, height: 874 } });

test('sign-in page renders Lumora and Clerk', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByText('Lumora', { exact: true })).toBeVisible();
  await expect(page.locator('clerk-sign-in')).toBeAttached();
});

test('signed-in app reaches a Lumora product screen', async ({ page }) => {
  test.skip(!existsSync(storagePath), `Requires ${storagePath} created by npm run e2e:auth.`);

  const errors: string[] = [];
  watchApiErrors(page, errors);

  await page.goto('/app/today');
  await expect(page).toHaveURL(/\/(app\/today|onboarding)/);

  if (page.url().includes('/onboarding')) {
    await expect(page.getByText('What matters most right now?')).toBeVisible();
  } else {
    await expect(page.getByText('Lumora', { exact: true })).toBeVisible();
  }

  expect(errors, errors.join('\n')).toEqual([]);
});

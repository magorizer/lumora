import { Page } from '@playwright/test';

/** Ionic interaction helpers — the app uses action sheets and alerts. */

/** Choose an option from an Ionic action sheet. */
export async function pickActionSheet(page: Page, option: RegExp) {
  await page.locator('ion-action-sheet button, ion-alert button, ion-popover ion-item').filter({ hasText: option }).first().click();
  const ok = page.locator('ion-alert button:has-text("OK")');
  if (await ok.count()) await ok.click();
  await page.waitForTimeout(600);
}

/** Collect API failures for reporting. */
export function watchApiErrors(page: Page, sink: string[]) {
  page.on('response', async r => {
    if (r.url().includes('/api/') && r.status() >= 400) {
      sink.push(`${r.status()} ${r.url().split('/api/')[1]?.slice(0, 50)} ${(await r.text().catch(() => '')).slice(0, 140)}`);
    }
  });
}

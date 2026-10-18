import { expect, test } from '@playwright/test';
import type { ConsoleMessage, Page } from '@playwright/test';

/**
 * App smoke suite (issue #299). Stable, CRUD-free checks against the
 * production build served by `vite preview` (playwright.app.config.ts).
 * Admin-CRUD flows with confirm cycles are deliberately OUT of scope.
 */

/**
 * Known-innocent console errors. The favicon is an inline data: URI, so
 * favicon 404s are NOT expected. Observed noise goes here WITH a comment —
 * the list is empty until something is actually reproduced.
 */
const INNOCENT_CONSOLE_ERRORS: RegExp[] = [];

/** Collects console.error + uncaught page errors into a string array. */
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (INNOCENT_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) return;
    errors.push(text);
  });
  page.on('pageerror', (error: Error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  return errors;
}

test('home: #root renders app content with no console errors', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  // The app shell mounted: #root is non-empty and the desktop nav is live.
  await expect(page.locator('#root > *').first()).toBeVisible();
  await expect(page.locator('[data-testid="theme-switch"]:visible')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('admin jobs: lazy vitrina loads with collapsed cards; expand opens the detail table', async ({
  page,
}) => {
  await page.goto('/admin/jobs');
  // Lazy route chunk + store hydration — the content itself is the wait.
  const list = page.getByTestId('admin-jobs-list');
  await expect(list).toBeVisible({ timeout: 30000 });

  // Collapsed by default: no detail table yet; each company caption sits
  // OUTSIDE the collapsed card strip (skills-collapse geometry, JobCard).
  await expect(page.locator('table')).toHaveCount(0);
  await expect(page.locator('[data-testid^="job-card-caption-"]').first()).toBeVisible();

  // Expand the first card: the collapsed strip is an icon-only button
  // (aria-expanded roundtrip per JobCard). The card's testid is derived
  // BEFORE the click so the assertion targets the same card, not a
  // hardcoded seed id.
  const strips = page.locator('button[data-testid="icon-button"][aria-expanded="true"]');
  const stripCountBefore = await strips.count();
  expect(stripCountBefore).toBeGreaterThan(0);
  const cardTestId = await page
    .locator('div[data-testid^="job-card-"]:has(button[aria-expanded="true"])')
    .first()
    .getAttribute('data-testid');
  if (cardTestId === null) {
    throw new Error('expected the first job card to carry a data-testid');
  }

  await strips.first().click();

  // Expanded: the detail table renders INSIDE that same card, the collapse
  // control carries the stable aria-controls roundtrip id, and one strip
  // fewer remains on the page.
  const expandedCard = page.locator(`[data-testid="${cardTestId}"]`);
  await expect(expandedCard.locator('table')).toBeVisible();
  await expect(page.locator('button[aria-controls^="job-card-content-"]')).toHaveCount(1);
  await expect(strips).toHaveCount(stripCountBefore - 1);
});

test('theme: toggle persists to localStorage and survives a reload', async ({ page }) => {
  await page.goto('/');
  const switchButton = page.locator('[data-testid="theme-switch"]:visible');
  await expect(switchButton).toBeVisible();

  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  const next = before === 'dark' ? 'light' : 'dark';

  await switchButton.click();
  await expect(html).toHaveAttribute('data-theme', next);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe(next);

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', next);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe(next);
});

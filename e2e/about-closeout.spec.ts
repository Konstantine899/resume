/* eslint-disable no-console -- this spec prints measured closeout evidence into the run log. */
import { test, expect, type BrowserContext, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@example.test';
const API_ABOUT = '/api/about';

type AboutDto = Record<string, unknown> & { fullName: string };

const consoleErrors: string[] = [];
const pageErrors: string[] = [];

const watch = (page: Page, label: string): void => {
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`${label}: ${message.text()}`);
  });
  page.on('pageerror', (error) => pageErrors.push(`${label}: ${error.message}`));
};

const toPayload = (dto: AboutDto): Record<string, unknown> =>
  Object.fromEntries(Object.entries(dto).filter(([key]) => key !== 'id' && key !== 'updatedAt'));

test.describe.serial('About-only closeout — live browser evidence', () => {
  let context: BrowserContext;
  let adminPage: Page;
  let publicPage: Page;
  let baseline: AboutDto;
  let token: string;

  const publicH1 = () => publicPage.locator('h1');

  const putAbout = async (data: Record<string, unknown>) => {
    const response = await adminPage.request.put(API_ABOUT, {
      data,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as AboutDto;
  };

  const loginAsAdmin = async (): Promise<void> => {
    await expect(adminPage.getByTestId('auth-login-open')).toBeVisible();
    await adminPage.getByTestId('auth-login-open').click();
    const loginForm = adminPage.getByTestId('login-form');
    await loginForm.getByLabel('Email').fill(ADMIN_EMAIL);
    await loginForm.getByLabel('Password').fill(process.env.ADMIN_PASSWORD ?? '');
    const loginResponsePromise = adminPage.waitForResponse(
      (response) =>
        response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    await loginForm.getByRole('button', { name: 'Log in', exact: true }).click();
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status(), 'UI login must not be throttled').toBe(200);
    const loginBody = (await loginResponse.json()) as { accessToken?: string };
    expect(loginBody.accessToken).toBeTruthy();
    token = loginBody.accessToken as string;
    await expect(adminPage.getByRole('button', { name: ADMIN_EMAIL })).toBeVisible({
      timeout: 15000,
    });

    // The signed-in preference may already be EN or RU; normalize to EN only
    // when the menu does not show the English label.
    await adminPage.getByRole('button', { name: ADMIN_EMAIL }).click();
    await expect(adminPage.getByTestId('language-toggle')).toBeVisible();
    if (!(await adminPage.getByRole('link', { name: 'Admin panel' }).isVisible())) {
      await adminPage.getByTestId('language-toggle').click();
    }
    await expect(adminPage.getByRole('link', { name: 'Admin panel' })).toBeVisible();
    await adminPage.keyboard.press('Escape');
  };

  const openAboutAdmin = async (): Promise<void> => {
    if (await adminPage.getByTestId('auth-login-open').isVisible()) {
      await loginAsAdmin();
    }
    if (!(await adminPage.getByTestId('admin-about').isVisible())) {
      await adminPage.getByRole('button', { name: ADMIN_EMAIL }).click();
      await adminPage.getByRole('link', { name: 'Admin panel' }).click();
      await adminPage
        .getByTestId('admin-sidebar')
        .getByRole('link', { name: 'About', exact: true })
        .click();
    }
    await expect(adminPage.getByTestId('admin-about')).toBeVisible();
    if (await adminPage.getByTestId('admin-about-table-expand').isVisible()) {
      await adminPage.getByTestId('admin-about-table-expand').click();
    }
    await expect(adminPage.getByTestId('admin-about-table-collapse')).toBeVisible();
  };

  const fillFullName = async (value: string): Promise<void> => {
    const input = adminPage.getByLabel('Full name');
    await input.fill(value);
  };

  const saveFullName = async (): Promise<void> => {
    await adminPage.getByRole('button', { name: 'Save', exact: true }).click();
  };

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    await context.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'en');
    });

    publicPage = await context.newPage();
    watch(publicPage, 'public');
    await publicPage.goto('/');
    await expect(publicH1()).toBeVisible();

    adminPage = await context.newPage();
    watch(adminPage, 'admin');
    adminPage.on('response', (response) => {
      if (response.url().includes('/api/auth/')) {
        console.log(`AUTH_RESPONSE=${response.status()} ${response.url()}`);
      }
    });
    await adminPage.goto('/');
    await expect(adminPage.getByTestId('auth-login-open')).toBeVisible();

    await loginAsAdmin();

    const response = await publicPage.request.get(API_ABOUT);
    expect(response.status()).toBe(200);
    baseline = (await response.json()) as AboutDto;
    console.log(`BASELINE_FULLNAME=${baseline.fullName}`);
  });

  test.afterAll(async () => {
    console.log(`CONSOLE_ERRORS=${JSON.stringify(consoleErrors)}`);
    console.log(`PAGE_ERRORS=${JSON.stringify(pageErrors)}`);
    await context?.close();
  });

  test('P0-1/P0-3: public load hydrates the canonical backend document, reload keeps it', async () => {
    await expect(publicH1()).toHaveText(baseline.fullName, { timeout: 15000 });

    const reloadStart = Date.now();
    await publicPage.reload();
    await expect(publicH1()).toHaveText(baseline.fullName, { timeout: 15000 });
    console.log(`RELOAD_HYDRATION_MS=${Date.now() - reloadStart}`);
  });

  test('P0-3: focus triggers a forced refetch of the canonical document', async () => {
    const probe = `${baseline.fullName} [focus-probe]`;
    await putAbout({ ...toPayload(baseline), fullName: probe });

    const started = Date.now();
    await publicPage.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(publicH1()).toHaveText(probe, { timeout: 5000 });
    const latency = Date.now() - started;
    console.log(`FOCUS_REFETCH_MS=${latency}`);
    expect(latency).toBeLessThan(2000);

    await putAbout(toPayload(baseline));
    await publicPage.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await expect(publicH1()).toHaveText(baseline.fullName, { timeout: 5000 });
  });

  test('P0-5: admin mutation reaches the same tab through the store (no reload)', async () => {
    await openAboutAdmin();
    const input = adminPage.getByLabel('Full name');
    await expect(input).toHaveValue(baseline.fullName);

    const marker = `${baseline.fullName} [same-tab]`;
    await fillFullName(marker);
    await saveFullName();
    await expect(adminPage.getByTestId('toast').filter({ hasText: 'Saved' }).first()).toBeVisible();

    const stored = (await (await adminPage.request.get(API_ABOUT)).json()) as AboutDto;
    expect(stored.fullName).toBe(marker);

    await adminPage.getByRole('link', { name: 'Back to site' }).click();
    await expect(adminPage.locator('h1')).toHaveText(marker, { timeout: 5000 });
    console.log('SAME_TAB_STORE_UPDATE=PASS');
  });

  test('P0-5: second tab updates from a real admin mutation, latency measured', async () => {
    await openAboutAdmin();
    const marker = `${baseline.fullName} [cross-tab]`;
    await fillFullName(marker);

    const started = Date.now();
    await saveFullName();
    await expect(publicH1()).toHaveText(marker, { timeout: 5000 });
    const latency = Date.now() - started;
    console.log(`CROSS_TAB_REAL_MUTATION_MS=${latency}`);
    expect(latency).toBeLessThan(3000);
    expect(latency, 'target from the plan is < 1000 ms').toBeLessThan(1000);

    // restore the canonical document through the same UI path
    await fillFullName(baseline.fullName);
    await saveFullName();
    await expect(publicH1()).toHaveText(baseline.fullName, { timeout: 5000 });
  });

  test('P0-2: network failure keeps the store and the document untouched', async () => {
    await openAboutAdmin();
    await adminPage.route('**/api/about*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.abort('failed');
        return;
      }
      await route.continue();
    });

    await fillFullName('Network Failure Probe');
    await saveFullName();
    await expect(
      adminPage.getByTestId('toast').filter({ hasText: 'Could not save' }).first()
    ).toBeVisible({ timeout: 5000 });

    const stored = (await (await adminPage.request.get(API_ABOUT)).json()) as AboutDto;
    expect(stored.fullName).toBe(baseline.fullName);

    await adminPage.getByRole('link', { name: 'Back to site' }).click();
    await expect(adminPage.locator('h1')).toHaveText(baseline.fullName, { timeout: 5000 });
    await adminPage.unroute('**/api/about*');
    console.log('NETWORK_FAILURE_STORE_UNTOUCHED=PASS');
  });

  test('P0-2: auth failure (401) surfaces the error toast and keeps the store', async () => {
    await openAboutAdmin();
    await adminPage.route('**/api/about*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ status: 401, title: 'Unauthorized', detail: 'unauthorized' }),
        });
        return;
      }
      await route.continue();
    });

    await adminPage.route('**/api/auth/refresh', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
    );

    await fillFullName('Auth Failure Probe');
    await saveFullName();
    await expect(
      adminPage.getByTestId('toast').filter({ hasText: 'Could not save' }).first()
    ).toBeVisible({ timeout: 10000 });

    const stored = (await (await adminPage.request.get(API_ABOUT)).json()) as AboutDto;
    expect(stored.fullName).toBe(baseline.fullName);

    await adminPage.unroute('**/api/about*');
    await adminPage.unroute('**/api/auth/refresh');

    // A dead session signs the app out: RequireAdmin redirects to `/`, the
    // anonymous nav returns, and the canonical document is untouched.
    await expect(adminPage.getByTestId('auth-login-open')).toBeVisible({ timeout: 10000 });
    await expect(adminPage.getByRole('button', { name: ADMIN_EMAIL })).toHaveCount(0);
    await expect(adminPage.locator('h1')).toHaveText(baseline.fullName, { timeout: 5000 });
    console.log('AUTH_FAILURE_SIGNED_OUT_STORE_UNTOUCHED=PASS');

    // Restore the session for the remaining tests (login has its own bucket,
    // so this second login stays inside the 5/min limit).
    await loginAsAdmin();
  });

  test('P0-2: malformed input is blocked by the form (no network call)', async () => {
    await openAboutAdmin();
    let putRequests = 0;
    const onRequest = (request: { method: () => string; url: () => string }) => {
      if (request.method() === 'PUT' && request.url().includes('/api/about')) putRequests += 1;
    };
    adminPage.on('request', onRequest);

    await fillFullName('');
    await expect(adminPage.getByText('Name is required (2–80 characters).')).toBeVisible();
    await expect(adminPage.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
    await adminPage.waitForTimeout(300);
    expect(putRequests).toBe(0);

    adminPage.off('request', onRequest);
    await fillFullName(baseline.fullName);
    console.log('MALFORMED_INPUT_BLOCKED=PASS');
  });
});

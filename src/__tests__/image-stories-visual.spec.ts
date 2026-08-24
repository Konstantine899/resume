import { test, expect } from '@playwright/test';

test.describe('Image Stories Visual Check', () => {
  test('should render Default story with border-radius 0px', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--default&viewMode=story');
    await page.waitForSelector('figure[data-variant="default"]', { timeout: 10000 });

    const container = page.locator('figure[data-variant="default"]');
    const borderRadius = await container.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe('0px');
  });

  test('should render Rounded story with border-radius 12px', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--rounded&viewMode=story');
    await page.waitForSelector('figure[data-variant="rounded"]', { timeout: 10000 });

    const container = page.locator('figure[data-variant="rounded"]');
    const borderRadius = await container.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe('12px');
  });

  test('should render Circular story with border-radius 50%', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--circular&viewMode=story');
    await page.waitForSelector('figure[data-variant="circular"]', { timeout: 10000 });

    const container = page.locator('figure[data-variant="circular"]');
    const borderRadius = await container.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(borderRadius).toBe('50%');
  });

  test('should render Thumbnail story with box-shadow', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--thumbnail&viewMode=story');
    await page.waitForSelector('figure[data-variant="thumbnail"]', { timeout: 10000 });

    const container = page.locator('figure[data-variant="thumbnail"]');
    const boxShadow = await container.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(boxShadow).toContain('rgba(0, 0, 0, 0.1)');
  });

  test('should render SizeSmall with 64px dimensions', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--size-small&viewMode=story');
    await page.waitForSelector('figure[data-size="sm"]', { timeout: 10000 });

    const container = page.locator('figure[data-size="sm"]');
    const width = await container.evaluate((el) => getComputedStyle(el).width);
    expect(width).toBe('64px');
  });

  test('should render SizeMedium with 128px dimensions', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--size-medium&viewMode=story');
    await page.waitForSelector('figure[data-size="md"]', { timeout: 10000 });

    const container = page.locator('figure[data-size="md"]');
    const width = await container.evaluate((el) => getComputedStyle(el).width);
    expect(width).toBe('128px');
  });

  test('should render SizeLarge with 256px dimensions', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--size-large&viewMode=story');
    await page.waitForSelector('figure[data-size="lg"]', { timeout: 10000 });

    const container = page.locator('figure[data-size="lg"]');
    const width = await container.evaluate((el) => getComputedStyle(el).width);
    expect(width).toBe('256px');
  });

  test('should render DarkMode with correct background', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--dark-mode&viewMode=story');
    await page.waitForSelector('figure[data-variant="thumbnail"]', { timeout: 10000 });

    const container = page.locator('figure[data-variant="thumbnail"]');
    const bgColor = await container.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toMatch(/rgba\(255, 255, 255, 0\.05\)/);
  });

  test('should render PriorityLoading with image-rendering crisp-edges', async ({ page }) => {
    await page.goto('/iframe.html?id=shared-ui-image--priority-loading&viewMode=story');
    await page.waitForSelector('img[fetchpriority="high"]', { timeout: 10000 });

    const img = page.locator('img[fetchpriority="high"]');
    const imageRendering = await img.evaluate((el) => getComputedStyle(el).imageRendering);
    expect(imageRendering).toBe('crisp-edges');
  });

  test('should render DecorativeAndContentComparison with pointer-events none', async ({
    page,
  }) => {
    await page.goto(
      '/iframe.html?id=shared-ui-image--decorative-and-content-comparison&viewMode=story'
    );
    await page.waitForSelector('img[alt=""]', { timeout: 10000 });

    const decorativeImg = page.locator('img[alt=""]').first();
    const decorativeFigure = decorativeImg.locator('xpath=ancestor::figure');
    const pointerEvents = await decorativeFigure.evaluate(
      (el) => getComputedStyle(el).pointerEvents
    );
    expect(pointerEvents).toBe('none');
  });
});

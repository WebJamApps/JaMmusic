import { test, expect } from '@playwright/test';

// The site stores its theme in localStorage (applied as a data-theme attribute
// on <html>), NOT via prefers-color-scheme — so seed localStorage before the
// app boots to exercise the real dark mode.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('theme', 'dark'); } catch { /* ignore */ }
  });

  // Mock API requests for the /music page to prevent loading spinner hang
  await page.route(/\/tour/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'g1',
          datetime: new Date().toISOString(),
          venue: 'Mock Venue',
          tickets: 'Free',
          location: 'Mock City, VA',
        }
      ]),
    });
  });

  await page.route(/\/picture/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route(/\/song/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
});

const isWhite = (c: string): boolean => /rgba?\(\s*255,\s*255,\s*255/.test(c);

test('gigs table is legible in dark mode on a phone', async ({ page }) => {
  await page.goto('/music', { waitUntil: 'networkidle' });

  await expect
    .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
    .toBe('dark');

  const grid = page.locator('.MuiDataGrid-root').first();
  await grid.scrollIntoViewIfNeeded();
  await expect(grid).toBeVisible();

  // The regression: MUI X DataGrid renders its own light-palette WHITE surfaces
  // (header / footer / even rows) while text uses the light --fg token, making
  // rows invisible in dark mode. None of these surfaces may be white.
  for (const sel of [
    '.MuiDataGrid-columnHeaders',
    '.MuiDataGrid-footerContainer',
    '.MuiDataGrid-row',
  ]) {
    const bg = await page.locator(sel).first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(isWhite(bg), `${sel} must not be white in dark mode (got ${bg})`).toBe(false);
  }
});

test('music page has no horizontal overflow on a phone', async ({ page }) => {
  await page.goto('/music', { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow, `unexpected horizontal overflow of ${overflow}px`).toBeLessThanOrEqual(2);
});

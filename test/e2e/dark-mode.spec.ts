import { test, expect, type Page } from '@playwright/test';

const ADMIN_AUTH = {
  isAuthenticated: true,
  error: '',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
  user: {
    userType: 'Developer',
    email: 'admin@web-jam.com',
  },
};

// The site stores its theme in localStorage (applied as a data-theme attribute
// on <html>), NOT via prefers-color-scheme — so seed localStorage before the
// app boots to exercise the real dark mode.
test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('theme', 'dark'); } catch { /* ignore */ }
  });

  // Mock profile endpoint so AuthProvider validates admin token without error
  await page.route('**/user/user-*', async (route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': '*',
        'access-control-allow-methods': '*',
      },
      body: JSON.stringify({ userType: 'Developer', email: 'admin@web-jam.com' }),
    });
  });

  const upcomingDatetime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Mock API requests for the /music page to prevent loading spinner hang
  await page.route(/\/tour/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'g1',
          datetime: upcomingDatetime,
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

  await page.routeWebSocket(/.*/, (socket) => {
    socket.onMessage((message) => {
      if (typeof message !== 'string' || !message.startsWith('{')) return;
      const packet = JSON.parse(message) as { event?: string; cid?: number };
      if (packet.event === '#handshake') {
        socket.send(JSON.stringify({ rid: packet.cid, data: { id: 'fixture', pingTimeout: 20000, isAuthenticated: false } }));
      } else if (packet.event === '#subscribe') {
        socket.send(JSON.stringify({ rid: packet.cid }));
      } else if (packet.event === 'initial message') {
        socket.send(JSON.stringify({
          event: 'allGigs',
          data: [{
            _id: 'g1',
            datetime: upcomingDatetime,
            venue: 'Mock Venue',
            tickets: 'Free',
            location: 'Mock City, VA',
          }],
        }));
        socket.send(JSON.stringify({ event: 'allPics', data: [] }));
      }
    });
  });
});

const isWhite = (c: string): boolean => /rgba?\(\s*255,\s*255,\s*255/.test(c);

test('gigs display is legible in dark mode on a phone', async ({ page }) => {
  await page.goto('/music', { waitUntil: 'domcontentloaded' });

  await expect
    .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
    .toBe('dark');

  const card = page.locator('.gigsDiv .gig-card').first();
  const grid = page.locator('.MuiDataGrid-root').first();

  await expect(card.or(grid)).toBeVisible();

  if (await card.isVisible()) {
    // Under 960px: cards are rendered instead of DataGrid
    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(isWhite(bg), `.gig-card must not be white in dark mode (got ${bg})`).toBe(false);
  } else {
    for (const sel of [
      '.MuiDataGrid-columnHeaders',
      '.MuiDataGrid-footerContainer',
      '.MuiDataGrid-row',
    ]) {
      const bg = await page.locator(sel).first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(isWhite(bg), `${sel} must not be white in dark mode (got ${bg})`).toBe(false);
    }
  }
});

test('music page has no horizontal overflow on a phone', async ({ page }) => {
  await page.goto('/music', { waitUntil: 'domcontentloaded' });
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow, `unexpected horizontal overflow of ${overflow}px`).toBeLessThanOrEqual(2);
});

const checkTableOverflow = async (page: Page, label: string, width: number) => {
  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    const pageOverflow = el.scrollWidth - el.clientWidth;

    const outer = document.querySelector('.search-table-outer') as HTMLElement | null;
    const outerOverflow = outer ? outer.scrollWidth - outer.clientWidth : 0;

    const gridEl = document.querySelector('.MuiDataGrid-root') as HTMLElement | null;
    const gridOverflow = gridEl ? gridEl.scrollWidth - gridEl.clientWidth : 0;

    const scroller = document.querySelector('.MuiDataGrid-virtualScroller') as HTMLElement | null;
    const scrollerOverflow = scroller ? scroller.scrollWidth - scroller.clientWidth : 0;

    return {
      pageOverflow,
      outerOverflow,
      gridOverflow,
      scrollerOverflow,
    };
  });

  expect(overflow.pageOverflow, `${label} page horizontal overflow at ${width}px`).toBeLessThanOrEqual(2);
  expect(overflow.outerOverflow, `${label} outer table wrapper overflow at ${width}px`).toBeLessThanOrEqual(2);
  expect(overflow.gridOverflow, `${label} DataGrid overflow at ${width}px`).toBeLessThanOrEqual(2);
  expect(overflow.scrollerOverflow, `${label} DataGrid virtual scroller overflow at ${width}px`).toBeLessThanOrEqual(2);
};

test('gigs table has no horizontal overflow on desktop at 960px and 1024px', async ({ page, context }) => {
  // 1. Visitor table (without admin privileges or Announce column)
  for (const width of [960, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/music', { waitUntil: 'domcontentloaded' });

    const grid = page.locator('.MuiDataGrid-root').first();
    await grid.waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('.MuiDataGrid-root.adminGrid')).toHaveCount(0);
    await expect(page.locator('.MuiDataGrid-columnHeader[data-field="announce"]')).toHaveCount(0);

    await checkTableOverflow(page, 'visitor', width);
  }

  // 2. Administrator table with upcoming gig (exercises Announce column and .adminGrid)
  await context.addInitScript((auth) => {
    try { localStorage.setItem('auth', JSON.stringify(auth)); } catch { /* ignore */ }
  }, ADMIN_AUTH);

  for (const width of [960, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/music', { waitUntil: 'domcontentloaded' });

    const adminGrid = page.locator('.MuiDataGrid-root.adminGrid').first();
    await adminGrid.waitFor({ state: 'visible', timeout: 10000 });

    const announceHeader = page.locator('.MuiDataGrid-columnHeader[data-field="announce"]');
    await expect(announceHeader).toBeVisible();

    await checkTableOverflow(page, 'admin', width);
  }
});

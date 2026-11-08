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
            datetime: new Date().toISOString(),
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

test('gigs table has no horizontal overflow on desktop at 960px and 1024px', async ({ page }) => {
  for (const width of [960, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/music', { waitUntil: 'domcontentloaded' });

    const grid = page.locator('.MuiDataGrid-root').first();
    await grid.waitFor({ state: 'visible', timeout: 10000 });

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

    expect(overflow.pageOverflow, `page horizontal overflow at ${width}px`).toBeLessThanOrEqual(2);
    expect(overflow.outerOverflow, `outer table wrapper overflow at ${width}px`).toBeLessThanOrEqual(2);
    expect(overflow.gridOverflow, `DataGrid overflow at ${width}px`).toBeLessThanOrEqual(2);
    expect(overflow.scrollerOverflow, `DataGrid virtual scroller overflow at ${width}px`).toBeLessThanOrEqual(2);
  }
});

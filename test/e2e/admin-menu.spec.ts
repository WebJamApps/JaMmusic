import {
  test, expect, type Page, type WebSocketRoute, type Route,
} from '@playwright/test';

// E2E tests for the fold-open Admin section in the side menu:
// - opens and folds on click
// - displays all 5 admin links (Users, Venues, Batch Outreach, Templates, Database) for Developer
// - follows links and maintains state
// - automatically opens when navigating directly to an admin page
// - hides Database link for non-Developer admin roles (e.g. JaM-admin)
// - hides entire Admin section for unauthenticated visitors
// - mobile drawer: toggling group leaves drawer open, selecting child closes drawer
// - accessible keyboard navigation: visible focus ring, toggle with Enter and Space

const DEVELOPER_AUTH = {
  isAuthenticated: true,
  error: '',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
  user: {
    userType: 'Developer',
    email: 'joshua@web-jam.com',
  },
};

const JAM_ADMIN_AUTH = {
  isAuthenticated: true,
  error: '',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiIsImV4cCI6OTk5OTk5OTk5OX0.signature',
  user: {
    userType: 'JaM-admin',
    email: 'jam@web-jam.com',
  },
};

interface SocketPacket {
  event?: string;
  cid?: number;
  data?: unknown;
}

async function setupMocks(page: Page, authUser?: { userType: string; email: string }) {
  // Handle socketcluster handshake and mock data messages so no connection-failure toast overlay is displayed
  await page.routeWebSocket(/.*/, (ws: WebSocketRoute) => {
    ws.onMessage((message) => {
      if (typeof message !== 'string' || !message.startsWith('{')) return;
      try {
        const packet = JSON.parse(message) as SocketPacket;
        if (packet.event === '#handshake') {
          ws.send(JSON.stringify({ rid: packet.cid, data: { id: 'fixture', pingTimeout: 20000, isAuthenticated: false } }));
        } else if (packet.event === '#subscribe') {
          ws.send(JSON.stringify({ rid: packet.cid }));
        } else if (packet.event === 'initial message') {
          ws.send(JSON.stringify({ event: 'allGigs', data: [] }));
          ws.send(JSON.stringify({ event: 'jamPics', data: [] }));
          ws.send(JSON.stringify({ event: 'allPics', data: [] }));
        }
      } catch { /* ignore */ }
    });
  });

  await page.route(/^https:\/\//, (route: Route) => route.abort());

  await page.route('**/song*', async (route: Route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/tour*', async (route: Route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/picture*', async (route: Route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock backend API routes across both local and preview hostnames (ignoring HTML document navigations)
  await page.route('**/user/user-*', async (route: Route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    if (authUser) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(authUser),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    }
  });

  await page.route('**/admin/user*', async (route: Route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'u-1',
          name: 'Admin User',
          email: 'admin@web-jam.com',
          userType: 'JaM-admin',
          privileges: ['gig:create', 'gig:announce'],
        },
      ]),
    });
  });

  await page.route('**/venue*', async (route: Route) => {
    if (route.request().resourceType() === 'document') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'v-1',
          name: 'Test Venue',
          city: 'Salem',
          usState: 'VA',
          outreachEligible: true,
        },
      ]),
    });
  });
}

test.describe('Admin side menu fold-open section (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('opens, folds, displays 5 links for Developer, and follows child links', async ({ context, page }) => {
    await setupMocks(page, DEVELOPER_AUTH.user);
    await context.addInitScript((auth) => {
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch { /* ignore */ }
    }, DEVELOPER_AUTH);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.menu-item').first()).toBeVisible();

    // 1. Admin group button is in the desktop sidebar and initially collapsed
    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');

    const adminList = page.locator('#menu-group-admin');
    await expect(adminList).toBeHidden();

    // 2. Click to open Admin section
    await adminButton.click();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();

    // 3. Verify all 5 child links are visible
    const usersLink = page.getByRole('link', { name: 'Users' });
    const venuesLink = page.getByRole('link', { name: 'Venues' });
    const outreachLink = page.getByRole('link', { name: 'Batch Outreach' });
    const templatesLink = page.getByRole('link', { name: 'Templates' });
    const databaseLink = page.getByRole('link', { name: 'Database' });

    await expect(usersLink).toBeVisible();
    await expect(venuesLink).toBeVisible();
    await expect(outreachLink).toBeVisible();
    await expect(templatesLink).toBeVisible();
    await expect(databaseLink).toBeVisible();

    // 4. Click Admin button again to fold closed
    await adminButton.click();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');
    await expect(adminList).toBeHidden();

    // 5. Click Admin button to open again
    await adminButton.click();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();

    // 6. Follow Users link
    await usersLink.click();
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();

    // 7. Follow Venues link
    await venuesLink.click();
    await expect(page).toHaveURL(/\/admin\/venues$/);
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();

    // 8. Follow Batch Outreach link
    await outreachLink.click();
    await expect(page).toHaveURL(/\/admin\/outreach$/);
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();

    // 9. Follow Templates link
    await templatesLink.click();
    await expect(page).toHaveURL(/\/admin\/templates$/);
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();

    // 10. Follow Database link
    await databaseLink.click();
    await expect(page).toHaveURL(/\/admin\/database$/);
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(adminList).toBeVisible();
  });

  test('auto-opens the Admin section when navigating directly to an admin page', async ({ context, page }) => {
    await setupMocks(page, DEVELOPER_AUTH.user);
    await context.addInitScript((auth) => {
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch { /* ignore */ }
    }, DEVELOPER_AUTH);

    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });

    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');

    const adminList = page.locator('#menu-group-admin');
    await expect(adminList).toBeVisible();
    await expect(page.getByRole('link', { name: 'Venues' })).toBeVisible();
  });

  test('Developer-only Database link is hidden for JaM-admin role', async ({ context, page }) => {
    await setupMocks(page, JAM_ADMIN_AUTH.user);
    await context.addInitScript((auth) => {
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch { /* ignore */ }
    }, JAM_ADMIN_AUTH);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.menu-item').first()).toBeVisible();

    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await adminButton.click();

    // 4 admin child links are visible
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Venues' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Batch Outreach' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Templates' })).toBeVisible();

    // Database link is excluded for JaM-admin
    await expect(page.getByRole('link', { name: 'Database' })).toHaveCount(0);
  });

  test('Admin section is hidden for unauthenticated visitors', async ({ context, page }) => {
    await setupMocks(page);
    await context.addInitScript(() => {
      try {
        localStorage.removeItem('auth');
      } catch { /* ignore */ }
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.menu-item').first()).toBeVisible();

    // Admin section button is not rendered at all
    await expect(page.getByRole('button', { name: 'Admin' })).toHaveCount(0);
  });

  test('keyboard users can tab to Admin toggle, see visible focus outline, and expand/collapse with Enter and Space', async ({ context, page }) => {
    await setupMocks(page, DEVELOPER_AUTH.user);
    await context.addInitScript((auth) => {
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch { /* ignore */ }
    }, DEVELOPER_AUTH);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.menu-item').first()).toBeVisible();

    const adminButton = page.getByRole('button', { name: 'Admin' });
    await adminButton.focus();
    await expect(adminButton).toBeFocused();

    // Verify focus-visible outline is active and styled (not outline: none)
    const focusStyle = await adminButton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(parseInt(focusStyle.outlineWidth, 10)).toBeGreaterThanOrEqual(1);

    // Expand with Enter
    await page.keyboard.press('Enter');
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#menu-group-admin')).toBeVisible();

    // Collapse with Space
    await page.keyboard.press('Space');
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#menu-group-admin')).toBeHidden();
  });
});

test.describe('Admin side menu fold-open section (Mobile)', () => {
  test('mobile: opens drawer, group tap leaves drawer open, and page link tap closes drawer', async ({ context, page }) => {
    await setupMocks(page, DEVELOPER_AUTH.user);
    await context.addInitScript((auth) => {
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch { /* ignore */ }
    }, DEVELOPER_AUTH);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#mobilemenutoggle')).toBeVisible();

    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toHaveClass(/close/);

    // Open mobile drawer via toggle
    await page.locator('#mobilemenutoggle').click();
    await expect(sidebar).toHaveClass(/open/);

    // Admin button is visible in drawer
    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');

    // Tap Admin button to open: drawer remains open
    await adminButton.click();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'true');
    await expect(sidebar, 'drawer must remain open when toggling a group').toHaveClass(/open/);

    const usersLink = page.getByRole('link', { name: 'Users' });
    await expect(usersLink).toBeVisible();

    // Tap child link: drawer closes and page navigates
    await usersLink.click();
    await expect(sidebar, 'drawer must close after tapping a page link').toHaveClass(/close/);
    await expect(page).toHaveURL(/\/admin\/users$/);
  });
});

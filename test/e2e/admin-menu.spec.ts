import { test, expect } from '@playwright/test';

// E2E tests for the fold-open Admin section in the side menu:
// - opens and folds on click
// - displays all 5 admin links (Users, Venues, Batch Outreach, Templates, Database) for Developer
// - follows links and maintains state
// - automatically opens when navigating directly to an admin page
// - hides Database link for non-Developer admin roles (e.g. JaM-admin)
// - hides entire Admin section for unauthenticated visitors
// - mobile drawer: toggling group leaves drawer open, selecting child closes drawer

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

async function setupMocks(page: any, authUser = DEVELOPER_AUTH.user) {
  // Prevent socketcluster hangs and external script errors (e.g. Google GSI client unhandled exceptions)
  await page.routeWebSocket(/.*/, (ws: any) => ws.close());
  await page.route(/^https:\/\//, (route: any) => route.abort());

  // Mock all backend API routes
  await page.route('http://localhost:7000/**', async (route: any) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body: unknown = [];

    if (path.startsWith('/user/user-')) {
      body = authUser;
    } else if (path.startsWith('/admin/user')) {
      body = [
        {
          _id: 'u-1',
          name: 'Admin User',
          email: 'admin@web-jam.com',
          userType: 'JaM-admin',
          privileges: ['gig:create', 'gig:announce'],
        },
      ];
    } else if (path.startsWith('/venue')) {
      body = [
        {
          _id: 'v-1',
          name: 'Test Venue',
          city: 'Salem',
          usState: 'VA',
          outreachEligible: true,
        },
      ];
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
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
    await expect(page.locator('.elevation3')).toBeVisible();

    // 1. Admin group button is in the desktop sidebar and initially collapsed
    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');

    const adminList = page.locator('#menu-group-admin');
    await expect(adminList).toBeHidden();

    // 2. Click to open Admin section
    await adminButton.dispatchEvent('click');
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
    await adminButton.dispatchEvent('click');
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');
    await expect(adminList).toBeHidden();

    // 5. Click Admin button to open again
    await adminButton.dispatchEvent('click');
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
    await expect(page.locator('.elevation3')).toBeVisible();

    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await adminButton.dispatchEvent('click');

    // 4 admin child links are visible
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Venues' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Batch Outreach' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Templates' })).toBeVisible();

    // Database link is excluded for JaM-admin
    await expect(page.getByRole('link', { name: 'Database' })).toHaveCount(0);
  });

  test('Admin section is hidden for unauthenticated visitors', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.elevation3')).toBeVisible();

    // Admin section button is not rendered at all
    await expect(page.getByRole('button', { name: 'Admin' })).toHaveCount(0);
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
    await expect(page.locator('.elevation3')).toBeVisible();

    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toHaveClass(/close/);

    // Open mobile drawer via toggle
    await page.evaluate(() => document.getElementById('mobilemenutoggle')?.click());
    await expect(sidebar).toHaveClass(/open/);

    // Admin button is visible in drawer
    const adminButton = page.getByRole('button', { name: 'Admin' });
    await expect(adminButton).toBeVisible();
    await expect(adminButton).toHaveAttribute('aria-expanded', 'false');

    // Tap Admin button to open: drawer remains open
    await adminButton.dispatchEvent('click');
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

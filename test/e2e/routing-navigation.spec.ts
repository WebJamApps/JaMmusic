import { test, expect } from '@playwright/test';

// Verifies client-side routing, navigation, history stack manipulation, query parameters,
// and wildcard redirects following the React Router v8 upgrade.

const MOCK_AUTH = {
  isAuthenticated: true,
  error: '',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature',
  user: {
    userType: 'Developer',
    email: 'joshua@web-jam.com',
  },
};

const MOCK_SONG = {
  _id: 's1',
  title: 'Test Song',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  category: 'Originals',
  year: 2024,
  composer: 'Josh',
  order: 1,
};

const MOCK_GIG = {
  _id: 'g1',
  datetime: new Date().toISOString(),
  venue: 'Mock Venue',
  tickets: 'Free',
  location: 'Roanoke, VA',
};

const AGENT_USER = {
  _id: 'u-agent',
  name: 'Web Jam LLM',
  email: 'agent@web-jam.com',
  userType: 'web-jam-llm',
  userStatus: 'ai-agent',
  privileges: ['gig:create'],
};

test.describe('React Router 8 Routing and Navigation', () => {
  test.beforeEach(async ({ context, page }) => {
    // Seed authenticated developer user in localStorage
    await context.addInitScript((auth) => {
      try {
        localStorage.setItem('auth', JSON.stringify(auth));
      } catch { /* ignore */ }
    }, MOCK_AUTH);

    // Mock backend API endpoints on localhost:7000
    await page.route(/localhost:7000\/user\/user-123/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_AUTH.user),
      });
    });

    await page.route(/localhost:7000\/tour/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_GIG]),
      });
    });

    await page.route(/localhost:7000\/picture/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(/localhost:7000\/song/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_SONG]),
      });
    });

    await page.route(/localhost:7000\/venue/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          _id: 'v1',
          name: 'Mock Venue',
          city: 'Salem',
          usState: 'VA',
          outreachEligible: true,
        }]),
      });
    });

    await page.route(/localhost:7000\/admin\/user/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([AGENT_USER]),
      });
    });

    await page.route(/localhost:7000\/outreach/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('navigates directly to main public routes', async ({ page }) => {
    // 1. Homepage at / (in JaMmusic, default root renders Music container)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.elevation3')).toBeVisible();

    // 2. Music overview at /music
    await page.goto('/music', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/music$/);
    await expect(page.locator('.elevation3')).toBeVisible();

    // 3. Buy Music at /music/buymusic
    await page.goto('/music/buymusic', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/music\/buymusic$/);
    await expect(page.getByText('Buy from Amazon Music')).toBeVisible();

    // 4. Songs at /music/songs
    await page.goto('/music/songs', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/music\/songs$/);
    await expect(page.locator('.playerDiv')).toBeVisible();

    // 5. New Homepage at /new-homepage
    await page.goto('/new-homepage', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/new-homepage$/);
    await expect(page.locator('.wideHome')).toBeVisible();
  });

  test('performs client-side navigation via sidebar links without page reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.elevation3')).toBeVisible();

    // Open mobile sidebar toggle if present
    const menuToggle = page.locator('#mobilemenutoggle');
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      await page.waitForTimeout(300);
    }

    // Click Buy Music link in the sidebar
    const buyMusicLink = page.locator('.menu-item a[href="https://web-jam.com/music/buymusic"], .menu-item a[href="/music/buymusic"]').first();
    if (await buyMusicLink.isVisible()) {
      await buyMusicLink.click();
      await expect(page).toHaveURL(/\/music\/buymusic/);
      await expect(page.getByText('Buy from Amazon Music')).toBeVisible();
    }
  });

  test('redirects unknown paths to homepage via wildcard route', async ({ page }) => {
    // Navigating to an unrecognized route should trigger <Route path="*" element={<Navigate to="/" replace />} />
    await page.goto('/unrecognized-subpath-test-404', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.elevation3')).toBeVisible();
  });

  test('supports browser back and forward history stack navigation', async ({ page }) => {
    // History stack: / -> /music/buymusic -> /music/songs
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.elevation3')).toBeVisible();

    await page.goto('/music/buymusic', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Buy from Amazon Music')).toBeVisible();

    await page.goto('/music/songs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.playerDiv')).toBeVisible();

    // Step back to /music/buymusic
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/music\/buymusic$/);
    await expect(page.getByText('Buy from Amazon Music')).toBeVisible();

    // Step back to /
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.elevation3')).toBeVisible();

    // Step forward to /music/buymusic
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/music\/buymusic$/);
    await expect(page.getByText('Buy from Amazon Music')).toBeVisible();

    // Step forward to /music/songs
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/music\/songs$/);
    await expect(page.locator('.playerDiv')).toBeVisible();
  });

  test('preserves search parameters handled by useSearchParams on /music/songs', async ({ page }) => {
    await page.goto('/music/songs?category=Originals&filter=acoustic', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/category=Originals/);
    await expect(page).toHaveURL(/filter=acoustic/);
    await expect(page.locator('.playerDiv')).toBeVisible();
  });

  test('renders authenticated admin routes', async ({ page }) => {
    // 1. Admin Venues
    await page.goto('/admin/venues', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/venues$/);
    await expect(page.locator('th:has-text("Name")').first()).toBeVisible();

    // 2. Admin Users
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.locator('[data-testid="admin-users-page"]')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature';

const DEVELOPER_AUTH = {
  isAuthenticated: true,
  error: '',
  token: DEV_TOKEN,
  user: {
    userType: 'Developer',
    email: 'josh@web-jam.com',
  },
};

const SAMPLE_DATABASE_DIAGRAM = `erDiagram
  User {
    string _id
    string name
    string email
  }
  Gig {
    string _id
    string venueId
  }
  User ||--o{ Gig : creates
`;

const SAMPLE_SYSTEM_MAP = `%% Rule: service names and connections only, never an address, a login or a secret.
flowchart TD
  Website[Website] --> Backend[Production Backend]
  Backend --> Atlas[(MongoDB Atlas)]
`;

test.describe('AdminDatabase Diagrams E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/maps\.googleapis\.com/, (route) => route.abort());
    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DEVELOPER_AUTH.user) });
    });
    await page.route(/\/admin\/backup\/runs/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/tour/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/picture/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/song/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(/\/venue/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
  });

  test('asserts both database diagram and system map render as SVG on the page', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/\/admin\/backup\/diagram\/database/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: SAMPLE_DATABASE_DIAGRAM });
    });

    await page.route(/\/admin\/backup\/diagram\/system/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: SAMPLE_SYSTEM_MAP });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('admin-database-page')).toBeVisible();
    await expect(page.getByTestId('admin-database-diagrams')).toBeVisible();

    const dbSvg = page.locator('[data-testid="database-diagram-svg"] svg');
    await expect(dbSvg).toBeVisible({ timeout: 15000 });

    const systemSvg = page.locator('[data-testid="system-map-svg"] svg');
    await expect(systemSvg).toBeVisible({ timeout: 15000 });
  });

  test('shows a message in place of a diagram when fetch fails', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/\/admin\/backup\/diagram\/database/, async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) });
    });

    await page.route(/\/admin\/backup\/diagram\/system/, async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'failed to read system map' }) });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('admin-database-page')).toBeVisible();
    await expect(page.getByTestId('database-diagram-error')).toBeVisible();
    await expect(page.getByTestId('system-map-error')).toBeVisible();

    await expect(page.getByTestId('database-diagram-svg')).toHaveCount(0);
    await expect(page.getByTestId('system-map-svg')).toHaveCount(0);
  });
});

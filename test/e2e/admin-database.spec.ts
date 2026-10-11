import { test, expect } from '@playwright/test';

const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature';
const NON_DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiIsImV4cCI6OTk5OTk5OTk5OX0.signature';

const DEVELOPER_AUTH = {
  isAuthenticated: true,
  error: '',
  token: DEV_TOKEN,
  user: {
    userType: 'Developer',
    email: 'josh@web-jam.com',
  },
};

const NON_ADMIN_AUTH = {
  isAuthenticated: true,
  error: '',
  token: NON_DEV_TOKEN,
  user: {
    userType: 'JaM-admin',
    email: 'admin@web-jam.com',
  },
};

const SAMPLE_RUNS = [
  {
    name: '2026-10-10T12-00-00-000Z',
    startTime: '2026-10-10T12:00:00.000Z',
    startedAt: '2026-10-10T12:00:00.000Z',
    trigger: 'daily check',
    state: 'good',
    size: 5800000,
    dropboxPath: '/webjam-backups/2026-10-10T12-00-00-000Z',
    path: '/webjam-backups/2026-10-10T12-00-00-000Z',
    collections: {
      webjamsalem: { users: 10, gigs: 142 },
    },
    databases: {
      webjamsalem: { ok: true, collections: { users: 10, gigs: 142 } },
    },
  },
  {
    name: '2026-10-09T08-00-00-000Z',
    startTime: '2026-10-09T08:00:00.000Z',
    startedAt: '2026-10-09T08:00:00.000Z',
    trigger: 'backup button',
    state: 'failed',
    size: null,
    dropboxPath: '/webjam-backups/2026-10-09T08-00-00-000Z',
    path: '/webjam-backups/2026-10-09T08-00-00-000Z',
    collections: {},
    databases: {},
  },
];

test.describe('AdminDatabase E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/maps\.googleapis\.com/, route => route.abort());
    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DEVELOPER_AUTH.user) });
    });
    await page.route(/\/user\/user-456/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(NON_ADMIN_AUTH.user) });
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

  test('Developer role accesses /admin/database and views page', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/\/admin\/backup\/runs/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_RUNS) });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('admin-database-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin Database' })).toBeVisible();
  });

  test('Non-Developer and unauthenticated users cannot access /admin/database', async ({ context, page }) => {
    // 1. Unauthenticated test
    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('admin-database-unauthorized')).toBeVisible();
    await expect(page.getByTestId('admin-database-page')).toHaveCount(0);

    // 2. Non-Developer role (JaM-admin) test
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, NON_ADMIN_AUTH);

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('admin-database-unauthorized')).toBeVisible();
    await expect(page.getByTestId('admin-database-page')).toHaveCount(0);
  });

  test('Status line displays age in red when no good run exists', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    const failedRunsOnly = [
      {
        name: '2026-10-09T08-00-00-000Z',
        startTime: '2026-10-09T08:00:00.000Z',
        startedAt: '2026-10-09T08:00:00.000Z',
        trigger: 'daily check',
        state: 'failed',
        size: null,
        dropboxPath: '',
        path: '',
        collections: {},
        databases: {},
      },
    ];

    await page.route(/\/admin\/backup\/runs/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(failedRunsOnly) });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    const ageElement = page.getByTestId('newest-good-run-age');
    await expect(ageElement).toBeVisible();
    await expect(ageElement).toHaveText('none');
    await expect(ageElement).toHaveCSS('color', 'rgb(211, 47, 47)');

    const mostRecentElement = page.getByTestId('most-recent-run-result');
    await expect(mostRecentElement).toHaveText('failed');
  });

  test('Table lists runs newest first with expandable database/collection details', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/\/admin\/backup\/runs/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_RUNS) });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    // Verify row contents
    const firstRow = page.getByTestId('backup-run-row-2026-10-10T12-00-00-000Z');
    await expect(firstRow).toBeVisible();
    await expect(page.getByTestId('run-time-2026-10-10T12-00-00-000Z')).toHaveText('2026-10-10 12:00:00');
    await expect(page.getByTestId('run-trigger-2026-10-10T12-00-00-000Z')).toHaveText('daily check');
    await expect(page.getByTestId('run-state-2026-10-10T12-00-00-000Z')).toHaveText('good');
    await expect(page.getByTestId('run-counts-2026-10-10T12-00-00-000Z')).toHaveText('152 records across 2 collections');
    await expect(page.getByTestId('run-path-2026-10-10T12-00-00-000Z')).toHaveText('/webjam-backups/2026-10-10T12-00-00-000Z');

    // Expand details
    const expandBtn = page.getByTestId('backup-run-expand-2026-10-10T12-00-00-000Z');
    await expandBtn.click();

    const details = page.getByTestId('backup-run-details-2026-10-10T12-00-00-000Z');
    await expect(details).toBeVisible();
    await expect(details.getByText('Database: webjamsalem')).toBeVisible();
    await expect(details.getByText('users')).toBeVisible();
    await expect(details.getByText('gigs')).toBeVisible();
    await expect(details.getByText('142')).toBeVisible();
  });

  test('Back up now button triggers backup, polls operation, and displays result', async ({ context, page }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    let backupStarted = false;
    let operationPolled = false;

    await page.route(/\/admin\/backup\/runs/, async (route) => {
      if (route.request().method() === 'POST') {
        backupStarted = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ name: '2026-10-11T12-00-00-000Z', message: 'backup started' }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_RUNS) });
    });

    await page.route(/\/admin\/backup\/operations\/2026-10-11T12-00-00-000Z/, async (route) => {
      operationPolled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: '2026-10-11T12-00-00-000Z', status: 'completed' }),
      });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    const backupBtn = page.getByTestId('backup-now-button');
    await expect(backupBtn).toBeVisible();
    await backupBtn.click();

    // Polling triggers operation check
    const resultAlert = page.getByTestId('backup-result');
    await expect(resultAlert).toBeVisible();
    await expect(resultAlert).toContainText('Backup completed successfully');

    expect(backupStarted).toBe(true);
    expect(operationPolled).toBe(true);
  });
});

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

test.describe('AdminDatabase Dialogs E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript((auth) => {
      localStorage.setItem('auth', JSON.stringify(auth));
    }, DEVELOPER_AUTH);

    await page.route(/maps\.googleapis\.com/, (route) => route.abort());
    await page.route(/\/user\/user-123/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(DEVELOPER_AUTH.user) });
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
    await page.route(/\/admin\/backup\/runs(?:\?.*)?$/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SAMPLE_RUNS) });
      } else {
        await route.fallback();
      }
    });
  });

  test('runs Restore workflow to completion with typed date guard and side-by-side counts', async ({ page }) => {
    let restoreTriggered = false;
    let operationPolled = false;

    await page.route(/\/admin\/backup\/runs\/2026-10-10T12-00-00-000Z\/restore/, async (route) => {
      restoreTriggered = true;
      const body = route.request().postDataJSON() as { date: string };
      expect(body.date).toBe('2026-10-10');
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'restore-op-1', message: 'restore started' }),
      });
    });

    await page.route(/\/admin\/backup\/operations\/restore-op-1/, async (route) => {
      operationPolled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'restore-op-1',
          type: 'restore',
          status: 'completed',
          startedAt: '2026-10-11T12:00:00.000Z',
          finishedAt: '2026-10-11T12:00:20.000Z',
          progress: 'complete',
          result: {
            collections: [
              { collection: 'users', restored: 10, manifest: 10 },
              { collection: 'gigs', restored: 142, manifest: 142 },
            ],
            missingIndexes: [],
            indexFailures: [],
          },
        }),
      });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    const restoreBtn = page.getByTestId('restore-button');
    await expect(restoreBtn).toBeVisible();
    await restoreBtn.click();

    // Verify dialog opened
    const dialog = page.getByTestId('restore-dialog');
    await expect(dialog).toBeVisible();

    const submitBtn = page.getByTestId('restore-submit-button');
    await expect(submitBtn).toBeDisabled();

    // Type date in input
    const dateInput = page.getByTestId('restore-date-input').locator('input');
    await dateInput.fill('2026-10-10');
    await expect(submitBtn).toBeEnabled();

    // Click submit
    await submitBtn.click();

    // Result alert and collections table appear
    await expect(page.getByTestId('restore-success-alert')).toBeVisible();
    await expect(page.getByTestId('restore-collections-table')).toBeVisible();

    await expect(page.getByTestId('restore-count-users')).toHaveText('10');
    await expect(page.getByTestId('restore-manifest-users')).toHaveText('10');
    await expect(page.getByTestId('restore-count-gigs')).toHaveText('142');
    await expect(page.getByTestId('restore-manifest-gigs')).toHaveText('142');

    expect(restoreTriggered).toBe(true);
    expect(operationPolled).toBe(true);

    // Close dialog
    await page.getByTestId('restore-dialog-close').click();
    await expect(dialog).toBeHidden();
  });

  test('runs Copy to DEV workflow to completion and verifies replaced counts and read-back result', async ({ page }) => {
    let copyTriggered = false;
    let operationPolled = false;

    await page.route(/\/admin\/backup\/runs\/2026-10-10T12-00-00-000Z\/copy-to-dev/, async (route) => {
      copyTriggered = true;
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'copy-op-1', message: 'copy to DEV started' }),
      });
    });

    await page.route(/\/admin\/backup\/operations\/copy-op-1/, async (route) => {
      operationPolled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'copy-op-1',
          type: 'copy-to-dev',
          status: 'completed',
          startedAt: '2026-10-11T12:00:00.000Z',
          finishedAt: '2026-10-11T12:00:25.000Z',
          progress: 'complete',
          result: {
            collections: [
              {
                collection: 'users', copied: 10, manifest: 10, addressesReplaced: 8,
              },
              {
                collection: 'gigs', copied: 142, manifest: 142, addressesReplaced: 0,
              },
            ],
            missingIndexes: [],
            indexFailures: [],
            readBack: {
              status: 'none',
              remaining: 0,
              message: 'clean (0 real email addresses found)',
            },
            clean: true,
          },
        }),
      });
    });

    await page.goto('/admin/database', { waitUntil: 'domcontentloaded' });

    const copyBtn = page.getByTestId('copy-to-dev-button');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Verify dialog opened
    const dialog = page.getByTestId('copy-to-dev-dialog');
    await expect(dialog).toBeVisible();

    const submitBtn = page.getByTestId('copy-to-dev-submit-button');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Result alert, replaced summary, and read-back result appear
    await expect(page.getByTestId('copy-to-dev-success-alert')).toBeVisible();
    await expect(page.getByTestId('copy-total-addresses-replaced')).toContainText('8');
    await expect(page.getByTestId('copy-read-back-result')).toContainText('clean (0 real email addresses found)');

    // Verify table counts
    await expect(page.getByTestId('copy-count-users')).toHaveText('10');
    await expect(page.getByTestId('copy-manifest-users')).toHaveText('10');
    await expect(page.getByTestId('copy-replaced-users')).toHaveText('8');

    expect(copyTriggered).toBe(true);
    expect(operationPolled).toBe(true);

    // Close dialog
    await page.getByTestId('copy-to-dev-dialog-close').click();
    await expect(dialog).toBeHidden();
  });
});
